import React, { useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy"; // Import Material-UI icon
import { useNavigate } from "react-router-dom";

const generateRandomKey = (length) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export default function GenerateKeys() {
  const [address, setAddress] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const navigate = useNavigate();

  // Function to generate keys
  const handleGenerateKeys = () => {
    setAddress(generateRandomKey(42)); // Example length for a Dolphincoin address
    setPublicKey(generateRandomKey(66)); // Example length for a public key
    setPrivateKey(generateRandomKey(64)); // Example length for a private key
  };

  // Function to copy text to clipboard
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  // Function to navigate back to the login page
  const handleBackToLogin = () => {
    navigate("/"); // Update this route based on your login page path
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffffff", 
        color: "#333",
        padding: "20px",
      }}
    >
      <Button
        variant="contained"
        color="primary"
        onClick={handleGenerateKeys}
        sx={{
          padding: "10px 20px",
          fontSize: "1rem",
          marginBottom: "20px",
        }}
      >
        Generate Keys
      </Button>
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Dolphincoin Address
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          {address || "Not generated yet."}
          {address && (
            <IconButton
              onClick={() => handleCopyToClipboard(address)}
              sx={{ marginLeft: 1 }}
            >
              <ContentCopyIcon />
            </IconButton>
          )}
        </Typography>

        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Public Key
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          {publicKey || "Not generated yet."}
          {publicKey && (
            <IconButton
              onClick={() => handleCopyToClipboard(publicKey)}
              sx={{ marginLeft: 1 }}
            >
              <ContentCopyIcon />
            </IconButton>
          )}
        </Typography>

        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Private Key
        </Typography>
        <Typography variant="body1" sx={{ marginBottom: 2 }}>
          {privateKey || "Not generated yet."}
          {privateKey && (
            <IconButton
              onClick={() => handleCopyToClipboard(privateKey)}
              sx={{ marginLeft: 1 }}
            >
              <ContentCopyIcon />
            </IconButton>
          )}
        </Typography>
      </Box>

      {/* Box for the back to login button */}
      <Box sx={{ marginTop: 3 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBackToLogin}
          sx={{
            padding: "10px 20px",
            fontSize: "1rem",
          }}
        >
          Go to Login
        </Button>
      </Box>
    </Box>
  );
}
