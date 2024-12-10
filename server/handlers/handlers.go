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
var walletDefaulAddr string

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

	// Unlock wallet
	fmt.Println("Unlocking wallet...")
	timeUnlocked := 3600*5
	command := fmt.Sprintf("walletpassphrase %s %d", walletPassword, timeUnlocked)
	_, err := manager.BtcctlCommand(command)
	if err != nil {
		fmt.Printf("Error unlocking wallet: %v\n", err)
	} else {
		fmt.Println("Wallet unlocked successfully!")
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

// ResetPassword resets the wallet password
func ResetPassword(w http.ResponseWriter, r *http.Request) {
	var request struct {
		OldPassword string `json:"oldPassword"`
		NewPassword string `json:"newPassword"`
	}

	// Parse JSON body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		log.Printf("Error decoding JSON payload: %v", err)
		return
	}

	// Command to change wallet password
	command := fmt.Sprintf("walletpassphrasechange %s %s", request.OldPassword, request.NewPassword)

	// Call the manager to execute the command
	_, err := manager.BtcctlCommand(command)
	if err != nil {
		http.Error(w, "Failed to change password: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Update password
	walletPassword = request.NewPassword

	// Response indicating success
	response := map[string]bool{"success": true}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Println("Wallet password changed successfully.")
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

func GetDefaultAddress(w http.ResponseWriter, r *http.Request) {
	defaultAddress, err := manager.BtcctlCommand("getaccountaddress default")
	if err != nil {
		http.Error(w, "Failed to retrieve balance: "+err.Error(), http.StatusInternalServerError)
		return
	}

	walletDefaulAddr = defaultAddress

	response := map[string]string{"address": defaultAddress}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
	log.Println("Default address retrieved successfully.")
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
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Invalid request payload or number of blocks",
		})
		log.Printf("Invalid request payload: %v", err)
		return
	}

	// Start mining
	cmd := fmt.Sprintf("generate %d", request.NumBlocks)
	output, err := manager.CallDolphinCmd(cmd)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Failed to start mining",
		})
		log.Printf("Error starting mining: %v", err)
		return
	}

	// Parse the response to get block hashes
	blockHashes := strings.Split(strings.TrimSpace(output), "\n")

	// Ensure blockHashes is not empty
	if len(blockHashes) == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"error": "Mining succeeded but no block hashes were returned",
		})
		log.Println("Mining succeeded but no block hashes were returned")
		return
	}

	// Send successful response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Mining started successfully",
		"block_hash": blockHashes,
	})
	log.Println("Mining started successfully:", blockHashes)
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

	// Send funds
	txid, err := manager.BtcctlCommand(fmt.Sprintf("sendtoaddress %s %s", request.Address, request.Amount))
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

// func GetTransactionHistory(w http.ResponseWriter, r *http.Request) {
// 	// Fetch transactions from the in-memory database
// 	transactions, err := manager.GetTransactions()
// 	if err != nil {
// 		http.Error(w, `{"error": "Failed to retrieve transactions"}`, http.StatusInternalServerError)
// 		log.Printf("Error retrieving transactions: %v", err)
// 		return
// 	}

// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(map[string]interface{}{
// 		"transactions": transactions,
// 	})
// 	log.Println("Transaction history retrieved successfully.")
// }

// GetTransactionHistory retrieves the transaction history from btcwallet.
func GetTransactionHistory(w http.ResponseWriter, r *http.Request) {
	// Extract query parameters
	account := r.URL.Query().Get("account")
	if account == "" {
		account = "*" // Default to all accounts if not provided
	}

	countStr := r.URL.Query().Get("count")
	count, err := strconv.Atoi(countStr)
	if err != nil || count <= 0 {
		count = 10 // Default to 10 transactions
	}

	fromStr := r.URL.Query().Get("from")
	from, err := strconv.Atoi(fromStr)
	if err != nil || from < 0 {
		from = 0 // Default to the first transaction
	}

	includeWatchOnlyStr := r.URL.Query().Get("includewatchonly")
	includeWatchOnly := includeWatchOnlyStr == "true"

	// Fetch transactions using the manager function
	transactions, err := manager.ListTransactions(account, count, from, includeWatchOnly)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch transactions"}`, http.StatusInternalServerError)
		log.Printf("Error fetching transactions: %v", err)
		return
	}

	// Respond with the transaction history
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"transactions": transactions,
	})
	log.Println("Transaction history retrieved successfully.")
}

func AddTransaction(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Type   string  `json:"type"`
		Amount float64 `json:"amount"`
		Date   string  `json:"date"`
		From   string  `json:"from"`
		To     string  `json:"to"`
		Status string  `json:"status"`
	}

	// Parse the JSON body
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		log.Printf("Error decoding JSON payload: %v", err)
		return
	}

	// Validate required fields
	if request.Type == "" || request.Amount <= 0 || request.Status == "" {
		http.Error(w, `{"error": "Invalid transaction data"}`, http.StatusBadRequest)
		log.Printf("Invalid transaction data: %+v", request)
		return
	}

	// Generate a unique transaction ID
	txid := fmt.Sprintf("%d", len(manager.GetTransactionsUnsafe())+1)

	// Create a new transaction object
	transaction := map[string]interface{}{
		"txid":   txid,
		"type":   request.Type,
		"amount": request.Amount,
		"date":   request.Date,
		"from":   request.From,
		"to":     request.To,
		"status": request.Status,
	}

	// Save the transaction
	if err := manager.AddTransaction(transaction); err != nil {
		http.Error(w, `{"error": "Failed to add transaction"}`, http.StatusInternalServerError)
		log.Printf("Error adding transaction: %v", err)
		return
	}

	// Respond with success
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     "Transaction added successfully",
		"transaction": transaction,
	})
	log.Println("Transaction added successfully:", transaction)
}

// func GetPrivateKey(w http.ResponseWriter, r *http.Request) {
// 	address := r.URL.Query().Get("address")
// 	if address == "" {
// 		http.Error(w, `{"error": "Missing wallet address"}`, http.StatusBadRequest)
// 		return
// 	}

// 	privateKey, err := manager.DumpPrivateKey(address)
// 	if err != nil {
// 		http.Error(w, `{"error": "Failed to retrieve private key"}`, http.StatusInternalServerError)
// 		return
// 	}

// 	response := map[string]string{"privateKey": privateKey}
// 	w.Header().Set("Content-Type", "application/json")
// 	json.NewEncoder(w).Encode(response)
// }
