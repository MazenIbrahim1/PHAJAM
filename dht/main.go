package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/ipfs/go-cid"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/multiformats/go-multihash"
)

var (
	dhtRoute       *dht.IpfsDHT
	ctx            context.Context
	connectedPeers = make(map[string]struct{})
	node           host.Host
)

func main() {
	// Find local IPv4 address and location
	ip := getLocalIPv4Address()
	if ip != "" {
		fmt.Println("Local IPv4 Address: ", ip)
	} else {
		fmt.Println("No local IPv4 address found")
	}
	location := ""
	geoInfo, geoErr := getGeolocation()
	if geoErr != nil {
		fmt.Printf("Failed to get location: %v\n", geoErr)
	} else {
		location = geoInfo.Region + ", " + geoInfo.Country
	}
	fmt.Println("Location: ", location)
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
	makeReservation(node)                // make reservation on relay node
	go refreshReservation(node, 10*time.Minute)

	connectToPeer(node, native_bootstrap)
	// connectToPeer(node, bootstrap_node_addr_1) // connect to bootstrap node
	// connectToPeer(node, bootstrap_node_addr_2)

	go handlePeerExchange(node)
	go receiveDataFromPeer(node)
	mux := http.NewServeMux()
	mux.HandleFunc("/getproviders", getProviders)
	mux.HandleFunc("/upload", handleFileUpload)
	mux.HandleFunc("/files", handleFetchFiles)
	mux.HandleFunc("/delete", handleDeleteFile)
	mux.HandleFunc("/purchase", handlePurchase)
	// New handler for returning Peer ID
	type ProxyRequest struct {
		Action     string `json:"action"`
		Name       string `json:"name"`
		InitialFee string `json:"initialFee"`
		Price      string `json:"price"`
		// WalletAddress string `json:"walletAddress"`
	}
	mux.HandleFunc("/registerProxy", func(w http.ResponseWriter, r *http.Request) {
		var req ProxyRequest
		err := json.NewDecoder(r.Body).Decode(&req)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		// Call registerProxyAsService based on the action (register or deregister)
		if req.Action == "deregister" {
			// Deregister the proxy by passing an empty string for the IP
			registerProxyAsService(ctx, dhtRoute, "", "", "", "", "", node)
		} else if req.Action == "register" {
			// Register the proxy by passing the IP address
			registerProxyAsService(ctx, dhtRoute, location, ip, req.Name, req.InitialFee, req.Price, node)
		} else {
			http.Error(w, "Invalid action", http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Registered as a proxy",
		})
	})
	mux.HandleFunc("/isProxy", func(w http.ResponseWriter, r *http.Request) {
		proxyInfo, err := getProxyInfo(ctx, dhtRoute, node.ID().String())
		if err != nil {
			http.Error(w, "Failed to retrieve proxy information", http.StatusInternalServerError)
			return
		}
		if proxyInfo == nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]bool{
				"isProxy": false,
			})
		} else {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]bool{
				"isProxy": true,
			})
		}
	})
	mux.HandleFunc("/mapPeerIDtoWallet", func(w http.ResponseWriter, r *http.Request) {
		var requestBody struct {
			WalletAddress string `json:"walletAddress"`
		}
	
		err := json.NewDecoder(r.Body).Decode(&requestBody)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
	
		if requestBody.WalletAddress == "" {
			http.Error(w, "Wallet address is required", http.StatusBadRequest)
			return
		}
	
		// Call mapPeerIDtoWallet function
		mapPeerIDtoWallet(ctx, dhtRoute, requestBody.WalletAddress, node)
	
		// Respond with success
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Wallet address mapped successfully",
			"peerID":  node.ID().String(),
			"wallet":  requestBody.WalletAddress,
		})
	})
	mux.HandleFunc("/getWalletAddress", func(w http.ResponseWriter, r *http.Request) {
		var requestBody struct {
			PeerID string `json:"peerID"`
		}
		
		err := json.NewDecoder(r.Body).Decode(&requestBody)
		if err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		if requestBody.PeerID == "" {
			http.Error(w, "PeerID is required", http.StatusBadRequest)
			return
		}

		proxyInfo, err := getProxyInfo(ctx, dhtRoute, requestBody.PeerID)
		if err != nil {
			http.Error(w, "Failed to get wallet address", http.StatusInternalServerError)
			return
		}

		if proxyInfo == nil {
			http.Error(w, "No proxy information found for the provided PeerID", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"peerID":      requestBody.PeerID,
			// "wallet":      proxyInfo.Wallet,
		})
	})
	mux.HandleFunc("/fetchProxyList", func(w http.ResponseWriter, r *http.Request) {
		var proxyInfoList []ProxyInfo
		for peerID := range connectedPeers {
			proxyInfo, err := getProxyInfo(ctx, dhtRoute, peerID)
			if err != nil {
				// fmt.Printf("Failed to get proxy info for peer %s: %v\n", peerID, err)
				continue
			}
			if proxyInfo != nil {
				proxyInfoList = append(proxyInfoList, *proxyInfo)
			}
		}
		for _, proxyInfo := range proxyInfoList {
			fmt.Printf("PeerID: %s\n IP: %s\n Port: %d\n", proxyInfo.PeerID, proxyInfo.IPAddress, proxyInfo.Port)
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		err := json.NewEncoder(w).Encode(proxyInfoList)
		if err != nil {
			// Handle error if the encoding fails
			http.Error(w, "Failed to encode response to JSON", http.StatusInternalServerError)
		}
	})
	provideAllUpload()
	fmt.Println("Starting server at port 8080")
	if err := http.ListenAndServe("0.0.0.0:8080", enableCORS(logRequests(mux))); err != nil {
		fmt.Println("Error starting server: ", err)
	}
	defer node.Close()
	select {}
}

