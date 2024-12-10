package manager

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/creack/pty"
)

// Initialize initializes the DolphinCoin backend services
func Initialize() error {
	log.Println("Initializing Dolphin Coin backend...")
	// Add logic to initialize services like wallet and mining nodes
	return nil
}

// StopServices gracefully stops the DolphinCoin backend services
func StopServices() error {
	log.Println("Stopping Dolphin Coin backend...")
	// Add logic to gracefully stop services
	return nil
}

// CallDolphinCmd executes a DolphinCoin CLI command and returns the output
func CallDolphinCmd(cmd string) (string, error) {
	args := strings.Split(cmd, " ")
	command := exec.Command("dolphin-cli", args...)

	// Capture the output
	var out bytes.Buffer
	var stderr bytes.Buffer
	command.Stdout = &out
	command.Stderr = &stderr

	// Execute the command
	if err := command.Run(); err != nil {
		log.Printf("Command execution failed: %s", stderr.String())
		return "", fmt.Errorf("command execution failed: %w", err)
	}

	return out.String(), nil
}

// CreateWallet creates a new wallet using the provided password.
func CreateWallet(password string) (string, error) {
	log.Println("Executing the create command from btcwallet using pty...")

	// Command to create the wallet
	cmd := exec.Command("btcwallet", "--create")

	// Create a pseudo-terminal for the command
	ptyFile, err := pty.Start(cmd)
	if err != nil {
		return "", fmt.Errorf("failed to start pty for btcwallet: %w", err)
	}
	defer ptyFile.Close()

	// Buffer for capturing output
	var outputBuffer strings.Builder
	var walletSeed string

	// Goroutine to read output in real-time
	go func() {
		buf := make([]byte, 1024)
		for {
			n, err := ptyFile.Read(buf)
			if err != nil {
				if err == io.EOF {
					break
				}
				log.Printf("Error reading from pty: %v", err)
				return
			}
			output := string(buf[:n])
			outputBuffer.WriteString(output)
			log.Println("btcwallet output:", output)

			// Write input as required
			log.Println("Responding to passphrase prompt...")
			ptyFile.Write([]byte(password + "\n"))
			log.Println("Responding to confirm passphrase prompt...")
			ptyFile.Write([]byte(password + "\n"))
			log.Println("Responding to additional encryption prompt...")
			ptyFile.Write([]byte("no\n"))
			log.Println("Responding to existing seed prompt...")
			ptyFile.Write([]byte("no\n"))
			ptyFile.Write([]byte("OK\n"))
			if strings.Contains(output, "Your wallet generation seed is:") {
				log.Println("Capturing wallet seed...")
				lines := strings.Split(output, "\n")
				for i, line := range lines {
					if strings.Contains(line, "Your wallet generation seed is:") && i+1 < len(lines) {
						walletSeed = lines[i+1]
						break
					}
				}
			}
		}
	}()

	// Wait for the command to finish
	if err := cmd.Wait(); err != nil {
		return "", fmt.Errorf("failed to create wallet: %w. Output: %s", err, outputBuffer.String())
	}

	// Check if seed was captured
	if walletSeed == "" {
		return "", fmt.Errorf("failed to capture wallet seed. Output: %s", outputBuffer.String())
	}

	walletSeed = strings.TrimSpace(walletSeed)
	log.Println("Wallet creation successful. Wallet seed:", walletSeed)
	return walletSeed, nil
}

