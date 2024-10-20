import React from "react";
import { Box, Typography, TextField, Button, Link } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate(); 

  const handleLogin = () => {
    navigate("/home");
  };

  const handleLearnMore = () => {
    navigate("/learn-more"); 
  };

  const handleGenerateKeys = () => {
    navigate("/generate-keys");
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
