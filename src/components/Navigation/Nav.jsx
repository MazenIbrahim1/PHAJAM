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
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

export default function Nav() {
  // Get the current path
  const location = useLocation();
  const theme = useTheme(); // Access the theme

  // Function to check which navigation link is active
  const isActive = (path) => location.pathname === path;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        "& .MuiDrawer-paper": {
          width: "13vw",
          boxSizing: "border-box",
          backgroundColor: theme.palette.primary.main, // Use primary color from theme
          color: theme.palette.text.primary, // Use text color from theme
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
          <img src="src/assets/logo.png" alt="LOGO" height={140} />
        </Link>
      </Box>
      <List>
        

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/files"
            sx={{
              height: "14vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //flexDirection: "column",
              bgcolor: isActive("/files")
                ? theme.palette.primary.light
                : "transparent",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
              color: "white",
            }}
            divider
          >
            <ListItemIcon>
              <Description sx={{ color: "white", fontSize: "3rem" }} />
            </ListItemIcon>
            <ListItemText primary="FILES" sx={{ fontSize: "10rem" }} />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/explore"
            sx={{
              height: "14vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // flexDirection: "column",
              bgcolor: isActive("/explore")
                ? theme.palette.primary.light
                : "transparent",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
              color: "white",
            }}
            divider
          >
            <ListItemIcon>
              <TravelExplore sx={{ color: "white", fontSize: "3rem" }} />
            </ListItemIcon>
            <ListItemText primary="EXPLORE" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/proxy"
            sx={{
              height: "14vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // flexDirection: "column",
              bgcolor: isActive("/proxy")
                ? theme.palette.primary.light
                : "transparent",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
              color: "white",
            }}
            divider
          >
            <ListItemIcon>
              <People sx={{ color: "white", fontSize: "3rem" }} />
            </ListItemIcon>
            <ListItemText primary="PROXY" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/profile"
            sx={{
              height: "14vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //flexDirection: "column",
              bgcolor: isActive("/profile")
                ? theme.palette.primary.light
                : "transparent",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
              color: "white",
            }}
            divider
          >
            <ListItemIcon>
              <SentimentSatisfiedAlt sx={{ color: "white", fontSize: "3rem" }} />
            </ListItemIcon>
            <ListItemText primary="PROFILE" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton
            component={Link}
            to="/settings"
            sx={{
              height: "14vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              //flexDirection: "column",
              bgcolor: isActive("/settings")
                ? theme.palette.primary.light
                : "transparent",
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
              },
              color: "white",
            }}
            divider
          >
            <ListItemIcon>
              <Settings sx={{ color: "white", fontSize: "3rem" }} />
            </ListItemIcon>
            <ListItemText primary="SETTINGS" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
