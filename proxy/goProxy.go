package main

import (
    "github.com/elazarl/goproxy"
    "log"
    "net/http"
)

func main() {
    proxy := goproxy.NewProxyHttpServer()  // Create a new proxy server
    proxy.Verbose = true                    // Enable verbose logging for proxy activity
    log.Println("Proxy server listening on port 8080")
    log.Fatal(http.ListenAndServe(":8080", proxy))  // Start the server on port 8080
}