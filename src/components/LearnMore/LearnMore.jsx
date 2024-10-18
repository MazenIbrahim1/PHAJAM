import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LearnMore() {
  const navigate = useNavigate(); // Get the navigate function

  // Function to handle returning to the login page
  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f0f4f8, #e1e9f1)", // Background gradient
        color: "#333",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "900px", // Increased max width for the inner box
          backgroundColor: "#fff", // White background for the inner box
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)", // Soft shadow for the card effect
          padding: "40px", // Increased padding for more spacing
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
          We are building Dolphin Data Sharing, a mindful decentralized file-sharing application powered by DolphinCoin. This blockchain-based platform offers secure and private peer-to-peer file sharing with key features including <b>STATUS</b> to monitor connection and network performance, <b>FILES</b> for managing personal data, and <b>EXPLORE</b> to browse files shared by peers. Users can connect with active peers through <b>PEERS</b>, customize their node settings in <b>SETTINGS</b>, and access the project README via <b>GITHUB</b>. Dolphin Data Sharing ensures efficient, secure, and fully decentralized file sharing, enhancing privacy and control.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBackToLogin}
          sx={{
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#1976d2", // Primary button color
            "&:hover": {
              backgroundColor: "#1565c0", // Hover effect
            },
          }}
        >
          Back to Login
        </Button>
      </Box>
    </Box>
  );
}
