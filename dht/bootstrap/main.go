package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	record "github.com/libp2p/go-libp2p-record"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/peerstore"
	"github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/client"
	"github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/relay"
	"github.com/multiformats/go-multiaddr"
	"github.com/multiformats/go-multihash"
)

var (
	globalCtx      context.Context
	relay_addr     = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
	bootstrap_seed = "PHAJAM"
)

func generatePrivateKeyFromSeed(seed []byte) (crypto.PrivKey, error) {
	// Generate deterministic key material
	hash := sha256.Sum256(seed)

	// Create an Ed25519 private key from the hash
	privKey, _, err := crypto.GenerateEd25519Key(
		bytes.NewReader(hash[:]),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate private key: %w", err)
	}

	return privKey, nil
}

func createNode() (host.Host, *dht.IpfsDHT, error) {
	ctx := context.Background()
	globalCtx = ctx

	customAddr, err := multiaddr.NewMultiaddr("/ip4/0.0.0.0/tcp/61000")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to parse multiaddr: %w", err)
	}

	seed := []byte(bootstrap_seed)
	privKey, err := generatePrivateKeyFromSeed(seed)
	if err != nil {
		log.Fatal(err)
	}

	node, err := libp2p.New(
		libp2p.ListenAddrs(customAddr),
		libp2p.Identity(privKey),
		libp2p.NATPortMap(),
		libp2p.EnableNATService(),
		// libp2p.EnableAutoRelay(),
		// libp2p.StaticRelays(staticRelays),
	)

	if err != nil {
		return nil, nil, err
	}
	_, err = relay.New(node)
	if err != nil {
		log.Printf("Failed to instantiate the relay: %v", err)
	}

	dhtRouting, err := dht.New(ctx, node, dht.Mode(dht.ModeServer))
	if err != nil {
		return nil, nil, err
	}

	err = dhtRouting.Bootstrap(ctx)
	if err != nil {
		return nil, nil, err
	}
	namespacedValidator := record.NamespacedValidator{
		"orcanet": &CustomValidator{}, // Add a custom validator for the "orcanet" namespace
	}
	// Configure the DHT to use the custom validator
	dhtRouting.Validator = namespacedValidator

	// Set up notifications for new connections
	node.Network().Notify(&network.NotifyBundle{
		ConnectedF: func(n network.Network, conn network.Conn) {
			go exchangePeers(node, conn.RemotePeer())
			// fmt.Printf("New peer connected: %s\n", conn.RemotePeer().String())
			// fmt.Println("peers in network", node.Network().Peers())
		},
	})

	return node, dhtRouting, nil
}

func connectToPeer(node host.Host, peerAddr string) {
	addr, err := multiaddr.NewMultiaddr(peerAddr)
	if err != nil {
		log.Printf("Failed to parse peer address: %s", err)
		return
	}

	info, err := peer.AddrInfoFromP2pAddr(addr)
	if err != nil {
		log.Printf("Failed to get AddrInfo from address: %s", err)
		return
	}
	if peerAddr != relay_addr {
		node.Peerstore().AddAddrs(info.ID, info.Addrs, peerstore.PermanentAddrTTL)
	}
	err = node.Connect(context.Background(), *info)
	if err != nil {
		log.Printf("Failed to connect to peer: %s", err)
		return
	}
	fmt.Println("Connected to:", info.ID)
}

func exchangePeers(node host.Host, newPeer peer.ID) {
	knownPeers := node.Network().Peers()
	var peerInfos []string
	data := map[string]interface{}{
		"known_peers": []map[string]string{},
	}
	var temp map[string]string
	relay_info, _ := peer.AddrInfoFromString(relay_addr)
	for _, peer := range knownPeers {
		if peer != newPeer && peer != node.ID() && peer != relay_info.ID {
			temp = make(map[string]string)
			temp["peer_id"] = peer.String()
			peerInfos = append(peerInfos, peer.String())
			data["known_peers"] = append(data["known_peers"].([]map[string]string), temp)
		}
	}

	s, err := node.NewStream(network.WithAllowLimitedConn(globalCtx, "/orcanet/p2p"), newPeer, "/orcanet/p2p")
	if err != nil {
		//log.Printf("Failed to open stream to %s: %s", newPeer, err)
		return
	}
	defer s.Close()
	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatalf("Error marshaling map to JSON: %s", err)
	}
	s.Write([]byte(jsonData))

	fmt.Printf("Shared %d peers with %s\n", len(peerInfos), newPeer.String())
}

// func handlePeerExchange(node host.Host) {
// 	node.SetStreamHandler("/orcanet/p2p", func(s network.Stream) {
// 		defer s.Close()

