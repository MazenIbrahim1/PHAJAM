package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/btcsuite/btcd/rpcclient"
	"github.com/gorilla/mux"
)

func ConnectToBtcd() (*rpcclient.Client, error) {
	connCfg := &rpcclient.ConnConfig{
		Host:         "127.0.0.1:8332",
		User:         "user",
		Pass:         "password",
		HTTPPostMode: true, // `btcd` supports only HTTP POST mode
		DisableTLS:   true, // Only for development
	}
	return rpcclient.New(connCfg, nil)
}

func CheckBalanceHandler(w http.ResponseWriter, r *http.Request) {
	client, err := ConnectToBtcd()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer client.Shutdown()

	balance, err := client.GetBalance("*")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	log.Println("Balance value:", balance)
	fmt.Fprintf(w, "Current balance: %v", balance)
}

// Function to get block count
func CheckBlockCount(w http.ResponseWriter, r *http.Request) {
	client, err := ConnectToBtcd()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer client.Shutdown()

	block_count, err := client.GetBlockCount()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	
	log.Println("Block count value:", block_count)
	fmt.Fprintf(w, "Current block count: %d", block_count)
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/GetBalance", CheckBalanceHandler).Methods("GET")
	r.HandleFunc("/GetBlockCount", CheckBlockCount).Methods("GET")

	http.Handle("/", r)
	log.Println("Server running on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
