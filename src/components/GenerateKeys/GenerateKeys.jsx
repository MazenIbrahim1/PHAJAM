import React, { useState, useEffect } from "react";
import { Box, Typography, Button, IconButton, TextField, Snackbar } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true); 
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();

  const handleGenerateKeys = () => {
    setAddress(generateRandomKey(42));
    setPublicKey(generateRandomKey(66));
    setPrivateKey(generateRandomKey(64));
  };

  useEffect(() => {
    handleGenerateKeys();
  }, []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  const handleDownloadFile = (fileName, content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8 && password.length <= 15,
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
    };
    setPasswordValidations(validations);
    return validations.length && validations.number && validations.specialChar;
  };

  const handleSavePassword = () => {
    if (password === confirmPassword && validatePassword(password)) {
      setPasswordSaved(true); 
      setSnackbarOpen(true); 
    } else {
      setPasswordSaved(false); 
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };


  useEffect(() => {
    setPasswordMatch(password === confirmPassword);
  }, [password, confirmPassword]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#ffffff",
        color: "#333",
        padding: "20px",
        paddingTop: "7%",
      }}
    >
      <Box sx={{ display: "flex", width: "100%", maxWidth: "1200px", gap: 3 }}>
        <Box
          sx={{
            flex: 1,
            maxWidth: "700px", 
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            padding: "20px",
            wordWrap: "break-word",
          }}
        >
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Dolphincoin Address <strong>(Make sure to save your Dolphincoin address for logging in)</strong>
          </Typography>
          <Typography variant="body1" sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            {address || "Not generated yet."}
            {address && (
              <>
                <IconButton onClick={() => handleCopyToClipboard(address)} sx={{ marginLeft: 1 }}>
                  <ContentCopyIcon />
                </IconButton>
                <IconButton onClick={() => handleDownloadFile("Dolphincoin_Address.txt", address)} sx={{ marginLeft: 1 }}>
                  <DownloadIcon />
                </IconButton>
              </>
            )}
          </Typography>

          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Public Key
          </Typography>
          <Typography variant="body1" sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            {publicKey || "Not generated yet."}
            {publicKey && (
              <>
                <IconButton onClick={() => handleCopyToClipboard(publicKey)} sx={{ marginLeft: 1 }}>
                  <ContentCopyIcon />
                </IconButton>
                <IconButton onClick={() => handleDownloadFile("Public_Key.txt", publicKey)} sx={{ marginLeft: 1 }}>
                  <DownloadIcon />
                </IconButton>
              </>
            )}
          </Typography>

          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            Private Key
          </Typography>
          <Typography variant="body1" sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
            {privateKey || "Not generated yet."}
            {privateKey && (
              <>
                <IconButton onClick={() => handleCopyToClipboard(privateKey)} sx={{ marginLeft: 1 }}>
                  <ContentCopyIcon />
                </IconButton>
                <IconButton onClick={() => handleDownloadFile("Private_Key.txt", privateKey)} sx={{ marginLeft: 1 }}>
                  <DownloadIcon />
                </IconButton>
              </>
            )}
          </Typography>

          <Box sx={{ marginTop: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handleDownloadFile("Dolphincoin_Address.txt", address);
                handleDownloadFile("Public_Key.txt", publicKey);
                handleDownloadFile("Private_Key.txt", privateKey);
              }}
              sx={{
                padding: "10px 20px",
                fontSize: "1rem",
                marginRight: "10px",
              }}
            >
              Download All Keys
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            maxWidth: "400px",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            padding: "20px", 
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Typography variant="h6">Set Your Password</Typography>
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            required
            error={!passwordMatch && confirmPassword !== ""}
          />
          <TextField
            label="Confirm Password"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
            }}
            required
            error={!passwordMatch && confirmPassword !== ""}
          />
          <Typography
            variant="body2"
            sx={{ color: passwordMatch ? "green" : "red" }}
          >
            {passwordMatch ? "Passwords match" : "Passwords do not match"}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 1 }}>
            <Typography variant="body2" sx={{ color: passwordValidations.length ? "green" : "#555" }}>
              {passwordValidations.length ? "✓ Length (8-15 characters)" : "✗ Length (8-15 characters)"}
            </Typography>
            <Typography variant="body2" sx={{ color: passwordValidations.number ? "green" : "#555" }}>
              {passwordValidations.number ? "✓ At least one number" : "✗ At least one number"}
            </Typography>
            <Typography variant="body2" sx={{ color: passwordValidations.specialChar ? "green" : "#555" }}>
              {passwordValidations.specialChar ? "✓ At least one special character" : "✗ At least one special character"}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSavePassword}
            sx={{
              padding: "10px 20px",
              fontSize: "1rem",
              marginTop: "10px",
              marginBottom: "10px",
            }}
          >
            Save Password
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={passwordSaved ? "Password saved successfully!" : "Failed to save password."}
        autoHideDuration={3000}
      />

      <Button
        variant="contained"
        onClick={handleBackToLogin}
        color="secondary"
        sx={{
          marginTop: "20px",
          alignSelf: "center",
        }}
      >
        Back to Login
      </Button>
    </Box>
  );
}