/*package manager

import "log"

func Initialize() error {
	log.Println("Initializing Dolphin Coin backend...")
	// Add logic to initialize services like btcd and btcwallet
	return nil
}

func StopServices() error {
	log.Println("Stopping Dolphin Coin backend...")
	// Add logic to gracefully stop services
	return nil
} */

package manager

import (
	"bytes"
	"errors"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
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

// CreateWallet creates a new wallet with the given password
func CreateWallet(password string) (string, error) {
	log.Println("Creating a new wallet...")
	output, err := CallDolphinCmd(fmt.Sprintf("createwallet %s", password))
	if err != nil {
		return "", fmt.Errorf("failed to create wallet: %w", err)
	}
	return output, nil
}

// StartWallet starts the DolphinCoin wallet service
func StartWallet() error {
	log.Println("Starting DolphinCoin wallet service...")
	_, err := CallDolphinCmd("startwallet")
	if err != nil {
		return fmt.Errorf("failed to start wallet service: %w", err)
	}
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

func BtcctlCommand(command string) (string, error) {
	rpcUser := "user"
	rpcPass := "password"
	rpcServer := "127.0.0.1:8332"

	wd, err := os.Getwd()
	if err != nil {
		return "", fmt.Errorf("Error getting working directory: %v", err)
	}

	rootPath := filepath.Dir(wd)
    btcctlPath := filepath.Join(rootPath, "btcd", "cmd", "btcctl")
    fmt.Printf("Executing btcctl at path: %s\n", btcctlPath)

    if _, err := os.Stat(btcctlPath); os.IsNotExist(err) {
        return "", fmt.Errorf("btcctl binary not found at %s", btcctlPath)
    }

    // Add flags before the command itself
    params := []string{
        "--wallet",
        "--rpcuser=" + rpcUser,
        "--rpcpass=" + rpcPass,
        "--rpcserver=" + rpcServer,
        "--notls",
    }

	params = append(params, strings.Split(command, " ") ...)
	fmt.Printf("Executing command: %s", strings.Join(params, " "))

	cmd := exec.Command("btcctl", params...)
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
