import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Snackbar } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Function to generate a random key
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

  const handleBackToLogin = () => {
    navigate("/");
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
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f4f8",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: "1200px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 3,
          }}
        >
          <Box
            sx={{
              flex: 7,
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: "700px",
              width: "100%",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Instructions</Typography>
              <Typography variant="body2">
                Please follow the instructions provided to use create your account.<br />
                <br />
                You have been provided with a Dolphincoin Address, Public Key, and Private Key. In order to access these, you must first create the password for your accounnt. <br />
                Once you have successfully created your password, your Dolphincoin Address, Public Key, and Private Key will automatically be downloaded onto your device. 
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>MAKE SURE YOU DO NOT LOSE THESE FILES!</Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>Generated Keys</Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2, marginTop: 2 }}>
                <Typography variant="body1">Dolphincoin Address:</Typography>
                <Typography variant="body1" sx={{ wordWrap: "break-word", marginRight: 1 }}>
                  {address || "Not generated yet."}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Typography variant="body1">Public Key:</Typography>
                <Typography variant="body1" sx={{ wordWrap: "break-word", marginRight: 1 }}>
                  {"*".repeat(publicKey.length)} {/* Display public key as asterisks */}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                <Typography variant="body1">Private Key:</Typography>
                <Typography variant="body1" sx={{ wordWrap: "break-word", marginRight: 1 }}>
                  {"*".repeat(privateKey.length)} {/* Display private key as asterisks */}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 3,
              backgroundColor: "#fff",
              borderRadius: "10px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 2,
              maxWidth: "600px",
              width: "100%",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>Set Your Password</Typography>
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
              sx={{ color: passwordMatch ? "green" : "red", marginTop: 1 }}
            >
              {passwordMatch ? "Passwords match!" : "Passwords do not match!"}
            </Typography>

            <Box sx={{ marginTop: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Password Requirements:
              </Typography>
              <Typography variant="body2" sx={{ color: passwordValidations.length ? "green" : "red" }}>
                - Length: 8-15 characters
              </Typography>
              <Typography variant="body2" sx={{ color: passwordValidations.number ? "green" : "red" }}>
                - At least one number
              </Typography>
              <Typography variant="body2" sx={{ color: passwordValidations.specialChar ? "green" : "red" }}>
                - At least one special character
              </Typography>
            </Box>

            <Button variant="contained" onClick={handleSavePassword} sx={{ marginTop: 2 }}>
              Create Account
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginTop: 2,
          }}
        >
          <Button 
            variant="contained"
            onClick={handleBackToLogin}
            color="secondary">
            Back to Login
          </Button>
        </Box>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          message="Password saved successfully!"
        />
      </Box>
    </Box>
  );
}