func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Received request: Method=%s, URL=%s, RemoteAddr=%s", r.Method, r.URL.String(), r.RemoteAddr)
		next.ServeHTTP(w, r)
	})
}

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

type GeolocationResponse struct {
	Region string `json:"region"`
	Country string `json:"country"`
}

func getGeolocation() (*GeolocationResponse, error) {
	resp, err := http.Get("https://ipinfo.io/json")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read the response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Parse the JSON response
	var geoInfo GeolocationResponse
	err = json.Unmarshal(body, &geoInfo)
	if err != nil {
		return nil, err
	}

	return &geoInfo, nil
}

func provideAllUpload() {
	records, err := FetchAllFileRecords()
	if err != nil {
		log.Printf("Failed to fetch all file records")
		return
	}
	for _, record := range records {
		err = dhtRoute.PutValue(ctx, "/orcanet/files/"+node.ID().String()+"/"+record["hash"].(string), []byte(strconv.FormatFloat(record["cost"].(float64), 'f', -1, 64)))
		if err != nil {
			log.Printf("Failed to put %v: %v, err: %v", "/orcanet/files/"+node.ID().String()+"/"+record["hash"].(string), record["cost"].(float64), err)
		}
		err = provideKey(ctx, dhtRoute, record["hash"].(string), true)
		if err != nil {
			log.Printf("Failed to provide record for key: %v, err: %v", record["hash"], err)
		}
	}
}

