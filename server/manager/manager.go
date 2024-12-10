package manager

import (
	"bytes"
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

var walletCommand *exec.Cmd

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
	walletCommand = exec.Command("btcwallet", "--create")

	// Create a pseudo-terminal for the command
	ptyFile, err := pty.Start(walletCommand)
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
	if err := walletCommand.Wait(); err != nil {
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

// Delete wallet and account
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
func StartWalletServer() (error) {
	log.Println("Starting DolphinCoin wallet service...")
	rpcUser := "user"
	rpcPass := "password"
	rpcConnect := "127.0.0.1:8334"
	username := "user"
	password := "password"

	params := []string {
		"--btcdusername=" + rpcUser,
		"--btcdpassword=" + rpcPass,
		"--rpcconnect=" + rpcConnect,
		"--noclienttls",
		"--noservertls",
		"--username=" + username,
		"--password=" + password,
	}

	// Command to start server with above params
	walletCommand = exec.Command("btcwallet", params...)
	fmt.Printf("Executing command: btcwallet %s", strings.Join(params, " "))

	// Start the server
	if err := walletCommand.Start(); err != nil {
		log.Printf("Failed to start wallet service: %s", err.Error())
		return fmt.Errorf("error starting wallet service: %w", err)
	}

	log.Println("Waiting for the wallet server to initialize...")
	time.Sleep(5 * time.Second)

	// Log the success message
	log.Println("DolphinCoin wallet service started successfully.")
	return nil
}

// StopWallet stops the DolphinCoin wallet service by killing the btcwallet process
func StopWallet() error {
	log.Println("Stopping DolphinCoin wallet service...")

	// If walletCommand is nil, the wallet is not running, return early
	if walletCommand == nil || walletCommand.Process == nil {
		return fmt.Errorf("btcwallet is not running.")
	}

	// Attempt to gracefully stop btcwallet first
	if err := walletCommand.Process.Signal(os.Interrupt); err != nil {
		log.Printf("Failed to gracefully stop btcwallet: %v", err)
		// If gracefully stopping fails, try to kill the process directly
		return killWalletProcess()
	}

	// Wait for the process to exit and check for errors
	err := walletCommand.Wait()
	if err != nil {
		log.Printf("btcwallet did not shut down cleanly: %v", err)
		// If the process didn't exit cleanly, kill it
		return killWalletProcess()
	}

	log.Println("btcwallet stopped gracefully.")
	walletCommand = nil
	return nil
}

// killWalletProcess forcefully kills the btcwallet process if it's still running
func killWalletProcess() error {
	log.Println("Forcefully killing btcwallet process...")

	// Use ps command to find the process by name (assuming you're on a Unix-like OS)
	cmd := exec.Command("pgrep", "-f", "btcwallet")
	out, err := cmd.Output()
	if err != nil {
		return fmt.Errorf("could not find btcwallet process to kill: %v", err)
	}

	// The output contains the PID of the process, we can now use kill command
	pids := strings.Fields(string(out))
	for _, pid := range pids {
		log.Printf("Killing process with PID: %s", pid)
		killCmd := exec.Command("kill", "-9", pid)
		if err := killCmd.Run(); err != nil {
			log.Printf("Failed to kill process with PID %s: %v", pid, err)
			return fmt.Errorf("failed to kill btcwallet process with PID %s: %v", pid, err)
		}
	}

	log.Println("btcwallet process killed successfully.")
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
