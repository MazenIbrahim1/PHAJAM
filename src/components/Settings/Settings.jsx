import { Box, Typography, Button, Switch, FormControlLabel, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useState } from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useTheme } from "../../ThemeContext"; // Make sure this path is correct

export default function SettingsPage() {
  const { darkMode, setDarkMode } = useTheme(); // Use the theme context

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
    // Update dark mode state before redirecting
    setDarkMode(false); // Reset to light mode
    // Redirect to login page
    window.location.href = "/"; // Change to your login page URL if needed
};


  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        overflowY: "auto",
        overflowX: "hidden",
        height: "100vh",
        boxSizing: "border-box",
        backgroundColor: darkMode ? "#18191e" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      }}
    >
      {/* Other components remain unchanged */}
      <Box
        sx={{
          marginLeft: "13vw",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        {/* Light/Dark Mode Toggle */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: darkMode ? "#333333" : "#f0f0f0",
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "125px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              marginBottom: 1,
              color: darkMode ? "#ffffff" : "#000000",
              fontWeight: "bold",
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
                <Switch
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                  sx={{
                    "& .MuiSwitch-thumb": {
                      backgroundColor: "#ffffff",
                    },
                    "&.Mui-checked .MuiSwitch-thumb": {
                      backgroundColor: "#ffffff",
                    },
                    "& .MuiSwitch-track": {
                      backgroundColor: "#cccccc",
                    },
                    "&.Mui-checked .MuiSwitch-track": {
                      backgroundColor: "#cccccc",
                    },
                  }}
                />
              }
              label={darkMode ? "Dark Mode" : "Light Mode"}
              sx={{ color: darkMode ? "#ffffff" : "#000000" }}
            />
            {darkMode ? (
              <DarkModeIcon sx={{ color: "#ffffff", ml: 0 }} />
            ) : (
              <LightModeIcon sx={{ color: "#000000", ml: 0 }} />
            )}
          </Box>
        </Box>

        {/* Delete Account */}
        <Box
          sx={{
            flex: 1,
            backgroundColor: darkMode ? "#333333" : "#f0f0f0",
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "125px",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              marginBottom: 1,
              color: darkMode ? "#ffffff" : "#000000",
              fontWeight: "bold",
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
            backgroundColor: darkMode ? "#333333" : "#ffffff",
            color: darkMode ? "#ffffff" : "#000000",
          },
        }}
      >
        <DialogTitle id="confirm-delete-dialog-title">
          {"Confirm Account Deletion"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="confirm-delete-dialog-description"
            sx={{ color: darkMode ? "#ffffff" : "#000000" }}
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
