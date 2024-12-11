package main

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"strings"
	"time"

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
	node_id               = "114254605" // give your SBU ID
	relay_node_addr       = "/ip4/130.245.173.221/tcp/4001/p2p/12D3KooWDpJ7As7BWAwRMfu1VU2WCqNjvq387JEYKDBj4kx6nXTN"
	bootstrap_node_addr_1 = "/ip4/130.245.173.221/tcp/6001/p2p/12D3KooWE1xpVccUXZJWZLVWPxXzUJQ7kMqN8UQ2WLn9uQVytmdA"
	bootstrap_node_addr_2 = "/ip4/130.245.173.222/tcp/61020/p2p/12D3KooWM8uovScE5NPihSCKhXe8sbgdJAi88i2aXT2MmwjGWoSX"
	native_bootstrap      = "/ip4/172.25.232.234/tcp/61000/p2p/12D3KooWQtwuAfGY2LKHjN7nK4xjbvCYUTt3sUyxj4cwyR2bg31e"
	globalCtx             context.Context
	dataChannel           = make(chan []byte)
)

func generatePrivateKeyFromSeed(seed []byte) (crypto.PrivKey, error) {
	hash := sha256.Sum256(seed) // Generate deterministic key material
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
	seed := []byte(node_id)
	customAddr, err := multiaddr.NewMultiaddr("/ip4/0.0.0.0/tcp/60000")
	if err != nil {
		return nil, nil, fmt.Errorf("failed to parse multiaddr: %w", err)
	}
	privKey, err := generatePrivateKeyFromSeed(seed)
	if err != nil {
		log.Fatal(err)
	}
	relayAddr, err := multiaddr.NewMultiaddr(relay_node_addr)
	if err != nil {
		log.Fatalf("Failed to create relay multiaddr: %v", err)
	}

	// Convert the relay multiaddress to AddrInfo
	relayInfo, err := peer.AddrInfoFromP2pAddr(relayAddr)
	if err != nil {
		log.Fatalf("Failed to create AddrInfo from relay multiaddr: %v", err)
	}

	node, err := libp2p.New(
		libp2p.ListenAddrs(customAddr),
		libp2p.Identity(privKey),
		libp2p.NATPortMap(),
		libp2p.EnableNATService(),
		libp2p.EnableAutoRelayWithStaticRelays([]peer.AddrInfo{*relayInfo}),
		libp2p.EnableRelayService(),
		libp2p.EnableHolePunching(),
	)

	if err != nil {
		return nil, nil, err
	}
	_, err = relay.New(node)
	if err != nil {
		log.Printf("Failed to instantiate the relay: %v", err)
	}

	dhtRouting, err := dht.New(ctx, node, dht.Mode(dht.ModeClient))
	if err != nil {
		return nil, nil, err
	}
	namespacedValidator := record.NamespacedValidator{
		"orcanet": &CustomValidator{}, // Add a custom validator for the "orcanet" namespace
	}

	dhtRouting.Validator = namespacedValidator // Configure the DHT to use the custom validator

	err = dhtRouting.Bootstrap(ctx)
	if err != nil {
		return nil, nil, err
	}
	fmt.Println("DHT bootstrap complete.")

	// Set up notifications for new connections
	node.Network().Notify(&network.NotifyBundle{
		ConnectedF: func(n network.Network, conn network.Conn) {

			peerID := conn.RemotePeer().String()

			fmt.Printf("Notification: New peer connected %s\n", peerID)
			connectedPeers[peerID] = struct{}{}
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

	node.Peerstore().AddAddrs(info.ID, info.Addrs, peerstore.PermanentAddrTTL)
	err = node.Connect(context.Background(), *info)
	if err != nil {
		log.Printf("Failed to connect to peer: %s", err)
		return
	}

	fmt.Println("Connected to:", info.ID)
}

func connectToPeerUsingRelay(node host.Host, targetPeerID string) {
	ctx := globalCtx
	targetPeerID = strings.TrimSpace(targetPeerID)
	relayAddr, err := multiaddr.NewMultiaddr(relay_node_addr)
	if err != nil {
		log.Printf("Failed to create relay multiaddr: %v", err)
	}
	peerMultiaddr := relayAddr.Encapsulate(multiaddr.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	relayedAddrInfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		log.Println("Failed to get relayed AddrInfo: %w", err)
		return
	}
	// Connect to the peer through the relay
	err = node.Connect(ctx, *relayedAddrInfo)
	if err != nil {
		log.Println("Failed to connect to peer through relay: %w", err)
		return
	}

	fmt.Printf("Connected to peer via relay: %s\n", targetPeerID)
}

func receiveDataFromPeer(node host.Host) {
	// Set a stream handler to listen for incoming streams on the "/senddata/p2p" protocol
	node.SetStreamHandler("/senddata/p2p", func(s network.Stream) {
		defer s.Close()
		data, err := io.ReadAll(s)
		if err != nil {
			if err == io.EOF {
				log.Printf("Stream closed by peer: %s", s.Conn().RemotePeer())
			} else {
				log.Printf("Error reading from stream: %v", err)
			}
			return
		}
		if strings.HasPrefix(string(data), "REQUEST:") {
			hash := string(data)[8:]
			record, err := GetFileRecord(hash)
			if err != nil {
				log.Printf("Failed to retrieve hash: %v", hash)
			}
			sendFile(node, s.Conn().RemotePeer().String(), "files/"+record["filename"].(string))
		} else if strings.HasPrefix(string(data), "NAME:") {
			hash := string(data)[5:]
			record, err := GetFileRecord(hash)
			if err != nil {
				log.Printf("Failed to retrieve hash: %v", hash)
			}
			sendDataToPeer(node, s.Conn().RemotePeer().String(), record["filename"].(string))
		} else if strings.HasPrefix(string(data), "EXIST:") {
			hash := string(data)[6:]
			record, err := GetFileRecord(hash)
			if err != nil {
				log.Printf("Failed to retrieve hash: %v", hash)
			}
			if record == nil {
				sendDataToPeer(node, s.Conn().RemotePeer().String(), "false")
			} else {
				sendDataToPeer(node, s.Conn().RemotePeer().String(), "true")
			}
		} else {
			dataChannel <- data
		}
	})
}

func sendDataToPeer(node host.Host, targetpeerid string, msg string) error {
	var ctx = context.Background()
	targetPeerID := strings.TrimSpace(targetpeerid)
	relayAddr, err := multiaddr.NewMultiaddr(relay_node_addr)
	if err != nil {
		log.Printf("Failed to create relay multiaddr: %v", err)
		return err
	}
	peerMultiaddr := relayAddr.Encapsulate(multiaddr.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	peerinfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		log.Fatalf("Failed to parse peer address: %s", err)
		return err
	}
	if err := node.Connect(ctx, *peerinfo); err != nil {
		log.Printf("Failed to connect to peer %s via relay: %v", peerinfo.ID, err)
		return err
	}
	s, err := node.NewStream(network.WithAllowLimitedConn(ctx, "/senddata/p2p"), peerinfo.ID, "/senddata/p2p")
	if err != nil {
		log.Printf("Failed to open stream to %s: %s", peerinfo.ID, err)
		return err
	}
	defer s.Close()
	_, err = s.Write([]byte(msg))
	if err != nil {
		log.Fatalf("Failed to write to stream: %s", err)
		return err
	}
	return nil
}

func sendFile(node host.Host, target string, filename string) {
	var ctx = context.Background()
	targetPeerID := strings.TrimSpace(target)
	relayAddr, err := multiaddr.NewMultiaddr(relay_node_addr)
	if err != nil {
		log.Printf("Failed to create relay multiaddr: %v", err)
	}
	peerMultiaddr := relayAddr.Encapsulate(multiaddr.StringCast("/p2p-circuit/p2p/" + targetPeerID))

	peerinfo, err := peer.AddrInfoFromP2pAddr(peerMultiaddr)
	if err != nil {
		log.Fatalf("Failed to parse peer address: %s", err)
	}
	if err := node.Connect(ctx, *peerinfo); err != nil {
		log.Printf("Failed to connect to peer %s via relay: %v", peerinfo.ID, err)
		return
	}
	s, err := node.NewStream(network.WithAllowLimitedConn(ctx, "/senddata/p2p"), peerinfo.ID, "/senddata/p2p")
	if err != nil {
		log.Printf("Failed to open stream to %s: %s", peerinfo.ID, err)
		return
	}
	defer s.Close()
	file, err := os.Open(filename)
	if err != nil {
		log.Fatalf("Failed to open file: %s", err)
		return
	}
	defer file.Close()

	// Copy the file content to the stream
	_, err = io.Copy(s, file)
	if err != nil {
		log.Fatalf("Failed to send file: %s", err)
		return
	}
}

func handlePeerExchange(node host.Host) {
	relayInfo, _ := peer.AddrInfoFromString(relay_node_addr)
	node.SetStreamHandler("/orcanet/p2p", func(s network.Stream) {
		defer s.Close()

		buf := bufio.NewReader(s)
		peerAddr, err := buf.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				fmt.Printf("error reading from stream: %v", err)
			}
		}
		peerAddr = strings.TrimSpace(peerAddr)
		var data map[string]interface{}
		err = json.Unmarshal([]byte(peerAddr), &data)
		if err != nil {
			fmt.Printf("error unmarshaling JSON: %v", err)
		}
		if knownPeers, ok := data["known_peers"].([]interface{}); ok {
			for _, peer := range knownPeers {
				fmt.Println("Peer:")
				if peerMap, ok := peer.(map[string]interface{}); ok {
					if peerID, ok := peerMap["peer_id"].(string); ok {
						if string(peerID) != string(relayInfo.ID) {
							connectToPeerUsingRelay(node, peerID)
						}
					}
				}
			}
		}
	})
}

func provideKey(ctx context.Context, dht *dht.IpfsDHT, key string, provide bool) error {
	data := []byte(key)
	hash := sha256.Sum256(data)
	mh, err := multihash.EncodeName(hash[:], "sha2-256")
	if err != nil {
		return fmt.Errorf("error encoding multihash: %v", err)
	}
	c := cid.NewCidV1(cid.Raw, mh)
	// Start providing the key
	err = dht.Provide(ctx, c, provide)
	if err != nil {
		if provide {
			return fmt.Errorf("failed to start providing key: %v", err)
		} else {
			return fmt.Errorf("failed to stop providing key: %v", err)
		}
	}
	return nil
}

func makeReservation(node host.Host) {
	ctx := globalCtx
	relayInfo, err := peer.AddrInfoFromString(relay_node_addr)
	if err != nil {
		log.Fatalf("Failed to create addrInfo from string representation of relay multiaddr: %v", err)
	}
	_, err = client.Reserve(ctx, node, *relayInfo)
	if err != nil {
		log.Fatalf("Failed to make reservation on relay: %v", err)
	}
	fmt.Printf("Reservation successful \n")
}

func refreshReservation(node host.Host, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			makeReservation(node)
		case <-globalCtx.Done():
			fmt.Println("Context done, stopping reservation refresh.")
			return
		}
	}
}

