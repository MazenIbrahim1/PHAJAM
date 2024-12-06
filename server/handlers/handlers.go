package handlers

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
}
