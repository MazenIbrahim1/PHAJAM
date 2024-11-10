import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LearnMore() {
  const navigate = useNavigate(); 

  // Function to handle returning to the login page
  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f4f8", 
        color: "#333",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "900px", 
          backgroundColor: "#fff", 
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", 
          padding: "40px", 
          textAlign: "center",
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: "bold" }}>
          What is Dolphin Data Sharing?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            marginBottom: 5,
            lineHeight: "1.6",
            fontSize: "1.1rem",
          }}
        >
          Dolphin Data Sharing is a decentralized file-sharing platform powered by DolphinCoin. Our blockchain-based system enables secure, private peer-to-peer sharing with enhanced control and transparency. Key features include the ability to explore files shared by others, make payments, or negotiate prices. The platform offers seamless wallet management, transaction tracking, and proxy options for accessing files. Users can also mine DolphinCoin directly within the app and enjoy customizable settings like dark mode and account management. Dolphin Data Sharing ensures efficient, secure, and fully decentralized file sharing, empowering users with privacy and flexibility.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBackToLogin}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
}
