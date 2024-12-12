# Welcome to Dolphin Data Sharing by PHAJAM!

A simple decentralized file-sharing application powered by DolphinCoin.

### Requirements

- [Go](http://golang.org) 1.17 or newer
- Linux-like terminal environment to run the servers in
- Adding btcd, btcwallet, and btcctl to your PATH environment variable
- MongoDB

## Getting Started

### Cloning the Repository

1. Clone the repository:
   ```
   git clone git@github.com:MazenIbrahim1/PHAJAM.git
   ```

### Installing Dependencies (in order) (You should already be in the repo)

2. Install dependencies:

   ```
   cd PHAJAM
   npm install
   ```

go back to the /PHAJAM directory after.
    ```
    cd ..
    ```

3. Running Servers:
(Each server gets its own terminal, starting from /PHAJAM)

   - BTCD
     ```
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

4. To run the app:
   ```
   cd PHAJAM (/PHAJAM/PHAJAM)
   npm run dev
   ```