func DeleteWallet() error {
	// Determine the wallet path based on the operating system
	log.Println("Checking wallet")
	var walletPath string
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Println("Error locating home directory")
	}

	if runtime.GOOS == "windows" {
		walletPath = filepath.Join(homeDir, "AppData", "Local", "Btcwallet", "mainnet", "wallet.db")
	} else if runtime.GOOS == "darwin" {
		log.Println("darwin")
		walletPath = filepath.Join(homeDir, "Library", "Application Support", "Btcwallet", "mainnet", "wallet.db")
	} else {
		log.Println("cool")
		walletPath = filepath.Join(homeDir, ".btcwallet", "mainnet", "wallet.db")
	}

	// check if it exists
	_, err = os.Stat(walletPath)
	if err != nil {
		log.Println("Wallet doesn't exists...")
	}

	// Delete wallet
	if err := os.Remove(walletPath); err != nil {
		return fmt.Errorf("failed to delete wallet at path %s: %v", walletPath, err)
	}

	fmt.Println("Wallet deleted successfully.")
	return nil
}

// WalletExists checks if the wallet file exists on the system.
func WalletExists() bool {
	// Determine the wallet path based on the operating system
	log.Println("Checking wallet")
	var walletPath string
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return false
	}

	if runtime.GOOS == "windows" {
		walletPath = filepath.Join(homeDir, "AppData", "Local", "Btcwallet", "mainnet", "wallet.db")
	} else if runtime.GOOS == "darwin" {
		log.Println("darwin")
		walletPath = filepath.Join(homeDir, "Library", "Application Support", "Btcwallet", "mainnet", "wallet.db")
	} else {
		log.Println("cool")
		walletPath = filepath.Join(homeDir, ".btcwallet", "mainnet", "wallet.db")
	}

	// Check if the wallet file exists
	_, err = os.Stat(walletPath)
	return err == nil
}

// StartWallet starts the DolphinCoin wallet service
func StartWalletServer() error {
	log.Println("Starting DolphinCoin wallet service...")
	rpcUser := "user"
	rpcPass := "password"
	rpcConnect := "127.0.0.1:8334"

	params := []string{
		"--btcdusername=" + rpcUser,
		"--btcdpassword=" + rpcPass,
		"--rpcconnect=" + rpcConnect,
		"--noclienttls",
		"--noservertls",
	}

	// Command to start server with above params
	cmd := exec.Command("btcwallet", params...)
	fmt.Printf("Executing command: btcwallet %s", strings.Join(params, " "))

	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Failed to start wallet service: %s\nOutput: %s", err.Error(), string(output))
		return fmt.Errorf("error starting wallet service: %s, output: %s", err.Error(), string(output))
	}

	// Log the success message
	log.Println("DolphinCoin wallet service started successfully.")
	log.Println(string(output))
	return nil
}

// StopWallet stops the DolphinCoin wallet service
func StopWallet() error {
	log.Println("Stopping DolphinCoin wallet service...")
	_, err := CallDolphinCmd("stopwallet")
	if err != nil {
		return fmt.Errorf("failed to stop wallet service: %w", err)
	}
	return nil
}

// ConfigureMiningAddress configures the given address as the mining address
func ConfigureMiningAddress(address string) error {
	log.Printf("Configuring mining address: %s", address)
	_, err := CallDolphinCmd(fmt.Sprintf("setminingaddress %s", address))
	if err != nil {
		return fmt.Errorf("failed to configure mining address: %w", err)
	}
	return nil
}

// GetWalletBalance retrieves the current wallet balance
func GetWalletBalance() (float64, error) {
	log.Println("Retrieving wallet balance...")
	output, err := CallDolphinCmd("getbalance")
	if err != nil {
		return 0, fmt.Errorf("failed to retrieve wallet balance: %w", err)
	}

	// Parse the balance into a float
	var balance float64
	_, parseErr := fmt.Sscanf(output, "%f", &balance)
	if parseErr != nil {
		return 0, errors.New("failed to parse wallet balance")
	}
	return balance, nil
}

// ValidateAddress checks if a given address is valid
func ValidateAddress(address string) error {
	log.Printf("Validating address: %s", address)
	output, err := CallDolphinCmd(fmt.Sprintf("validateaddress %s", address))
	if err != nil {
		return fmt.Errorf("failed to validate address: %w", err)
	}

	if !strings.Contains(output, "isvalid: true") {
		return errors.New("invalid address")
	}

	return nil
}

