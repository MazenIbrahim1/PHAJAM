package main

import (
    "github.com/elazarl/goproxy"
    "log"
    "net/http"
)

// func main() {
//     proxy := goproxy.NewProxyHttpServer()  // Create a new proxy server
//     proxy.Verbose = true                    // Enable verbose logging for proxy activity
//     log.Println("Proxy server listening on port 50000")
//     log.Fatal(http.ListenAndServe(":50000", proxy))  // Start the server on port 8080
// }