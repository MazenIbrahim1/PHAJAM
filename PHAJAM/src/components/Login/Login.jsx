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
  const [walletStatus, setWalletStatus] = useState(""); // Display status
  const [openWarningDialog, setOpenWarningDialog] = useState(false); // Warning dialog state
  const [errorMessage, setErrorMessage] = useState(""); // Error message for login

  // Fetch wallet status using HTTP request
  const fetchWalletStatus = async () => {
    try {
      const response = await fetch("http://localhost:8080/wallet/check");
      if (!response.ok) throw new Error("Failed to fetch wallet status");

      const data = await response.json();
      setWalletExists(data.exists);
    } catch (error) {
      console.error("Error fetching wallet status:", error);
      setWalletExists(false);
    }
  };

  useEffect(() => {
    fetchWalletStatus();
  }, []);

  const handleLogin = async () => {
    if (!walletExists) {
      setErrorMessage("Cannot log in because no wallet could be found on your local device.");
      return;
    }
    navigate("/home");

    // Example API call for login (commented for now)
    // try {
    //   const response = await fetch("http://localhost:8080/wallet/login", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ password }),
    //   });

    //   if (response.ok) {
    //     navigate("/home"); // Navigate to home page
    //   } else {
    //     const data = await response.json();
    //     setErrorMessage(data.message || "Login failed. Please check your password.");
    //   }
    // } catch (error) {
    //   console.error("Error during login:", error);
    //   setErrorMessage("An error occurred during login. Please try again.");
    // }
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
        disabled={walletExists === null} // Disable if wallet status is not yet fetched
        // error={!!errorMessage} // Show error state if login fails
        // helperText={errorMessage} // Display error message below the input
      />
      <Button
        variant="contained"
        size="large"
        sx={{
          backgroundColor: "black",
          color: "white",
          fontWeight: "bold",
        }}
        onClick={handleLogin}
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
      {errorMessage && (
        <Typography
          variant="body2"
          sx={{
            color: "red",
            marginTop: 2,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {errorMessage}
        </Typography>
      )}
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
        <DialogTitle id="warning-dialog-title">
          Unable to Create a New Wallet
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="warning-dialog-description">
            A wallet already exists on your device. You cannot create a new
            wallet unless you delete the existing wallet.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeWarningDialog}
            color="primary"
            variant="contained"
            autoFocus
          >
            Go Back
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
