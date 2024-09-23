import React from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";
import {
  Settings,
  Description,
  NetworkCheck,
  People,
  TravelExplore,
} from "@mui/icons-material";
//import { Link, useLocation, Router } from "react-router-dom";

export default function Nav() {
  // Instantiate link for navigation
  //const location = useLocation();

  // Function to check which navigation link is active
  //const isActive = (path) => location.pathname === path;

  return (
    <>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          "& .MuiDrawer-paper": {
            width: "13vw",
            boxSizing: "border-box",
            backgroundColor: "#0b3a53",
            color: "white",
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
          <img src="src/assets/temp_logo.png" alt="LOGO" height={140} />
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                height: "14vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                "&:hover": {
                  backgroundColor: "#1c2b48",
                },
              }}
              divider
            >
              <ListItemIcon>
                <NetworkCheck sx={{ color: "white", fontSize: "3rem" }} />
              </ListItemIcon>
              <ListItemText primary="STATUS" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              sx={{
                height: "14vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                "&:hover": {
                  backgroundColor: "#1c2b48",
                },
              }}
              divider
            >
              <ListItemIcon>
                <Description sx={{ color: "white", fontSize: "3rem" }} />
              </ListItemIcon>
              <ListItemText primary="FILES" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              sx={{
                height: "14vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                "&:hover": {
                  backgroundColor: "#1c2b48",
                },
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
              sx={{
                height: "14vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                "&:hover": {
                  backgroundColor: "#1c2b48",
                },
              }}
              divider
            >
              <ListItemIcon>
                <People sx={{ color: "white", fontSize: "3rem" }} />
              </ListItemIcon>
              <ListItemText primary="PEERS" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              sx={{
                height: "14vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                "&:hover": {
                  backgroundColor: "#1c2b48",
                },
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
    </>
  );
}
