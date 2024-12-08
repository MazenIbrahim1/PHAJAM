import React, { useEffect, useState } from "react";
import { Box, Button, Typography, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import RouterIcon from '@mui/icons-material/Router';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from "../../ThemeContext";
import ProxyBox from "./ProxyBox";

export default function Proxy() {

  const { darkMode, setDarkMode } = useTheme();

  const [peerID, setPeerID] = useState(null);
  useEffect(() => {
    fetch("http://localhost:8080/getPeerID")
        .then((response) => response.text())
        .then((data) => setPeerID(data))
        .catch((error) => console.error("Error fetching peerID: ", error));
  })

  // State for proxy toggle
  const [isProxy, setIsProxy] = useState(false);

  // Proxy chosen BEFORE confirmation
  const [selectedProxy, setSelectedProxy] = useState(null);

  // Proxy used AFTER confirmation
  const [currentProxy, setCurrentProxy] = useState(null);
  
  // Popup to confirm proxy choice
  const [confirmProxyOpened, setConfirmProxyOpened] = useState(false);

  // Popup to set price of your own proxy
  const [priceOpened, setPriceOpened] = useState(false);

  // Popup to confirm disabling of your own proxy
  const [confirmDisableProxyModeOpened, setConfirmDisableProxyModeOpened] = useState(false);

  // Popup to confirm disabling of proxy connection
  const [confirmDisconnectProxyOpen, setConfirmDisconnectProxyOpen] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const handleToggleProxy = () => {
    if (isProxy) {
      setConfirmDisableProxyModeOpened(true);
    } else {
      openPrice();
    }
  }

  const handleSetCurrentProxy = (proxy) => {
    setSelectedProxy(proxy);
    setConfirmProxyOpened(true);
    // setCurrentProxy(proxy);
    // setIsProxy(false); // Set isProxy to false whenever a proxy is set
  };

  const openPrice = () => {
    setPriceOpened(true);
  }

  const closePrice = async () => {

    // Register as proxy
    try {
        const response = await fetch("http://localhost:8080/registerProxy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ peerID: peerID }),
        });
        
        // const data = await response.json();
        if (response.ok) {
            setPriceOpened(false);
            setIsProxy(true);
        }
    } catch (error) {

    }
  }

  const cancelPrice = () => {
    setPriceOpened(false);
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    // Handle form submission

    closePrice();
  }

  const mockProxies = [
    { ip: "192.0.2.146", location: "New York, USA", name: "Proxy A", price: 10 },
    { ip: "1.2.3.4", location: "Beijing, China", name: "Proxy B", price: 15 },
    { ip: "01.102.103.104", location: "Taipei, Taiwan", name: "Proxy C", price: 20 },    
    { ip: "192.0.2.146", location: "New York, USA", name: "Proxy D", price: 10 },
    { ip: "1.2.3.4", location: "Beijing, China", name: "Proxy E", price: 15 },
    { ip: "01.102.103.104", location: "Taipei, Taiwan", name: "Proxy F", price: 20 },    
    { ip: "192.0.2.146", location: "New York, USA", name: "Proxy G", price: 10 },
    { ip: "1.2.3.4", location: "Beijing, China", name: "Proxy H", price: 15 },
    { ip: "01.102.103.104", location: "Taipei, Taiwan", name: "Proxy I", price: 20 },    
    { ip: "192.0.2.146", location: "New York, USA", name: "Proxy J", price: 10 },
  ]

  return (
    <Box
        sx={{
            // height: "100vh",
            marginLeft: "13vw",
            display: "flex",
            paddingLeft: 2,
            paddingRight: 2,
            flexDirection: "column",
            justifyContent: "top",
            alignItems: "center",
            color: darkMode ? "#ffffff" : "#000000",
            // border: 'dashed'
        }}
    >
        <Box
            sx = {{
                padding: 2
            }}
        >
            <Typography
                variant = "h4"
                sx = {{ fontWeight: "bold" }}
            >
                {mockProxies.length === 0 ? "NO " : ""} AVAILABLE PROXIES
            </Typography>
        </Box>
        <ProxyBox proxies = {mockProxies} setCurrentProxy = {handleSetCurrentProxy} />
        <Dialog open = {priceOpened}>
            <DialogTitle sx={{ paddingBottom: 0 }}> Set Price </DialogTitle>
            <IconButton
                edge="end"
                color="inherit"
                onClick={cancelPrice}
                aria-label="close"
                sx={{ position: 'absolute', right: "6%", top: "3%" }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ paddingTop: 1 }}>
                <form id = "priceForm" onSubmit = {handleSubmit}>
                    <TextField
                        margin = "dense"
                        label = "DC / MB"
                        type = "text"
                        fullWidth
                        variant = "outlined"
                        required
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    type = "submit" 
                    form = "priceForm" 
                    sx={{ right: "3.3%", marginTop: -2, marginBottom: 1 }}
                  >
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open = {confirmProxyOpened}>
            <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}> Use {selectedProxy == null ? "" : selectedProxy.name} as a proxy </DialogTitle>
            <Typography 
                sx={{ textAlign: "left", color: "red", fontSize: "0.875rem", wordBreak: "break-word", paddingLeft: 3, paddingRight: 3, marginTop: 1, marginBottom: 1 }}
            >
            Warning: You cannot connect to a proxy while being a proxy. You will be disabled as a proxy if you proceed.
            </Typography>
            <DialogActions sx = {{justifyContent: "center", paddingLeft: 3, paddingRight: 3}}>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setCurrentProxy(selectedProxy);
                        setIsProxy(false);
                        setConfirmProxyOpened(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Confirm
                </Button>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setConfirmProxyOpened(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open = {confirmDisableProxyModeOpened}>
            <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}> Disable proxy mode </DialogTitle>
            <DialogActions sx = {{justifyContent: "center", paddingLeft: 3, paddingRight: 3}}>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setIsProxy(false);
                        setConfirmDisableProxyModeOpened(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Confirm
                </Button>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setConfirmDisableProxyModeOpened(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open = {confirmDisconnectProxyOpen}>
            <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}> Disconnect from {currentProxy ? currentProxy.name : ""} </DialogTitle>
            <DialogActions sx = {{justifyContent: "center", paddingLeft: 3, paddingRight: 3}}>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setCurrentProxy(null);
                        setConfirmDisconnectProxyOpen(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Confirm
                </Button>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setConfirmDisconnectProxyOpen(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
        <Box
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx = {{
                backgroundColor: isProxy || (currentProxy && !isHovered) ? "green" : "red",
                color: "white",
                // paddingTop: 2,
                // paddingBottom: 2,
                borderRadius: 2,
                boxShadow: 1,
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
                // height: "125px", // Reduced height for both boxes
            }}
        >   
            {currentProxy ? (
                <>
                {isHovered ? (
                    <Button
                        onClick = {() => setConfirmDisconnectProxyOpen(true)}
                        sx = {{
                            display: "flex",
                            width: "100%",
                            height: "100%",
                            paddingTop: 2,
                            paddingBottom: 2,
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: "bold",
                                fontSize: "1.5rem"
                            }}
                        >
                            DISCONNECT FROM {currentProxy.name.toUpperCase()}
                        </Typography>
                    </Button>
                ) : (
                    <Typography
                        variant="h6"
                        sx={{
                            paddingTop: 2,
                            paddingBottom: 2,
                            fontWeight: "bold",
                            fontSize: "1.5rem"
                        }}
                    >
                        CURRENT PROXY: {currentProxy.name.toUpperCase()} ({currentProxy.ip}, {currentProxy.price} DC/MB)
                    </Typography>
                )}
                </>
            ) : (
                <>
                    <RouterIcon sx={{ paddingTop: 2, paddingBottom: 2, marginRight: 1, fontSize: "2rem" }} />
                    <Typography
                        variant="h6"
                        sx={{
                            paddingTop: 2,
                            paddingBottom: 2,
                            fontWeight: "bold",
                            fontSize: "1.5rem"
                        }}
                    >
                        PROXY MODE
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch sx={{ marginLeft: 2 }} checked={isProxy} onChange={handleToggleProxy} />
                        }
                        label={ isProxy ? "On" : "Off" }
                    />
                </>
            )}
        </Box>
    </Box>
  );
}
