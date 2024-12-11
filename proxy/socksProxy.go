package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"sync"

	"golang.org/x/net/proxy"
)

// Global variables to hold server and proxy data
var (
	server             *http.Server
	proxyMutex         sync.Mutex
	remoteProxyURL     *url.URL
	localServer        *http.Server
	localProxy         *proxy.Dialer
	remoteProxyDialer  proxy.Dialer
)

type ProxyConfig struct {
	IP   string `json:"ip"`
	Port string `json:"port"`
}

// CORS middleware
func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Allow all origins (you can restrict it later for security)
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests (OPTIONS)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Start the SOCKS proxy server
func startProxyServer() error {
	proxyMutex.Lock()
	defer proxyMutex.Unlock()

	// Proxy already running
	if remoteProxyDialer != nil {
		log.Println("Proxy server is already running.")
		return nil
	}

	// Set the remote proxy URL if not already done
	if remoteProxyURL == nil {
		log.Println("Remote proxy URL is not set")
		return fmt.Errorf("Remote proxy URL is not set")
	}

	// Set up SOCKS5 proxy dialer
	dialer, err := proxy.SOCKS5("tcp", remoteProxyURL.String(), nil, proxy.Direct)
	if err != nil {
		log.Printf("Failed to create SOCKS5 proxy dialer: %v", err)
		return err
	}

	remoteProxyDialer = dialer

	log.Println("SOCKS5 proxy server started successfully.")
	return nil
}

// Stop the SOCKS proxy server
func stopProxyServer() error {
	proxyMutex.Lock()
	defer proxyMutex.Unlock()

	// Proxy already stopped
	if remoteProxyDialer == nil {
		log.Println("Proxy server is already stopped.")
		return nil
	}

	// Reset the remote proxy dialer
	remoteProxyDialer = nil
	log.Println("SOCKS5 proxy server stopped successfully.")
	return nil
}

// Start the local-to-remote proxy
func startLocalToRemoteProxy() error {
	if remoteProxyDialer == nil {
		log.Println("Remote proxy URL not set or SOCKS5 dialer not initialized.")
		return fmt.Errorf("Remote proxy URL or SOCKS5 dialer not initialized")
	}

	localServer = &http.Server{
		Addr: ":50002",
		Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			log.Printf("Received request to forward to remote proxy: %s", r.URL.String())

			// Dial the remote proxy using SOCKS5
			conn, err := remoteProxyDialer.Dial("tcp", r.Host+":80")
			if err != nil {
				log.Printf("Failed to dial remote proxy: %v", err)
				http.Error(w, "Failed to connect to remote proxy", http.StatusInternalServerError)
				return
			}
			defer conn.Close()

			// Forward the request to the remote proxy
			client := &http.Client{
				Transport: &http.Transport{
					Dial: func(network, addr string) (net.Conn, error) {
						return conn, nil
					},
				},
			}

			resp, err := client.Do(r)
			if err != nil {
				log.Printf("Failed to forward request: %v", err)
				http.Error(w, "Failed to forward request", http.StatusInternalServerError)
				return
			}
			defer resp.Body.Close()

			// Copy the response back to the client
			for key, value := range resp.Header {
				w.Header()[key] = value
			}
			w.WriteHeader(resp.StatusCode)
			_, err = io.Copy(w, resp.Body)
			if err != nil {
				log.Printf("Failed to write response: %v", err)
			}
		}),
	}

	// Start the local proxy server
	go func() {
		log.Println("Local proxy server listening on port 50002, forwarding to", remoteProxyURL.String())
		if err := localServer.ListenAndServe(); err != nil {
			log.Printf("Error starting local proxy server: %v", err)
		}
	}()

	return nil
}

// Stop the local proxy server
func stopLocalProxyServer() error {
	if localServer == nil {
		log.Println("Local proxy server is already stopped.")
		return nil
	}

	if err := localServer.Close(); err != nil {
		log.Printf("Error stopping local proxy server: %v", err)
		return err
	}

	localServer = nil
	log.Println("Local proxy server stopped successfully.")
	return nil
}

// Set the remote SOCKS proxy URL
func setRemoteProxyURL(w http.ResponseWriter, r *http.Request) {
	log.Println("Received request to set remote proxy URL")
	var req ProxyConfig
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Println(err)
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	remoteURL := "socks5://" + req.IP + ":" + req.Port
	log.Println("remoteURL: ", remoteURL)
	parsedURL, err := url.Parse(remoteURL)
	if err != nil {
		http.Error(w, "Invalid IP or port format", http.StatusBadRequest)
		return
	}

	remoteProxyURL = parsedURL
	log.Printf("Remote proxy URL set to: %s", remoteProxyURL.String())

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Remote proxy URL set successfully"))
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/startProxy", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received request to start proxy server.")
		if err := startProxyServer(); err != nil {
			http.Error(w, "Failed to start proxy", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	mux.HandleFunc("/stopProxy", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received request to stop proxy server.")
		if err := stopProxyServer(); err != nil {
			http.Error(w, "Failed to stop proxy", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	})

	mux.HandleFunc("/setRemoteProxyURL", setRemoteProxyURL)

	mux.HandleFunc("/stopLocalProxyServer", func(w http.ResponseWriter, r *http.Request) {
		if err := stopLocalProxyServer(); err != nil {
			http.Error(w, "Failed to stop local proxy server", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Local proxy server stopped successfully"))
	})

	mux.HandleFunc("/startLocalToRemoteProxy", func(w http.ResponseWriter, r *http.Request) {
		log.Println("Received request to start local-to-remote proxy.")
		if err := startLocalToRemoteProxy(); err != nil {
			http.Error(w, "Failed to start local-to-remote proxy", http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Local-to-remote proxy started successfully"))
	})

	log.Println("Serving on port 50001")
	log.Fatal(http.ListenAndServe(":50001", enableCORS(mux)))
}