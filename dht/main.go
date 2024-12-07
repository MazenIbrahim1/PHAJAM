package main

import (
	"context"
	"fmt"
	"log"
	"time"
)

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

	node, dht, err := createNode()
	if err != nil {
		log.Fatalf("Failed to create node: %s", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	globalCtx = ctx

	fmt.Println("Node multiaddresses:", node.Addrs())
	fmt.Println("Node Peer ID:", node.ID())

	connectToPeer(node, relay_node_addr) // connect to relay node
	makeReservation(node)                // make reservation on realy node
	go refreshReservation(node, 10*time.Minute)
	connectToPeer(node, native_bootstrap_node_addr) // connect to bootstrap node
	go handlePeerExchange(node)
	go handleInput(node, ctx, dht)

	// receiveDataFromPeer(node)
	// sendDataToPeer(node, "12D3KooWH9ueKgaSabBREoZojztRT9nFi2xPn6F2MworJk494ob9")

	defer node.Close()

	select {}
}
