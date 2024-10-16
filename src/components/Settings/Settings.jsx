import { Box, Typography, Button, Switch, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export default function SettingsPage() {
  // State for dark mode toggle
  const [darkMode, setDarkMode] = useState(false);

  // State for dialog visibility
  const [open, setOpen] = useState(false);

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Open the dialog
  const handleOpenDialog = () => {
    setOpen(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpen(false);
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // Add account deletion logic here
    console.log("Account deleted");
    setOpen(false); // Close the dialog after deletion
  };

  return (
    <Box
      sx={{
        width: "100vw", // Full width of the viewport
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3, // Space between rows
        overflowY: "auto", // Allow vertical scrolling if needed
        overflowX: "hidden", // Prevent horizontal scrolling
        height: "100vh", // Full height of the viewport
        boxSizing: "border-box", // Ensure padding doesn't affect width
        backgroundColor: darkMode ? "#18191e" : "#ffffff", // Change background based on dark mode
        color: darkMode ? "#ffffff" : "#000000", // Text color changes based on mode
      }}
    >
      <Box
        sx={{
          marginLeft: "13vw", // Set the left margin for alignment
          display: "flex",
          flexDirection: "row", // Row direction for side-by-side layout
          justifyContent: "space-between",
          gap: 4, // Increased space between the two boxes
        }}
      >
        {/* Light/Dark Mode Toggle */}
        <Box
          sx={{
            flex: 1, // Ensure the box takes equal width
            backgroundColor: darkMode ? "#333333" : "#f0f0f0", // Box background color changes
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "125px", // Reduced height for both boxes
          }}
        >
          <Typography
            variant="h6"
            sx={{
              marginBottom: 1,
              color: darkMode ? "#ffffff" : "#000000", // Text color changes based on dark mode
              fontWeight: "bold", // Make text bold
            }}
          >
            THEME SETTINGS
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            Toggle between light and dark mode to customize the appearance of the application.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            <FormControlLabel
              control={
                <Switch checked={darkMode} onChange={handleDarkModeToggle} />
              }
              label={darkMode ? "Dark Mode" : "Light Mode"}
              sx={{ color: darkMode ? "#ffffff" : "#000000" }}
            />
            {darkMode ? (
              <DarkModeIcon sx={{ color: "#ffffff", ml: 0 }} /> // Adjusted to move the icon 1px to the left
            ) : (
              <LightModeIcon sx={{ color: "#000000", ml: 0 }} /> // Adjusted to move the icon 1px to the left
            )}
          </Box>
        </Box>

        {/* Delete Account */}
        <Box
          sx={{
            flex: 1, // Ensure the box takes equal width
            backgroundColor: darkMode ? "#333333" : "#f0f0f0", // Box background color changes
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "125px", // Reduced height for both boxes
          }}
        >
          <Typography
            variant="h6"
            sx={{
              marginBottom: 1,
              color: darkMode ? "#ffffff" : "#000000", // Text color changes based on dark mode
              fontWeight: "bold", // Make text bold
            }}
          >
            DELETE ACCOUNT
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 1 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" color="error" onClick={handleOpenDialog}>
              Delete Account
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-delete-dialog-title"
        aria-describedby="confirm-delete-dialog-description"
        PaperProps={{
          sx: {
            backgroundColor: darkMode ? "#333333" : "#ffffff", // Background color based on dark mode
            color: darkMode ? "#ffffff" : "#000000", // Text color based on dark mode
          },
        }}
      >
        <DialogTitle id="confirm-delete-dialog-title">
          {"Confirm Account Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="confirm-delete-dialog-description"
            sx={{ color: darkMode ? "#ffffff" : "#000000" }} // Adjust text color based on dark mode
          >
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={{ color: darkMode ? "#ffffff" : "#000000" }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" autoFocus>
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
