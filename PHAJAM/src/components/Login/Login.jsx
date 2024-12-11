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
  CircularProgress, // Import spinner component
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [walletExists, setWalletExists] = useState(null);
  const [walletStatus, setWalletStatus] = useState("");
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // Track login loading state

  const fetchWalletStatus = async () => {
    try {
      const response = await fetch("http://localhost:18080/wallet/check");
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
      setErrorMessage(
        "Cannot log in because no wallet could be found on your local device."
      );
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await fetch("http://localhost:18080/wallet/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.value === true) {
          console.log("CORRECT PASSWORD");
          navigate("/home");
        } else {
          console.log("INCORRECT PASSWORD");
          setErrorMessage(
            data.message || "Login failed. Please check your password."
          );
        }
      } else {
        setErrorMessage(
          data.message || "Login failed. Please check your password."
        );
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred during login. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleGenerateKeys = () => {
    if (walletExists) {
      setOpenWarningDialog(true);
    } else {
      navigate("/generate-keys");
    }
  };

  const closeWarningDialog = () => {
    setOpenWarningDialog(false);
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
        disabled={walletExists === null || loading} // Disable during loading
      />
      <Box sx={{ position: "relative", marginBottom: 2 }}>
        <Button
          variant="contained"
          size="large"
          sx={{
            backgroundColor: "black",
            color: "white",
            fontWeight: "bold",
          }}
          onClick={handleLogin}
          disabled={loading} // Disable during loading
        >
          {loading ? "Logging In..." : "Log In"}
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: "white",
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-12px",
              marginLeft: "-12px",
            }}
          />
        )}
      </Box>
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
