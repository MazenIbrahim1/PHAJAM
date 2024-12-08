package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/multiformats/go-multihash"
)

var (
	dhtRoute *dht.IpfsDHT
	ctx      context.Context
)

// CORS middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow all origins
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func getProviders(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading req body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Hash string `json:"hash"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON req body", http.StatusBadRequest)
		return
	}
	fmt.Println("hash: ", request.Hash)
	data := []byte(request.Hash)
	hash := sha256.Sum256(data)
	mh, err := multihash.EncodeName(hash[:], "sha2-256")
	if err != nil {
		http.Error(w, "Error creating multihash", http.StatusInternalServerError)
		return
	}
	c := cid.NewCidV1(cid.Raw, mh)
	providers, err := dhtRoute.FindProviders(ctx, c)
	if err != nil {
		http.Error(w, "Error finding providers", http.StatusInternalServerError)
		return
	}
	fmt.Println("Providers sync: ", providers)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(providers); err != nil {
		http.Error(w, "Error encoding response to JSON", http.StatusInternalServerError)
	}
}

func main() {
	err := InitializeDatabase("mongodb://localhost:27017")
	if err != nil {
		fmt.Printf("Failed to initialize MongoDB: %v\n", err)
		return
	}
	defer func() {
		if err := DisconnectDatabase(); err != nil {
			fmt.Printf("Failed to disconnect MongoDB: %v\n", err)
		}
	}()
	var node host.Host
	node, dhtRoute, err = createNode()
	if err != nil {
		log.Fatalf("Failed to create node: %s", err)
	}

	var cancel context.CancelFunc
	ctx, cancel = context.WithCancel(context.Background())
	defer cancel()
	globalCtx = ctx

	fmt.Println("Node multiaddresses:", node.Addrs())
	fmt.Println("Node Peer ID:", node.ID())

	connectToPeer(node, relay_node_addr) // connect to relay node
	makeReservation(node)                // make reservation on realy node
	go refreshReservation(node, 10*time.Minute)
	connectToPeer(node, native_bootstrap_node_addr) // connect to bootstrap node
	go handlePeerExchange(node)
	//go handleInput(ctx, dht)

	mux := http.NewServeMux()
	mux.HandleFunc("/getproviders", getProviders)
	mux.HandleFunc("/upload", handleFileUpload)
	mux.HandleFunc("/files", handleFetchFiles)
	mux.HandleFunc("/registerProxy", registerProxy)

	// New handler for returning Peer ID
	mux.HandleFunc("/getPeerID", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"peerID": node.ID().String(),
		})
	})

	fmt.Println("Starting server at port 8080")
	if err := http.ListenAndServe(":8080", enableCORS(mux)); err != nil {
		fmt.Println("Error starting server: ", err)
	}

	// receiveDataFromPeer(node)
	// sendDataToPeer(node, "12D3KooWH9ueKgaSabBREoZojztRT9nFi2xPn6F2MworJk494ob9")

	defer node.Close()

	select {}
}

func handleFileUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		log.Printf("Invalid request method: %s", r.Method)
		return
	}

	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse form: %v", err), http.StatusBadRequest)
		log.Printf("Failed to parse form: %v", err)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to retrieve file: %v", err), http.StatusBadRequest)
		log.Printf("Failed to retrieve file: %v", err)
		return
	}
	defer file.Close()

	// Compute hash directly from the uploaded file
	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		http.Error(w, fmt.Sprintf("Failed to hash file: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to hash file: %v", err)
		return
	}
	fileHash := hex.EncodeToString(hasher.Sum(nil))

	// Check if the file hash already exists in the database
	existingFile, err := GetFileRecord(fileHash)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to check existing file: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to check existing file: %v", err)
		return
	}

	if existingFile != nil {
		http.Error(w, fmt.Sprintf("File exists: %v", header.Filename), http.StatusBadRequest)
		log.Printf("Duplicate file rejected: %v", fileHash)
		return
	}

	// Rewind the file reader to save the file
	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to rewind file reader: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to rewind file reader: %v", err)
		return
	}

	// Create the 'files' directory if it doesn't exist
	err = os.MkdirAll("files", os.ModePerm)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create directory: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to create directory: %v", err)
		return
	}

	// Save the file to the 'files' directory
	filePath := filepath.Join("files", header.Filename)
	dst, err := os.Create(filePath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create file in directory: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to create file in directory: %v", err)
		return
	}
	defer func() {
		dst.Close()
		// Ensure the file is deleted if an error occurs
		if err != nil {
			log.Printf("Encountered error, deleting file: %s", filePath)
			os.Remove(filePath)
		}
	}()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, fmt.Sprintf("Failed to save file: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to save file: %v", err)
		return
	}

	price := r.FormValue("price")
	if price == "" {
		http.Error(w, "Missing price", http.StatusBadRequest)
		log.Printf("Missing price")
		return
	}
	priceFloat, err := strconv.ParseFloat(price, 64)
	if err != nil {
		http.Error(w, "Invalid price value", http.StatusBadRequest)
		log.Printf("Invalid price value: %v", price)
		return
	}

	// Store file metadata in the database
	err = StoreFileRecord(fileHash, header.Filename, priceFloat)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to store file metadata: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to store file metadata: %v", err)
		return
	}

	provideKey(ctx, dhtRoute, fileHash, true)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message":  "File uploaded successfully",
		"hash":     fileHash,
		"filename": header.Filename,
	})
}

func handleFetchFiles(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	records, err := FetchAllFileRecords()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to fetch records: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(records)
}

func handleDeleteFile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		log.Printf("Invalid request method: %s", r.Method)
		return
	}

	// Parse the request body
	var request struct {
		Hash string `json:"hash"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid JSON request body", http.StatusBadRequest)
		log.Printf("Error decoding JSON request body: %v", err)
		return
	}

	if request.Hash == "" {
		http.Error(w, "Hash is required", http.StatusBadRequest)
		log.Println("Error: Hash is required")
		return
	}

	// Retrieve the file record from the database
	record, err := GetFileRecord(request.Hash)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to retrieve record: %v", err), http.StatusInternalServerError)
		log.Printf("Error retrieving file record: %v", err)
		return
	}
	if record == nil {
		http.Error(w, "File record not found", http.StatusNotFound)
		log.Printf("File record not found for hash: %s", request.Hash)
		return
	}

	// Get the filename from the record
	filename, ok := record["filename"].(string)
	if !ok {
		http.Error(w, "Invalid record format", http.StatusInternalServerError)
		log.Println("Error: Invalid record format - filename not found")
		return
	}

	// Delete the file from the filesystem
	filePath := filepath.Join("files", filename)
	if err := os.Remove(filePath); err != nil {
		if os.IsNotExist(err) {
			log.Printf("File not found on disk, skipping deletion: %s", filePath)
		} else {
			http.Error(w, fmt.Sprintf("Failed to delete file: %v", err), http.StatusInternalServerError)
			log.Printf("Error deleting file from filesystem: %v", err)
			return
		}
	}

	// Delete the record from the database
	err = DeleteFileRecord(request.Hash)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to delete record: %v", err), http.StatusInternalServerError)
		log.Printf("Error deleting file record from database: %v", err)
		return
	}

	provideKey(ctx, dhtRoute, request.Hash, false)

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}


// register a peer as a proxy
func registerProxy(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		log.Printf("Invalid request method: %s", r.Method)
		return
	}

	var request struct {
		PeerID string `json:"peerID"`
	}

	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&request)
	if err != nil {
		http.Error(w, "Error parsing JSON", http.StatusBadRequest)
		log.Printf("Error parsing JSON: %v", err)
		return
	}

	if request.PeerID == "" {
		http.Error(w, "PeerID is required", http.StatusBadRequest)
		return
	}

	// Store the peerID as a proxy
	err = StoreProxy(request.PeerID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to store proxy: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to store proxy: %v", err)
		return
	}

	log.Printf("PeerID %s registered as a proxy", request.PeerID)

	// Respond with success!
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Peer registered as a proxy",
		"peerID": request.PeerID,
	})
}