// Handle btcctl commands
func BtcctlCommand(command string) (string, error) {
	rpcUser := "user"
	rpcPass := "password"
	rpcServer := "127.0.0.1:8332"

	// In case we have to create an executable in the directory
	// wd, err := os.Getwd()
	// if err != nil {
	// 	return "", fmt.Errorf("Error getting working directory: %v", err)
	// }

	// rootPath := filepath.Dir(wd)
	// btcctlPath := filepath.Join(rootPath, "btcd", "cmd", "btcctl")
	// fmt.Printf("Executing btcctl at path: %s\n", btcctlPath)

	// if _, err := os.Stat(btcctlPath); os.IsNotExist(err) {
	// 	return "", fmt.Errorf("btcctl binary not found at %s", btcctlPath)
	// }

	// Add flags before the command itself
	params := []string{
		"--wallet",
		"--rpcuser=" + rpcUser,
		"--rpcpass=" + rpcPass,
		"--rpcserver=" + rpcServer,
		"--notls",
	}

	params = append(params, strings.Split(command, " ")...)
	cmd := exec.Command("btcctl", params...)
	fmt.Printf("Executing command: %s", strings.Join(params, " "))
	output, err := cmd.CombinedOutput()
	if err != nil {
		return "", fmt.Errorf("Error executing btcctl command: %s\nOutput: %s\nError: %v", strings.Join(params, " "), string(output), err)
	}

	return strings.TrimSpace(string(output)), nil
}

// KillProcesses forces termination of backend services (if needed)
func KillProcesses() error {
	log.Println("Killing all DolphinCoin processes...")
	// Example: Add logic to kill specific DolphinCoin-related processes
	return nil
}

var transactionDB = []map[string]interface{}{} // Store transactions in memory

// AddTransaction adds a transaction to the in-memory database
func AddTransaction(transaction map[string]interface{}) error {
	log.Println("Adding transaction to the database...")
	transactionDB = append(transactionDB, transaction)
	log.Println("Transaction added:", transaction)
	return nil
}

// GetTransactions retrieves all transactions from the database
func GetTransactions() ([]map[string]interface{}, error) {
	log.Println("Retrieving all transactions from the database...")
	return transactionDB, nil
}

// GetTransactionsUnsafe retrieves all transactions from the database without error handling.
// This function is only used internally for utility purposes like counting transactions.
func GetTransactionsUnsafe() []map[string]interface{} {
	return transactionDB
}

// ListTransactions retrieves a list of transactions from btcwallet using btcctl.
func ListTransactions(account string, count, from int, includeWatchOnly bool) ([]map[string]interface{}, error) {
	log.Println("Fetching transaction history from btcwallet...")

	// Build the btcctl command
	includeWatchOnlyStr := "false"
	if includeWatchOnly {
		includeWatchOnlyStr = "true"
	}
	command := fmt.Sprintf(
		"listtransactions %s %d %d %s",
		account, count, from, includeWatchOnlyStr,
	)

	// Execute the command
	output, err := BtcctlCommand(command)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions: %w", err)
	}

	// Parse the JSON output into a slice of transactions
	var transactions []map[string]interface{}
	if err := json.Unmarshal([]byte(output), &transactions); err != nil {
		return nil, fmt.Errorf("failed to parse transaction data: %w", err)
	}

	log.Println("Transactions fetched successfully.")
	return transactions, nil
}

// func DumpPrivateKey(address string) (string, error) {
// 	cmd := exec.Command("btcctl", "--wallet", "--rpcuser=user", "--rpcpass=password", "--rpcserver=127.0.0.1:8332", "--notls", "dumpprivkey", address)

// 	output, err := cmd.CombinedOutput()
// 	if err != nil {
// 		return "", fmt.Errorf("failed to dump private key: %v, output: %s", err, string(output))
// 	}

// 	return strings.TrimSpace(string(output)), nil
// }