// 		buf := bufio.NewReader(s)
// 		for {
// 			peerAddr, err := buf.ReadString('\n')
// 			if err != nil {
// 				if err != io.EOF {
// 					log.Printf("Error reading from stream: %s", err)
// 				}
// 				return
// 			}
// 			peerAddr = strings.TrimSpace(peerAddr)

// 			// Parse the peer address
// 			addr, err := multiaddr.NewMultiaddr(peerAddr)
// 			if err != nil {
// 				log.Printf("Invalid peer address received: %s", err)
// 				continue
// 			}

// 			// Extract the peer ID from the address
// 			info, err := peer.AddrInfoFromP2pAddr(addr)
// 			if err != nil {
// 				log.Printf("Failed to extract peer info: %s", err)
// 				continue
// 			}

// 			// Add the peer to the peerstore
// 			node.Peerstore().AddAddrs(info.ID, info.Addrs, peerstore.PermanentAddrTTL)
// 			fmt.Printf("Added new peer to peerstore: %s\n", info.ID)

// 			// Optionally, try to connect to the new peer
// 			if err := node.Connect(context.Background(), *info); err != nil {
// 				log.Printf("Failed to connect to peer %s: %s", info.ID, err)
// 			} else {
// 				fmt.Printf("Connected to new peer: %s\n", info.ID)
// 			}
// 		}
// 	})
// }

func main() {
	node, dht, err := createNode()
	if err != nil {
		log.Fatalf("Failed to create node: %s", err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	fmt.Println("Node multiaddresses:", node.Addrs())
	fmt.Println("Node Peer ID:", node.ID())

	// handlePeerExchange(node)

	// go announceToDHT(ctx, dht, node)
	// go discoverPeers(ctx, dht, node)
	// go monitorPeers(node)
	connectToPeer(node, relay_addr)

	if len(os.Args) > 1 {
		// empty for now
	}
	makeReservation(node)
	go handleInput(ctx, dht)

	defer node.Close()

	select {}
}

func handleInput(ctx context.Context, dht *dht.IpfsDHT) {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print("User Input \n ")
	for {
		fmt.Print("> ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)
		args := strings.Split(input, " ")
		if len(args) < 1 {
			fmt.Println("No command provided")
			continue
		}
		command := args[0]
		command = strings.ToUpper(command)
		switch command {
		case "GET":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			dhtKey := "/orcanet/" + key
			res, err := dht.GetValue(ctx, dhtKey)
			if err != nil {
				fmt.Printf("Failed to get record: %v\n", err)
				continue
			}
			fmt.Printf("Record: %s\n", res)

		case "GET_PROVIDERS":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			data := []byte(key)
			hash := sha256.Sum256(data)
			mh, err := multihash.EncodeName(hash[:], "sha2-256")
			if err != nil {
				fmt.Printf("Error encoding multihash: %v\n", err)
				continue
			}
			c := cid.NewCidV1(cid.Raw, mh)
			providers := dht.FindProvidersAsync(ctx, c, 20)

			fmt.Println("Searching for providers...")
			for p := range providers {
				if p.ID == peer.ID("") {
					break
				}
				fmt.Printf("Found provider: %s\n", p.ID.String())
				for _, addr := range p.Addrs {
					fmt.Printf(" - Address: %s\n", addr.String())
				}
			}

		case "PUT":
			if len(args) < 3 {
				fmt.Println("Expected key and value")
				continue
			}
			log.Println(args[1])
			key := args[1]
			value := args[2]
			dhtKey := "/orcanet/" + key
			err := dht.PutValue(ctx, dhtKey, []byte(value))
			if err != nil {
				fmt.Printf("Failed to put record: %v\n", err)
				continue
			}
			fmt.Println("Record stored successfully")

		case "PUT_PROVIDER":
			if len(args) < 2 {
				fmt.Println("Expected key")
				continue
			}
			key := args[1]
			data := []byte(key)
			hash := sha256.Sum256(data)
			mh, err := multihash.EncodeName(hash[:], "sha2-256")
			if err != nil {
				fmt.Printf("Error encoding multihash: %v\n", err)
				continue
			}
			c := cid.NewCidV1(cid.Raw, mh)
			err = dht.Provide(ctx, c, true)
			if err != nil {
				fmt.Printf("Failed to start providing key: %v\n", err)
				continue
			}
			fmt.Println("Started providing key")

		default:
			fmt.Println("Expected GET, GET_PROVIDERS, PUT or PUT_PROVIDER")
		}
	}
}

func makeReservation(node host.Host) {
	ctx := globalCtx
	relayInfo, err := peer.AddrInfoFromString(relay_addr)
	if err != nil {
		log.Fatalf("Failed to create addrInfo from string representation of relay multiaddr: %v", err)
	}
	_, err = client.Reserve(ctx, node, *relayInfo)
	if err != nil {
		log.Fatalf("Failed to make reservation on relay: %v", err)
	}
	fmt.Printf("Reservation successful \n")
}
