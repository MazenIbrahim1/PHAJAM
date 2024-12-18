package manager

import (
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
	"time"

	"github.com/creack/pty"
)

var walletPID int
var transactionDB = []map[string]interface{}{} 

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

            // Responding to expected prompts
            if strings.Contains(output, "Enter the private passphrase") {
                log.Println("Responding to passphrase prompt...")
                ptyFile.Write([]byte(password + "\n"))
				time.Sleep(1 * time.Second)
            }
            if strings.Contains(output, "Confirm passphrase") {
                log.Println("Responding to confirm passphrase prompt...")
                ptyFile.Write([]byte(password + "\n"))
				time.Sleep(1 * time.Second)
            }
            if strings.Contains(output, "Do you want to add an additional layer of encryption") {
                log.Println("Responding to additional encryption prompt...")
                ptyFile.Write([]byte("no\n"))
				time.Sleep(1 * time.Second)
            }
            if strings.Contains(output, "Do you have an existing wallet seed") {
                log.Println("Responding to existing seed prompt...")
                ptyFile.Write([]byte("no\n"))
				time.Sleep(1 * time.Second)
            }
            if strings.Contains(output, "Your wallet generation seed is:") {
				ptyFile.Write([]byte("OK\n"))
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

// Delete wallet.db and account
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
		walletPath = filepath.Join(homeDir, "Library", "Application Support", "Btcwallet", "mainnet", "wallet.db")
	} else {
		walletPath = filepath.Join(homeDir, ".btcwallet", "mainnet", "wallet.db")
	}

	// check if it exists
	_, err = os.Stat(walletPath)
	if err != nil {
		log.Println("Wallet doesn't exist...")
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
		walletPath = filepath.Join(homeDir, "Library", "Application Support", "Btcwallet", "mainnet", "wallet.db")
	} else {
		walletPath = filepath.Join(homeDir, ".btcwallet", "mainnet", "wallet.db")
	}

	// Check if the wallet file exists
	_, err = os.Stat(walletPath)
	return err == nil
}

// StartWallet starts the DolphinCoin wallet service
func StartWalletServer() (error) {
	log.Println("Starting DolphinCoin wallet service...")
	rpcUser := "user"
	rpcPass := "password"
	rpcConnect := "127.0.0.1:8334"
	username := "user"
	password := "password"

	params := []string{
		"--btcdusername=" + rpcUser,
		"--btcdpassword=" + rpcPass,
		"--rpcconnect=" + rpcConnect,
		"--noclienttls",
		"--noservertls",
		"--username=" + username,
		"--password=" + password,
	}

	// Command to start server with above params
	cmd := exec.Command("btcwallet", params...)
	fmt.Printf("Executing command: btcwallet %s", strings.Join(params, " "))

	// Start the server
	if err := cmd.Start(); err != nil {
		log.Printf("Failed to start wallet service: %s", err.Error())
		return fmt.Errorf("error starting wallet service: %w", err)
	}

	log.Println("Waiting for the wallet server to initialize...")
	time.Sleep(1 * time.Second)

	// Log the success message
	walletPID = cmd.Process.Pid
	log.Printf("DolphinCoin wallet service started successfully with PID: %d", walletPID)
	return nil
}

// StopWallet stops the DolphinCoin wallet service
func StopWallet() error {
	log.Println("Stopping DolphinCoin wallet service...")

	// If walletPID is 0, that means the process wasn't started yet or it's already stopped
	if walletPID == 0 {
		return errors.New("wallet service not running or already stopped")
	}

	// Get the process using the stored PID
	process, err := os.FindProcess(walletPID)
	if err != nil {
		return fmt.Errorf("failed to find wallet process with PID %d: %w", walletPID, err)
	}

	// Kill process
	err = process.Kill()
	if err != nil {
		return fmt.Errorf("failed to stop wallet service with PID %d: %w", walletPID, err)
	}

	log.Printf("DolphinCoin wallet service with PID %d stopped successfully", walletPID)

	// Reset walletPID after stopping the process to avoid accidental attempts to stop a non-existent process
	walletPID = 0
	return nil
}

// ValidateAddress checks if a given address is valid
func ValidateAddress(address string) error {
	log.Printf("Validating address: %s", address)
	output, err := BtcctlCommand(fmt.Sprintf("validateaddress %s", address))
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
		return "", fmt.Errorf("error executing btcctl command: %s\nOutput: %s\nError: %v", strings.Join(params, " "), string(output), err)
	}
	output = []byte(strings.TrimSpace(string(output)))
	log.Printf("Btcctl output: %s", output)

	return string(output), nil
}

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
