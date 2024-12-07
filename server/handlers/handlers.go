/*package handlers

import (
	"encoding/json"
	"net/http"
)

func SetupRoutes() {
	http.HandleFunc("/", getRoot)
	http.HandleFunc("/createWallet", createWallet)
	http.HandleFunc("/getBalance", getBalance)
	// Add more routes as needed
}

func getRoot(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{"message": "Welcome to Dolphin Coin!"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func createWallet(w http.ResponseWriter, r *http.Request) {
	// Logic to create a wallet
	response := map[string]string{"walletID": "12345"} // Placeholder
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func getBalance(w http.ResponseWriter, r *http.Request) {
	// Logic to get wallet balance
	response := map[string]float64{"balance": 100.50} // Placeholder
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
} */

package handlers

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/MazenIbrahim1/PHAJAM/server/manager" // Adjusted to match your project structure
)

// GetRoot returns a welcome message
func GetRoot(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"message": "Welcome to the DolphinCoin API!",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetHello provides a hello message with a timestamp
func GetHello(w http.ResponseWriter, r *http.Request) {
	response := map[string]string{
		"message":   "Hello from DolphinCoin!",
		"timestamp": time.Now().Format(time.RFC3339),
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GenerateRandomPassword generates a secure random password
func GenerateRandomPassword(length int) (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var password strings.Builder
	for i := 0; i < length; i++ {
		randomIndex, err := rand.Int(rand.Reader, big.NewInt(int64(len(charset))))
		if err != nil {
			return "", fmt.Errorf("failed to generate random index: %v", err)
		}
		password.WriteByte(charset[randomIndex.Int64()])
	}
	return password.String(), nil
}

// CreateWallet creates a new DolphinCoin wallet
func CreateWallet(w http.ResponseWriter, r *http.Request) {
	password, err := GenerateRandomPassword(12)
	if err != nil {
		http.Error(w, "Failed to generate password: "+err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = manager.CreateWallet(password)
	if err != nil {
		http.Error(w, "Failed to create wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	time.Sleep(3 * time.Second)

	newAddress, err := manager.CallDolphinCmd("getnewaddress")
	if err != nil {
		http.Error(w, "Failed to generate mining address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := manager.ConfigureMiningAddress(newAddress); err != nil {
		http.Error(w, "Failed to configure mining address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	unlockCmd := fmt.Sprintf("walletpassphrase %s %d", password, 60*60)
	if _, err := manager.CallDolphinCmd(unlockCmd); err != nil {
		http.Error(w, "Failed to unlock wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"message":       "Wallet created and mining address configured successfully!",
		"password":      password,
		"miningAddress": newAddress,
	})
}

// Login logs in the user by unlocking the wallet and starting DolphinCoin services
func Login(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := manager.StartWallet(); err != nil {
		http.Error(w, "Failed to start wallet. Please create a wallet first.", http.StatusUnauthorized)
		return
	}

	time.Sleep(3 * time.Second)

	unlockCmd := fmt.Sprintf("walletpassphrase %s %d", request.Password, 60*60)
	if _, err := manager.CallDolphinCmd(unlockCmd); err != nil {
		http.Error(w, "Failed to unlock wallet: "+err.Error(), http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Logged in successfully."})
}

// Logout locks the wallet and stops DolphinCoin services
func Logout(w http.ResponseWriter, r *http.Request) {
	if _, err := manager.CallDolphinCmd("walletlock"); err != nil {
		http.Error(w, "Failed to lock wallet: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err := manager.StopWallet(); err != nil {
		http.Error(w, "Failed to stop wallet service: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Wallet locked and services stopped successfully!",
	})
}

// GetNewAddress generates a new wallet address
func GetNewAddress(w http.ResponseWriter, r *http.Request) {
	newAddress, err := manager.CallDolphinCmd("getnewaddress")
	if err != nil {
		http.Error(w, "Failed to generate new address: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]string{"newAddress": newAddress}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetBalance retrieves the wallet balance
func GetBalance(w http.ResponseWriter, r *http.Request) {
	balance, err := manager.CallDolphinCmd("getbalance")
	if err != nil {
		http.Error(w, "Failed to retrieve balance: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]string{"balance": balance}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Mine triggers mining of a specified number of blocks
func Mine(w http.ResponseWriter, r *http.Request) {
	var request struct {
		NumBlocks int `json:"num_blocks"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil || request.NumBlocks <= 0 {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	cmd := fmt.Sprintf("generate %d", request.NumBlocks)
	output, err := manager.CallDolphinCmd(cmd)
	if err != nil {
		http.Error(w, "Failed to start mining: "+err.Error(), http.StatusInternalServerError)
		return
	}

	blockHashes := strings.Split(strings.TrimSpace(output), "\n")
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Mining started successfully",
		"block_hash": blockHashes,
	})
}

// SendToAddress sends funds to a specific address
func SendToAddress(w http.ResponseWriter, r *http.Request) {
	var request struct {
		Address string `json:"address"`
		Amount  string `json:"amount"`
	}
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	if err := manager.ValidateAddress(request.Address); err != nil {
		http.Error(w, "Invalid recipient address: "+err.Error(), http.StatusBadRequest)
		return
	}

	balance, err := manager.GetWalletBalance()
	if err != nil {
		http.Error(w, "Failed to retrieve balance: "+err.Error(), http.StatusInternalServerError)
		return
	}

	amount, err := strconv.ParseFloat(request.Amount, 64)
	if err != nil || amount > balance {
		http.Error(w, "Insufficient funds or invalid amount.", http.StatusBadRequest)
		return
	}

	txid, err := manager.CallDolphinCmd(fmt.Sprintf("sendtoaddress %s %s", request.Address, request.Amount))
	if err != nil {
		http.Error(w, "Failed to send funds: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Funds sent successfully!",
		"txid":    txid,
	})
}
