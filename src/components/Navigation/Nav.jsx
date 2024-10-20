import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Settings,
  Description,
  People,
  TravelExplore,
  SentimentSatisfiedAlt,
  Logout,
} from "@mui/icons-material"; // Import the Logout icon
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme as useThemeContext } from "../../ThemeContext"; // Import the ThemeContext

export default function Nav() {
  // Get the current path
  const location = useLocation();
  const navigate = useNavigate(); // Use navigate for programmatic navigation
  const { setDarkMode } = useThemeContext(); // Get setDarkMode from ThemeContext

  // Function to check which navigation link is active
  const isActive = (path) => location.pathname === path;

  // Function to handle logout
  const handleLogout = () => {
    // Reset the theme to light mode
    setDarkMode(false); // Set dark mode to false on logout
    // Navigate to the login page (root path)
    navigate("/");
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        "& .MuiDrawer-paper": {
          width: "13vw",
          boxSizing: "border-box",
          backgroundColor: "#000000", // Set to primary color directly
          color: "#ffffff", // Set text color directly
        },
      }}
    >
      <Box
        sx={{
          margin: 3,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Link to="/home" style={{ textDecoration: "none" }}>
          <img src="src/assets/logo.png" alt="LOGO" height={120} />
        </Link>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%", // Make the Box take the full height of the Drawer
        }}
      >
        {/* Top List Section */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/files"
              sx={{
                height: "10vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isActive("/files") ? "#7a99d9" : "transparent", // Use light blue directly
                "&:hover": {
                  backgroundColor: "#7a99d9", // Use light blue directly
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <Description sx={{ color: "white", fontSize: "2rem" }} />
              </ListItemIcon>
              <ListItemText
                primary="FILES"
                primaryTypographyProps={{ fontSize: "0.9rem" }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/explore"
              sx={{
                height: "10vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isActive("/explore") ? "#7a99d9" : "transparent", // Use light blue directly
                "&:hover": {
                  backgroundColor: "#7a99d9", // Use light blue directly
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <TravelExplore sx={{ color: "white", fontSize: "2rem" }} />
              </ListItemIcon>
              <ListItemText
                primary="EXPLORE"
                primaryTypographyProps={{ fontSize: "0.9rem" }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/proxy"
              sx={{
                height: "10vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isActive("/proxy") ? "#7a99d9" : "transparent", // Use light blue directly
                "&:hover": {
                  backgroundColor: "#7a99d9", // Use light blue directly
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <People sx={{ color: "white", fontSize: "2rem" }} />
              </ListItemIcon>
              <ListItemText
                primary="PROXY"
                primaryTypographyProps={{ fontSize: "0.9rem" }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/profile"
              sx={{
                height: "10vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isActive("/profile") ? "#7a99d9" : "transparent", // Use light blue directly
                "&:hover": {
                  backgroundColor: "#7a99d9", // Use light blue directly
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <SentimentSatisfiedAlt
                  sx={{ color: "white", fontSize: "2rem" }}
                />
              </ListItemIcon>
              <ListItemText
                primary="PROFILE"
                primaryTypographyProps={{ fontSize: "0.9rem" }}
              />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Bottom List Section */}
        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/settings"
              sx={{
                height: "8vh", // Reduced height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isActive("/settings") ? "#7a99d9" : "transparent", // Use light blue directly
                "&:hover": {
                  backgroundColor: "#7a99d9", // Use light blue directly
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <Settings sx={{ color: "white", fontSize: "1.6rem" }} /> {/* Reduced icon size */}
              </ListItemIcon>
              <ListItemText
                primary="SETTINGS"
                primaryTypographyProps={{ fontSize: "0.75rem" }} // Reduced text size
              />
            </ListItemButton>
          </ListItem>

          {/* Logout Button */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                height: "8vh", // Reduced height
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "#7a99d9", // Use light blue directly
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <Logout sx={{ color: "white", fontSize: "1.6rem" }} /> {/* Reduced icon size */}
              </ListItemIcon>
              <ListItemText
                primary="LOGOUT"
                primaryTypographyProps={{ fontSize: "0.75rem" }} // Reduced text size
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
