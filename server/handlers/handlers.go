package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/MazenIbrahim1/PHAJAM/server/manager"
)

// Global var for password
var (
	walletPassword string
	passwordMutex sync.Mutex
)

// GetRoot returns a welcome message.
func GetRoot(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"message": "Welcome to the DolphinCoin API!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Println("Root endpoint accessed.")
}

func CreateWallet(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Password string `json:"password"`
	}

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		log.Printf("Error decoding JSON payload: %v", err)
		return
	}

	// Validate password
	if len(request.Password) < 8 || len(request.Password) > 15 {
		http.Error(w, `{"error": "Password must be between 8 and 15 characters"}`, http.StatusBadRequest)
		log.Printf("Password validation failed for request: %+v", request)
		return
	}

	log.Println("Creating a new wallet...")
	seed, err := manager.CreateWallet(request.Password)
	if err != nil {
		// Handle wallet creation error
		http.Error(w, `{"error": "Failed to create wallet"}`, http.StatusInternalServerError)
		log.Printf("Failed to create wallet: %v", err)
		return
	}

	// Store the password globally (with mutex for thread safety)
	passwordMutex.Lock()
	walletPassword = request.Password
	passwordMutex.Unlock()

	// Respond with the wallet seed if successful
	response := struct {
		Message string `json:"message"`
		Seed    string `json:"seed"`
	}{
		Message: "Wallet created successfully",
		Seed:    seed,
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, `{"error": "Failed to encode response"}`, http.StatusInternalServerError)
		log.Printf("Error encoding response: %v", err)
		return
	}

	log.Println("Wallet created successfully, seed returned.")
}

// CheckWallet verifies if a wallet exists on the system.
func CheckWallet(w http.ResponseWriter, r *http.Request) {
	exists := manager.WalletExists() // Ensure this function is implemented in your manager package
	response := map[string]bool{"exists": exists}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Printf("Wallet existence check: %v", exists)
}

// Login logs in the user by unlocking the wallet.
func Login(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Password string `json:"password"`
	}

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		log.Printf("Error decoding JSON payload: %v", err)
		return
	}

	// Validate the provided password
	passwordMutex.Lock()
	defer passwordMutex.Unlock()

	if walletPassword != request.Password {
		w.WriteHeader(http.StatusUnauthorized)
		response := map[string]interface{}{
			"message": "Incorrect password",
			"value":   false,
		}
		json.NewEncoder(w).Encode(response)
		log.Println("Login attempt failed: Incorrect password.")
		return
	}

	// Start wallet services
	if err := manager.StartWalletServer(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		response := map[string]interface{}{
			"message": "Failed to start wallet services.",
			"value":   false,
		}
		json.NewEncoder(w).Encode(response)
		log.Printf("Error starting wallet services: %v", err)
		return
	}

	// Simulate delay to mimic wallet unlocking (if needed)
	time.Sleep(3 * time.Second)

	// Respond with success
	w.WriteHeader(http.StatusOK)
	response := map[string]interface{}{
		"message": "Logged in successfully.",
		"value":   true,
	}
	json.NewEncoder(w).Encode(response)
	log.Println("Wallet login successful.")
}


// DeleteWallet handles the deletion of an account
func DeleteWallet(w http.ResponseWriter, r *http.Request) {
	if err := manager.DeleteWallet(); err != nil {
		http.Error(w, "Failed to delete wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := manager.StopWallet(); err != nil {
		http.Error(w, `{"error": "Failed to stop wallet service"}`, http.StatusInternalServerError)
		log.Printf("Error stopping wallet service: %v", err)
		return
	}

	// Respond with success message
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Wallet deleted successfully!")
}


// Logout locks the wallet and stops services.
func Logout(w http.ResponseWriter, r *http.Request) {
	if err := manager.StopWallet(); err != nil {
		http.Error(w, `{"error": "Failed to stop wallet service"}`, http.StatusInternalServerError)
		log.Printf("Error stopping wallet service: %v", err)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Wallet locked and services stopped successfully!"})
	log.Println("Wallet logout successful.")
}

// GetNewAddress generates a new wallet address.
func GetNewAddress(w http.ResponseWriter, r *http.Request) {
	newAddress, err := manager.CallDolphinCmd("getnewaddress")
	if err != nil {
		http.Error(w, `{"error": "Failed to generate new address"}`, http.StatusInternalServerError)
		log.Printf("Error generating new address: %v", err)
		return
	}

	response := map[string]string{"newAddress": newAddress}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Println("New wallet address generated successfully.")
}

// GetBalance retrieves the wallet balance.
func GetBalance(w http.ResponseWriter, r *http.Request) {
	balance, err := manager.BtcctlCommand("getbalance")
	if err != nil {
		http.Error(w, "Failed to retrieve balance: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]string{"balance": balance}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Println("Wallet balance retrieved successfully.")
}

// Mine triggers mining of a specified number of blocks.
func Mine(w http.ResponseWriter, r *http.Request) {
	var request struct {
		NumBlocks int `json:"num_blocks"`
	}

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.NumBlocks <= 0 {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		log.Printf("Invalid request payload: %v", err)
		return
	}

	// Start mining
	cmd := fmt.Sprintf("generate %d", request.NumBlocks)
	output, err := manager.CallDolphinCmd(cmd)
	if err != nil {
		http.Error(w, `{"error": "Failed to start mining"}`, http.StatusInternalServerError)
		log.Printf("Error starting mining: %v", err)
		return
	}

	blockHashes := strings.Split(strings.TrimSpace(output), "\n")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Mining started successfully",
		"block_hash": blockHashes,
	})
	log.Println("Mining started successfully.")
}

// SendToAddress sends funds to a specific address.
func SendToAddress(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Address string `json:"address"`
		Amount  string `json:"amount"`
	}

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		log.Printf("Error decoding JSON payload: %v", err)
		return
	}

	// Validate recipient address
	if err := manager.ValidateAddress(request.Address); err != nil {
		http.Error(w, `{"error": "Invalid recipient address"}`, http.StatusBadRequest)
		log.Printf("Invalid recipient address: %v", err)
		return
	}

	// Get wallet balance
	balance, err := manager.GetWalletBalance()
	if err != nil {
		http.Error(w, `{"error": "Failed to retrieve balance"}`, http.StatusInternalServerError)
		log.Printf("Error retrieving wallet balance: %v", err)
		return
	}

	// Validate amount
	amountFloat, err := strconv.ParseFloat(request.Amount, 64)
	if err != nil || amountFloat > balance {
		http.Error(w, `{"error": "Insufficient funds or invalid amount"}`, http.StatusBadRequest)
		log.Printf("Error validating amount: %v", err)
		return
	}

	// Send funds
	txid, err := manager.CallDolphinCmd(fmt.Sprintf("sendtoaddress %s %s", request.Address, request.Amount))
	if err != nil {
		http.Error(w, `{"error": "Failed to send funds"}`, http.StatusInternalServerError)
		log.Printf("Error sending funds: %v", err)
		return
	}

	// Respond with success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Funds sent successfully!",
		"txid":    txid,
	})
	log.Println("Funds sent successfully.")
}
