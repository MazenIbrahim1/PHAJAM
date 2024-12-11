package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/MazenIbrahim1/PHAJAM/server/handlers"
	"github.com/MazenIbrahim1/PHAJAM/server/manager"
	"github.com/rs/cors"
)

func main() {
	// Step 1: Initialize the DolphinCoin backend
	if err := manager.Initialize(); err != nil {
		log.Fatalf("Initialization failed: %v", err)
	}

	// Step 2: Set up HTTP routes for the API
	setupRoutes()

	// Step 3: Handle graceful shutdown
	handleGracefulShutdown()

	corsOptions := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173"},         // Explicitly specify allowed origins
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},        // Allowed HTTP methods
		AllowedHeaders:   []string{"Content-Type", "Authorization"}, // Allowed request headers
		AllowCredentials: true,                                      // Allow credentials (e.g., cookies)
	})

	handler := corsOptions.Handler(http.DefaultServeMux)

	// Step 4: Start the HTTP server
	const serverAddr = ":18080"
	log.Printf("Server is starting on %s...\n", serverAddr)
	if err := http.ListenAndServe(serverAddr, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// setupRoutes registers all HTTP routes defined in the handlers package
func setupRoutes() {
	http.HandleFunc("/", handlers.GetRoot)
	http.HandleFunc("/wallet/check", handlers.CheckWallet)
	http.HandleFunc("/wallet/create", handlers.CreateWallet)
	http.HandleFunc("/wallet/add-transaction", handlers.AddTransaction)
	http.HandleFunc("/wallet/getTransactionHistory", handlers.GetTransactionHistory)
	http.HandleFunc("/wallet/delete", handlers.DeleteWallet)
	http.HandleFunc("/wallet/password-reset", handlers.ResetPassword)
	http.HandleFunc("/wallet/login", handlers.Login)
	http.HandleFunc("/wallet/logout", handlers.Logout)
	http.HandleFunc("/wallet/address", handlers.GetDefaultAddress)
	http.HandleFunc("/wallet/balance", handlers.GetBalance)
	http.HandleFunc("/wallet/mine", handlers.Mine)
	http.HandleFunc("/wallet/send", handlers.SendToAddress)
}

// handleGracefulShutdown ensures services stop cleanly when the application exits
func handleGracefulShutdown() {
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-stopChan
		log.Println("Shutdown signal received. Stopping services...")

		// Stop backend services gracefully
		if err := manager.StopServices(); err != nil {
			log.Fatalf("Failed to stop services: %v", err)
		}

		log.Println("Services stopped successfully. Exiting...")
		os.Exit(0)
	}()
}
