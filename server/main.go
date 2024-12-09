package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/MazenIbrahim1/PHAJAM/server/handlers" // Adjust this import path to match your module structure
	"github.com/MazenIbrahim1/PHAJAM/server/manager"  // Updated to correctly reference `manager`
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
	const serverAddr = ":8080"
	log.Printf("Server is starting on %s...\n", serverAddr)
	if err := http.ListenAndServe(serverAddr, handler); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

// setupRoutes registers all HTTP routes defined in the handlers package
func setupRoutes() {
	mux := http.NewServeMux()

	mux.HandleFunc("/", handlers.GetRoot)
	// mux.HandleFunc("/hello", handlers.GetHello)
	mux.HandleFunc("/wallet/create", handlers.CreateWallet)
	mux.HandleFunc("/wallet/check", handlers.CheckWallet)
	mux.HandleFunc("/wallet/login", handlers.Login)
	mux.HandleFunc("/wallet/logout", handlers.Logout)
	mux.HandleFunc("/wallet/address/new", handlers.GetNewAddress)
	mux.HandleFunc("/wallet/balance", handlers.GetBalance)
	mux.HandleFunc("/wallet/mine", handlers.Mine)
	mux.HandleFunc("/wallet/send", handlers.SendToAddress)

	// Wrap the mux with CORS middleware
	http.Handle("/", corsMiddleware(mux))
}

// corsMiddleware adds the necessary CORS headers to HTTP responses
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Add CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
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
