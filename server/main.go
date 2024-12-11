// main.go

package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/MazenIbrahim1/PHAJAM/server/handlers" // Ensure this import path matches your module structure
	"github.com/MazenIbrahim1/PHAJAM/server/manager"  // Updated to reference `manager`
)

func main() {
	// Initialize the application
	if err := manager.Initialize(); err != nil { // Changed to `manager.Initialize`
		log.Fatalf("Initialization failed: %v", err)
	}

	// Set up HTTP routes
	handlers.SetupRoutes()

	// Handle graceful shutdown
	handleGracefulShutdown()

	// Start the server
	const serverAddr = ":8080"
	log.Printf("Server is starting on %s...\n", serverAddr)

	if err := http.ListenAndServe(serverAddr, nil); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func handleGracefulShutdown() {
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-stopChan
		log.Println("Shutdown signal received. Stopping services...")
		if err := manager.StopServices(); err != nil { // Changed to `manager.StopServices`
			log.Fatalf("Failed to stop services: %v", err)
		}
		os.Exit(0)
	}()
}
