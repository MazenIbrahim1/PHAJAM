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
  Home,
  Description,
  People,
  TravelExplore,
  SentimentSatisfiedAlt,
  Logout,
} from "@mui/icons-material"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme as useThemeContext } from "../../ThemeContext"; 

export default function Nav() {
  // Get the current path
  const location = useLocation();
  const navigate = useNavigate(); 
  const { setDarkMode } = useThemeContext(); 

  // Function to check which navigation link is active
  const isActive = (path) => location.pathname === path;

  // Function to handle logout
  const handleLogout = () => {
    setDarkMode(false); 
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
          backgroundColor: "#000000", 
          color: "#ffffff", 
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
          height: "100%", 
        }}
      >
        {/* Top List Section */}
        <List>

        <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/home"
              sx={{
                height: "10vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isActive("/home") ? "#7a99d9" : "transparent", 
                "&:hover": {
                  backgroundColor: "#7a99d9", 
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <Home sx={{ color: "white", fontSize: "2rem" }} />
              </ListItemIcon>
              <ListItemText
                primary="HOME"
                primaryTypographyProps={{ fontSize: "0.9rem" }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              to="/files"
              sx={{
                height: "10vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: isActive("/files") ? "#7a99d9" : "transparent", 
                "&:hover": {
                  backgroundColor: "#7a99d9", 
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
                bgcolor: isActive("/explore") ? "#7a99d9" : "transparent",
                "&:hover": {
                  backgroundColor: "#7a99d9",
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
                bgcolor: isActive("/profile") ? "#7a99d9" : "transparent", 
                "&:hover": {
                  backgroundColor: "#7a99d9", 
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
                bgcolor: isActive("/settings") ? "#7a99d9" : "transparent", 
                "&:hover": {
                  backgroundColor: "#7a99d9", 
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <Settings sx={{ color: "white", fontSize: "1.6rem" }} /> 
              </ListItemIcon>
              <ListItemText
                primary="SETTINGS"
                primaryTypographyProps={{ fontSize: "0.75rem" }} 
              />
            </ListItemButton>
          </ListItem>

          {/* Logout Button */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                height: "8vh", 
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  backgroundColor: "#7a99d9", 
                },
                color: "white",
              }}
              divider
            >
              <ListItemIcon>
                <Logout sx={{ color: "white", fontSize: "1.6rem" }} /> 
              </ListItemIcon>
              <ListItemText
                primary="LOGOUT"
                primaryTypographyProps={{ fontSize: "0.75rem" }} 
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
