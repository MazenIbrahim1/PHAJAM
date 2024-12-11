Welcome to Dolphin Data Sharing by PHAJAM!

A simple decentralized file-sharing application powered by DolphinCoin.

### Requirements

- [Go](http://golang.org) 1.17 or newer
- Linux-like terminal environment to run the servers in
- Adding btcd, btcwallet, and btcctl to your PATH environment variable

## Getting Started

### Cloning the Repository

1. Clone the repository:
   ```
   git clone git@github.com:MazenIbrahim1/PHAJAM.git
   ```

### Installing Dependencies (in order)

2. Install dependencies:

   ```
   cd PHAJAM
   npm install
   ```

3. Running Servers:
   - BTCD
     ```
     cd ..
     btcd --configfile=btcd/btcd.conf
     ```
   - Wallet API Server
     ```
     cd server
     go run .
     ```
   - DHT Server
     ```
     cd dht
     go run .
     ```
   - Proxy server
     ```
     cd proxy
     go run runProxy.go
     ```

### Running the App on Electron & Web Browser

3. To run the app:
   ```
   npm run dev
   ```