type ProxyInfo struct {
	PeerID     string `json:"peer_id"`
	Name       string `json:"name"`
	Location   string `json:"location"`
	IPAddress  string `json:"ip_address"`
	InitialFee string `json:"initialFee"`
	Price      string `json:"price"`
	Port       int    `json:"port"`
}

func registerProxyAsService(ctx context.Context, dht *dht.IpfsDHT, location string, ipAddress string, name string, initialFee string, price string, node host.Host) {
	// 1. Create a unique proxy key
	proxyKey := "/orcanet/proxy/" + node.ID().String()

	// 2. Create proxy information (PeerID, IP Address, Port)
	var proxyInfo *ProxyInfo

	if ipAddress != "" {
		proxyInfo = &ProxyInfo{
			PeerID:     node.ID().String(),
			Name:       name,
			Location:   location,
			IPAddress:  ipAddress,
			InitialFee: initialFee,
			Price:      price,
			Port:       50000,
		}
	} else {
		proxyInfo = nil
	}

	// 3. Serialize proxy information to JSON
	var proxyInfoJSON []byte
	var err error
	if proxyInfo != nil {
		proxyInfoJSON, err = json.Marshal(proxyInfo)
		if err != nil {
			fmt.Printf("Error marshalling proxy info: %v\n", err)
			return
		}
	}

	// 4. Create value
	var value []byte
	if proxyInfo != nil {
		value = proxyInfoJSON
	} else {
		value = nil
	}

	// 5. Store proxy info in the DHT
	err = dht.PutValue(ctx, proxyKey, value)
	if err != nil {
		fmt.Printf("Error storing proxy info in DHT: %v\n", err)
		return
	}

	// 6. Provide key to indicate the node is acting as a proxy
	if proxyInfo != nil {
		hash := sha256.Sum256(proxyInfoJSON)
		mh, err := multihash.Encode(hash[:], multihash.SHA2_256)
		if err != nil {
			fmt.Printf("Error encoding multihash: %v\n", err)
			return
		}

		c := cid.NewCidV1(cid.Raw, mh)

		err = dht.Provide(ctx, c, true)
		if err != nil {
			fmt.Printf("Failed to provide proxy info in DHT: %v\n", err)
			return
		}
	}

	if proxyInfo != nil {
		fmt.Printf("Proxy registered successfully!\n NodeID: %s\n Name: %s\n PeerID: %s\n IP Address: %s\n Initial Fee: %s DC\n Rate: %s DC/MB\n Port: %d", node_id, name, node.ID().String(), ipAddress, proxyInfo.InitialFee, proxyInfo.Price, proxyInfo.Port)
	} else {
		fmt.Printf("Proxy deregistered successfully!\n NodeID: %s\n PeerID: %s\n", node_id, node.ID().String())
	}
}

