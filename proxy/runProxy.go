// package main

// import (
//     "github.com/elazarl/goproxy"
//     "log"
//     "net/http"
// 	"sync"
// )

// var (
// 	proxy		*goproxy.ProxyHttpServer
// 	server 		*http.Server
// 	proxyMutex 	 sync.Mutex
// )

// // CORS middleware
// func enableCORS(next http.Handler) http.Handler {
// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
// 		// Allow all origins (you can restrict it later for security)
// 		w.Header().Set("Access-Control-Allow-Origin", "*")
// 		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
// 		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

// 		// Handle preflight requests (OPTIONS)
// 		if r.Method == http.MethodOptions {
// 			w.WriteHeader(http.StatusOK)
// 			return
// 		}

// 		next.ServeHTTP(w, r)
// 	})
// }

// func startProxyServer() error {
// 	proxyMutex.Lock()
// 	defer proxyMutex.Unlock()

// 	// Proxy already running
// 	if proxy != nil {
// 		log.Println("Proxy server is already running.")
// 		return nil
// 	}

// 	proxy = goproxy.NewProxyHttpServer()
// 	proxy.Verbose = true

// 	server = &http.Server {
// 		Addr:	  ":50000",
// 		Handler:  proxy,
// 	}

// 	go func() {
// 		log.Println("Proxy server listening on port 50000")
// 		if err := server.ListenAndServe(); err != nil {
// 			log.Printf("Error starting proxy server: %v", err)
// 		}
// 	}()

// 	return nil
// }

// func stopProxyServer() error {
// 	proxyMutex.Lock()
// 	defer proxyMutex.Unlock()

// 	// Proxy already stopped
// 	if proxy == nil {
// 		log.Println("Proxy server is already stopped.")
// 		return nil
// 	}

// 	if err := server.Close(); err != nil {
// 		log.Printf("Error stopping proxy server: %v", err)
// 		return err
// 	}

// 	proxy = nil
// 	server = nil
// 	log.Println("Proxy server stopped successfully.")
// 	return nil
// }

// func startHandler(w http.ResponseWriter, r *http.Request) {
// 	log.Println("Received request to start proxy server.")
// 	if err := startProxyServer(); err != nil {
// 		http.Error(w, "Failed to start proxy", http.StatusInternalServerError)
// 		return
// 	}
// 	w.WriteHeader(http.StatusOK)
// }

// func stopHandler(w http.ResponseWriter, r *http.Request) {
// 	log.Println("Received request to stop proxy server.")
// 	if err := stopProxyServer(); err != nil {
// 		http.Error(w, "Failed to stop proxy", http.StatusInternalServerError)
// 		return
// 	}
// 	w.WriteHeader(http.StatusOK)
// }

// func main() {
// 	mux := http.NewServeMux()

// 	mux.HandleFunc("/startProxy", startHandler)
// 	mux.HandleFunc("/stopProxy", stopHandler)

// 	log.Println("Serving on port 50001")
// 	log.Fatal(http.ListenAndServe(":50001", enableCORS(mux)))
// }