import {
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar, // Import Snackbar
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useState } from "react";
import { useTheme } from "../../ThemeContext";

export default function SettingsPage() {
  const { darkMode, setDarkMode } = useTheme();

  // State for dialog visibility
  const [open, setOpen] = useState(false);

  // States for password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // State for password validations
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    number: false,
    specialChar: false,
  });

  // State for password match status
  const [passwordsMatch, setPasswordsMatch] = useState(false);

  // State for Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("http://localhost:8080/wallet/delete");
      if (response.ok) {
        console.log("Account deleted");
        setDarkMode(false);
        setSnackbarMessage("Account deleted successfully.");
        setSnackbarOpen(true);
        window.location.href = "/";
      }
    } catch (err) {
      console.log("Error deleting account");
    }
  };

  // Password validation function
  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8 && password.length <= 15,
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|/<>_]/.test(password),
    };
    setPasswordValidations(validations);
    return validations.length && validations.number && validations.specialChar;
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      const response = await fetch(
        "http://localhost:8080/wallet/password-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword,
          }),
        }
      );
      console.log("Password updated", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setSnackbarMessage("Password updated successfully.");
      setSnackbarOpen(true);
    } catch (err) {
      console.log("Error changing password: ", err);
    }
  };

  // Handle password input change
  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    validatePassword(password);
    setPasswordsMatch(password === confirmPassword);
  };

  // Handle confirm password input change
  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = e.target.value;
    setConfirmPassword(confirmPassword);
    setPasswordsMatch(newPassword === confirmPassword);
  };

  const isSaveButtonEnabled = () => {
    return (
      passwordValidations.length &&
      passwordValidations.number &&
      passwordValidations.specialChar &&
      passwordsMatch
    );
  };

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        paddingInline: 3,
        display: "flex",
        flexDirection: "row",
        gap: 3,
        overflowY: "auto",
        overflowX: "hidden",
        height: "100vh",
        boxSizing: "border-box",
        backgroundColor: darkMode ? "#18191e" : "#ffffff",
        color: darkMode ? "#ffffff" : "#000000",
      }}
    >
      {/* Left Column: Password Reset */}
      <Box
        sx={{
          flex: 1,
          marginLeft: "13%",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Password Reset Box */}
        <Box
          sx={{
            backgroundColor: darkMode ? "#333333" : "#ffffff",
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "auto",
            border: "2px solid #b2dfdb",
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
            RESET PASSWORD
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Enter your old password and set a new password.
          </Typography>
          <TextField
            type="text" // Current Password
            label="Old Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            sx={{
              marginBottom: 2,
              backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
              "& .MuiInputBase-input": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
              "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
            }}
            fullWidth
          />

          <TextField
            type="text" // New Password
            label="New Password"
            value={newPassword}
            onChange={handleNewPasswordChange}
            sx={{
              marginBottom: 2,
              backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
              "& .MuiInputBase-input": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
              "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
            }}
            fullWidth
          />

          <TextField
            type="text" // Confirm Password
            label="Confirm Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            sx={{
              marginBottom: 2,
              backgroundColor: darkMode ? "#4a4a4a" : "#ffffff",
              "& .MuiInputBase-input": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiInputLabel-root": {
                color: darkMode ? "#ffffff" : "#000000",
              },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                borderColor: darkMode ? "#ffffff" : "#000000",
              },
              "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
              "&.Mui-focused .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                {
                  borderColor: darkMode ? "#ffffff" : "#000000",
                },
            }}
            fullWidth
          />
          {/* Password Validation Indicators */}
          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Password Requirements:
            </Typography>
            <Typography
              sx={{
                color: passwordValidations.length ? "green" : "red",
              }}
            >
              - 8-15 characters
            </Typography>
            <Typography
              sx={{
                color: passwordValidations.number ? "green" : "red",
              }}
            >
              - At least one number
            </Typography>
            <Typography
              sx={{
                color: passwordValidations.specialChar ? "green" : "red",
              }}
            >
              - At least one special character (!@#$%^&*...)
            </Typography>
          </Box>

          {/* Password Match Indicator */}
          <Typography
            sx={{
              color: passwordsMatch ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </Typography>

          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={!isSaveButtonEnabled()}
            sx={{
              marginTop: 2,
              backgroundColor: darkMode ? "#f06292" : "#000000",
              "&:hover": {
                backgroundColor: "#7a99d9",
              },
            }}
          >
            Save Password
          </Button>
        </Box>
      </Box>

      {/* Right Column: Theme Settings and Delete Account */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Theme Settings Box */}
        <Box
          sx={{
            backgroundColor: darkMode ? "#333333" : "#ffffff",
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "125px",
            border: "2px solid #b2dfdb",
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
            Toggle between light and dark mode to customize the appearance of
            the application.
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
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

        {/* Delete Account Box */}
        <Box
          sx={{
            backgroundColor: darkMode ? "#333333" : "#ffffff",
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "125px",
            border: "2px solid #b2dfdb",
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
            Permanently delete your account and all associated data. This action
            cannot be undone.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleOpenDialog}
            >
              Delete Account
            </Button>
            <Dialog open={open} onClose={handleCloseDialog}>
              <DialogTitle>Confirm Account Deletion</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Are you sure you want to permanently delete your account? This
                  action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <Button onClick={handleDeleteAccount} color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
}
