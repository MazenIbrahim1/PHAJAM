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
	//go handleInput(ctx, dhtRoute)
	http.HandleFunc("/getproviders", getProviders)
	http.HandleFunc("/upload", handleFileUpload)
	fmt.Println("Starting server at port 8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
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

	err := r.ParseMultipartForm(10 << 20)
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

	hasher := sha256.New()
	if _, err := io.Copy(hasher, file); err != nil {
		http.Error(w, fmt.Sprintf("Failed to hash file: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to hash file: %v", err)
		return
	}
	fileHash := hex.EncodeToString(hasher.Sum(nil))
	log.Printf("File hash computed: %s", fileHash)

	err = StoreFileRecord(fileHash, header.Filename)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to store file metadata: %v", err), http.StatusInternalServerError)
		log.Printf("Failed to store file metadata: %v", err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message":  "File uploaded successfully",
		"hash":     fileHash,
		"filename": header.Filename,
	})
}
