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
  const [walletExists, setWalletExists] = useState(null); // Track wallet existence
  const [walletStatus, setWalletStatus] = useState("Fetching wallet status...");
  const [openWarningDialog, setOpenWarningDialog] = useState(false); // Warning dialog state

  // Function to fetch wallet status dynamically
  const fetchWalletStatus = async () => {
    try {
      console.log("[Renderer] Fetching wallet status...");
      const exists = await window.walletApi.checkWallet();
      console.log("[Renderer] Wallet exists:", exists);
      setWalletExists(exists);
      setWalletStatus(
        exists
          ? "Wallet found on local device."
          : "You do not have a wallet downloaded on your local device or we could not find it.\n You must have a wallet in order to log in!"
      );
    } catch (error) {
      console.error("[Renderer] Error fetching wallet status:", error);
      setWalletStatus("Error checking wallet status.");
    }
  };

  // Fetch wallet status every time the login page is mounted
  useEffect(() => {
    fetchWalletStatus();
  }, []);

  const handleLogin = () => {
    if (!walletExists) {
      setWalletStatus("Cannot log in. No wallet address found.");
      return;
    }
    navigate("/home"); // Navigate to the home page
  };

  const handleLearnMore = () => {
    navigate("/learn-more");
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
      <Typography
        variant="h4"
        sx={{
          marginBottom: 3,
          fontWeight: "bold",
        }}
      >
        Welcome to Dolphin Data Sharing!
      </Typography>
      <Typography sx={{ marginTop: 1 }}>
        Log into your account with the password to your wallet.
      </Typography>
      <TextField
        label="Wallet Password"
        type="password"
        variant="outlined"
        sx={{
          marginTop: 2,
          marginBottom: 3,
          width: "300px",
          backgroundColor: "white",
        }}
        disabled={!walletExists} // Disable if no wallet is found
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
        disabled={!walletExists} // Disable if no wallet is found
      >
        Log In
      </Button>
      <Typography
        variant="body1"
        sx={{
          marginTop: 5,
          color:
            walletExists === null ? "gray" : walletExists ? "green" : "red",
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
          onClick={handleLearnMore}
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
          <Button onClick={closeWarningDialog} color="primary" autoFocus>
            Go Back
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
