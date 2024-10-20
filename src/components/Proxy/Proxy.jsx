import React, { useState } from "react";
import { Box, Button, Typography, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import RouterIcon from '@mui/icons-material/Router';
import CloseIcon from '@mui/icons-material/Close';

import ProxyBox from "./ProxyBox";

export default function Proxy() {

  // State for proxy toggle
  const [isProxy, setIsProxy] = useState(false);

  const [currentProxy, setCurrentProxy] = useState(null);
  
  const [priceOpened, setPriceOpened] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const handleToggleProxy = () => {
    if (isProxy) {
      setIsProxy(false);
    } else {
      openPrice();
    }
  }

  const handleSetCurrentProxy = (proxy) => {
    setCurrentProxy(proxy);
    setIsProxy(false); // Set isProxy to false whenever a proxy is set
  };

  const openPrice = () => {
    setPriceOpened(true);
  }

  const closePrice = () => {
    setPriceOpened(false);
    setIsProxy(true);
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
            <DialogTitle> Set Price </DialogTitle>
            <IconButton
                edge="end"
                color="inherit"
                onClick={cancelPrice}
                aria-label="close"
                sx={{ position: 'absolute', right: "6%", top: "3%" }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <form id = "priceForm" onSubmit = {handleSubmit}>
                    <TextField
                        margin = "dense"
                        label = "DOL / MB"
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
                        onClick = {() => setCurrentProxy(null)}
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
                            REMOVE CURRENT PROXY
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
                        CURRENT PROXY: {currentProxy.name.toUpperCase()} ({currentProxy.ip}, {currentProxy.price} BC/MB)
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