func handlePurchase(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request body", http.StatusInternalServerError)
		return
	}
	var request struct {
		Id   string `json:"id"`
		Hash string `json:"hash"`
		Cost int `json:"cost"`
		Address string `json:"address"`
	}
	err = json.Unmarshal(body, &request)
	if err != nil {
		http.Error(w, "Error parsing JSON request body", http.StatusBadRequest)
		return
	}
	request.Hash = strings.TrimSpace(request.Hash)
	sendDataToPeer(node, request.Id, "EXIST:"+request.Hash)
	exist := <-dataChannel

	if string(exist) == "false" {
		http.Error(w, "File is no longer provided", http.StatusNotFound)
		return
	}

	sendDataToPeer(node, request.Id, "NAME:"+request.Hash)

	// Retrieve filename from dataChannel
	filename := <-dataChannel

	sendDataToPeer(node, request.Id, "REQUEST:"+request.Hash)
	data := <-dataChannel

	// Set headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Expose-Headers", "Content-Disposition")
	w.Header().Set("Content-Type", "application/octet-stream")                                // Indicate raw binary data
	w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, filename)) // Send filename
	w.WriteHeader(http.StatusOK)

	// SEND MONEY
	recipientAddress := request.Address
	cost := request.Cost                                   

	walletServerURL := "http://localhost:18080/wallet/send"
	paymentRequest := fmt.Sprintf(`{"address": "%s", "amount": "%d"}`, recipientAddress, cost)

	resp, err := http.Post(walletServerURL, "application/json", bytes.NewBuffer([]byte(paymentRequest)))
	if err != nil {
		http.Error(w, "Error sending payment request to btcwallet server", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		http.Error(w, fmt.Sprintf("Payment failed with status: %s", resp.Status), http.StatusInternalServerError)
		return
	}

	log.Println("Payment successful to wallet:", recipientAddress, "Amount:", cost)

	// Write the raw file data to the response body
	if _, err := w.Write(data); err != nil {
		http.Error(w, "Error writing raw data to response", http.StatusInternalServerError)
	}
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
	request.Hash = strings.TrimSpace(request.Hash)
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
	var resp []map[string]string
	for _, provider := range providers {
		cost, err := dhtRoute.GetValue(ctx, "/orcanet/files/"+provider.ID.String()+"/"+request.Hash)
		if err == nil && string(cost) != "null" {
			var temp = make(map[string]string)
			if provider.ID == node.ID() {
				temp["id"] = "Me"
			} else {
				temp["id"] = provider.ID.String()
			}
			temp["cost"] = string(cost)
			resp = append(resp, temp)
		}
	}
	fmt.Printf("resp: %v", resp)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		http.Error(w, "Error encoding response to JSON", http.StatusInternalServerError)
	}
}

func getLocalIPv4Address() string {
	// Get all interfaces on the local machine
	interfaces, err := net.Interfaces()
	if err != nil {
		log.Fatal(err)
	}

	for _, iface := range interfaces {
		// Skip loopback interface (127.0.0.1) and interfaces that are down
		if (iface.Flags&net.FlagUp) == 0 || iface.Name == "lo" {
			continue
		}

		// Get the addresses associated with this interface
		addrs, err := iface.Addrs()
		if err != nil {
			log.Fatal(err)
		}

		// Look for an IPv4 address
		for _, addr := range addrs {
			if ipnet, ok := addr.(*net.IPNet); ok && ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return ""
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

	err = dhtRoute.PutValue(ctx, "/orcanet/files/"+node.ID().String()+"/"+fileHash, []byte(strconv.FormatFloat(priceFloat, 'f', -1, 64)))
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to put record for key %v and value %v", fileHash, priceFloat), http.StatusInternalServerError)
		log.Printf("Failed to put record for key %v and value %v: %v\n", fileHash, priceFloat, err)
		return
	}
	err = provideKey(ctx, dhtRoute, fileHash, true)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to provide record for key: %v", fileHash), http.StatusInternalServerError)
		log.Printf("Failed to provide record for key: %v", fileHash)
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

	err = dhtRoute.PutValue(ctx, "/orcanet/files/"+node.ID().String()+"/"+request.Hash, []byte("null"))
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to put record for key %v and value null", request.Hash), http.StatusInternalServerError)
		log.Printf("Failed to put record for key %v and value null: %v\n", request.Hash, err)
		return
	}
	err = provideKey(ctx, dhtRoute, request.Hash, false)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to stop providing record for key: %v", request.Hash), http.StatusInternalServerError)
		log.Printf("Failed to provide record for key: %v", request.Hash)
		return
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}