import React from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate(); 

  // Function to handle login button click
  const handleLogin = () => {
    navigate("/home"); // Navigate to the home page
  };

  // Function to handle "Learn More" click
  const handleLearnMore = () => {
    navigate("/learn-more"); // Navigate to the learn-more page
  };

  // Function to handle "Generate Keys" button click
  const handleGenerateKeys = () => {
    navigate("/generate-keys"); // Navigate to the generate-keys page
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
        backgroundColor: "#ffffff",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          marginBottom: 3,
          fontWeight: "bold", 
        }}
      >
        Welcome to Dolphin Data Sharing! (DDS)
      </Typography>
      <TextField
        label="Dolphincoin Address"
        variant="outlined"
        sx={{
          marginBottom: 2,
          width: "300px",
          backgroundColor: "white", 
        }}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        sx={{
          marginBottom: 3,
          width: "300px",
          backgroundColor: "white", 
        }}
      />
      <Button
        variant="contained"
        sx={{ backgroundColor: "black", color: "white" }} 
        onClick={handleLogin}
      >
        Log In
      </Button>
      <Typography sx={{ marginTop: 5 }}>
        Don't have an account?
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleGenerateKeys}
        sx={{ marginTop: 1, marginBottom: 8 }}
      >
        Generate Keys
      </Button>
      <Typography variant="body2">
        Not sure about Dolphin Data Sharing?{" "}
        <Link onClick={handleLearnMore} underline="always" style={{ cursor: "pointer" }}>
          Learn more
        </Link>
      </Typography>
    </Box>
  );
}
