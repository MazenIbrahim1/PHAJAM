import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState(""); // Track password input
  const [walletExists, setWalletExists] = useState(null); // Track wallet existence
  const [walletStatus, setWalletStatus] = useState("Fetching wallet status...");
  const [openWarningDialog, setOpenWarningDialog] = useState(false); // Warning dialog state
  const [errorMessage, setErrorMessage] = useState(""); // Error message for login

  // Fetch wallet status using HTTP request
  const fetchWalletStatus = async () => {
    try {
      const response = await fetch("http://localhost:8080/wallet/check");
      if (!response.ok) throw new Error("Failed to fetch wallet status");

      const data = await response.json();
      setWalletExists(data.exists);
      setWalletStatus(
        data.exists
          ? "Wallet found. You can log in now."
          : "No wallet found. Please create a wallet to continue."
      );
    } catch (error) {
      console.error("Error fetching wallet status:", error);
      setWalletExists(false);
      setWalletStatus("Error checking wallet status.");
    }
  };

  useEffect(() => {
    fetchWalletStatus();
  }, []);

  const handleLogin = async () => {
    if (!walletExists) {
      setWalletStatus("Cannot log in. No wallet address found.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/wallet/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        navigate("/home"); // Navigate to home page
      } else {
        const data = await response.json();
        setErrorMessage(data.message || "Login failed. Please check your password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    }
  };

  const handleGenerateKeys = () => {
    if (walletExists) {
      setOpenWarningDialog(true); // Open warning dialog if a wallet already exists
    } else {
      navigate("/generate-keys"); // Directly navigate if no wallet exists
    }
  };

  const closeWarningDialog = () => {
    setOpenWarningDialog(false); // Close the warning dialog
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f4f8",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold" }}>
        Welcome to Dolphin Data Sharing!
      </Typography>
      <Typography sx={{ marginTop: 1 }}>
        Log into your account with the password to your wallet.
      </Typography>
      <TextField
        label="Wallet Password"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{
          marginTop: 2,
          marginBottom: 3,
          width: "300px",
          backgroundColor: "white",
        }}
        disabled={!walletExists} // Disable if no wallet is found
        error={!!errorMessage} // Show error state if login fails
        helperText={errorMessage} // Display error message below the input
      />
      <Button
        variant="contained"
        size="large"
        sx={{
          backgroundColor: walletExists ? "black" : "gray",
          color: "white",
          fontWeight: "bold",
        }}
        onClick={handleLogin}
        disabled={!walletExists || !password} // Disable if no wallet is found or password is empty
      >
        Log In
      </Button>
      <Typography
        variant="body1"
        sx={{
          marginTop: 5,
          color: walletExists === null ? "gray" : walletExists ? "green" : "red",
          whiteSpace: "pre-line",
          textAlign: "center",
        }}
      >
        {walletStatus}
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleGenerateKeys}
        size="large"
        sx={{
          marginTop: 2,
          marginBottom: 8,
          fontWeight: "bold",
        }}
      >
        Create a wallet
      </Button>
      <Typography variant="body2">
        Not sure about Dolphin Data Sharing?{" "}
        <Link
          onClick={() => navigate("/learn-more")}
          underline="always"
          style={{ cursor: "pointer" }}
        >
          Learn more
        </Link>
      </Typography>

      {/* Warning Dialog */}
      <Dialog
        open={openWarningDialog}
        onClose={closeWarningDialog}
        aria-labelledby="warning-dialog-title"
        aria-describedby="warning-dialog-description"
      >
        <DialogTitle id="warning-dialog-title">Unable to Create a New Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText id="warning-dialog-description">
            A wallet already exists on your device. You cannot create a new wallet unless you delete the existing wallet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWarningDialog} color="primary" variant="contained" autoFocus>
            Go Back
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