func getProxyInfo(ctx context.Context, dht *dht.IpfsDHT, nodeID string) (*ProxyInfo, error) {
	proxyKey := "/orcanet/proxy/" + nodeID

	value, err := dht.GetValue(ctx, proxyKey)
	if err != nil {
		// fmt.Printf("Failed retrieving proxy information: %v\n", err)
		return nil, err
	}

	var proxyInfo ProxyInfo
	err = json.Unmarshal(value, &proxyInfo)
	if err != nil {
		fmt.Printf("Error unmarshalling proxy info: %v\n", err)
		return nil, err
	}

	return &proxyInfo, nil
}

func mapPeerIDtoWallet(ctx context.Context, dht *dht.IpfsDHT, walletAddress string, node host.Host) {
	// Key is peerID
	key := "/orcanet/wallet/" + node.ID().String()

	// Serialize wallet address
	walletAddressJSON, err := json.Marshal(walletAddress)
	if err != nil {
		fmt.Printf("Error marshalling wallet address: %v\n", err)
		return
	}

	// Store wallet address in DHT
	err = dht.PutValue(ctx, key, walletAddressJSON)
	if err != nil {
		fmt.Printf("Error storing wallet address in DHT: %v\n", err)
		return
	}

	fmt.Printf("Wallet address mapped successfully. PeerID: %s\n Wallet Address: %s\n", node.ID().String(), walletAddress)
}

func getWalletAddress(ctx context.Context, dht *dht.IpfsDHT, peerID string) (string, error) {
	key := "/orcanet/wallet/" + peerID

	value, err := dht.GetValue(ctx, key)
	if err != nil {
		return "", err
	}

	var walletAddress string
	err = json.Unmarshal(value, &walletAddress)
	if err != nil {
		return "", err
	}

	return walletAddress, nil
}