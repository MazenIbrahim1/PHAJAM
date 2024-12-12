import React, { useEffect, useState } from "react";
import { Box, Button, Typography, FormControlLabel, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from "@mui/material";
import RouterIcon from '@mui/icons-material/Router';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from "../../ThemeContext";
import ProxyBox from "./ProxyBox";
import proxyInstructionsImage from './proxyInstructions.png'
import disconnectProxyInstructionsImage from './disconnectProxyInstructions.png'

export default function Proxy() {

  const { darkMode, setDarkMode } = useTheme();

  // State for proxy toggle
  const [isProxy, setIsProxy] = useState(false);

  // List of available proxies
  const [proxyInfoList, setProxyInfoList] = useState([]);

  useEffect(() => {

    // Check if I am a proxy
    const fetchProxyStatus = async () => {
        try {
            const response = await fetch("http://localhost:8080/isProxy");
            if (!response.ok) {
                throw new Error("Failed to fetch proxy status");
            }
            const data = await response.json();
            setIsProxy(data.isProxy);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch list of proxies
    const fetchProxyList = async () => {
        try {
            const response = await fetch("http://localhost:8080/fetchProxyList");
            if (!response.ok) {
                throw new Error("Failed to fetch proxy list");
            }
            const data = await response.json();
            data == null ? setProxyInfoList([]) : setProxyInfoList(data);
            console.log(proxyInfoList);
        } catch (err) {
            console.error(err);
        }
    }

    fetchProxyStatus();
    fetchProxyList();

    // Set interval to fetch proxy list every 5 seconds
    const intervalId = setInterval(fetchProxyList, 5000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [])

  // Proxy chosen BEFORE confirmation
  const [selectedProxy, setSelectedProxy] = useState(null);

  // Proxy used AFTER confirmation
  const [currentProxy, setCurrentProxy] = useState(null);

  // Popup if choosing proxy while already connected to another
  const [proxyAlreadyConnectedOpened, setProxyAlreadyConnectedOpened] = useState(false);
  
  // Popup to confirm proxy choice
  const [confirmProxyOpened, setConfirmProxyOpened] = useState(false);

  // Popup for using proxy instructions
  const [proxyInstructionsOpened, setProxyInstructionsOpened] = useState(false);

  // Popup for disconnecting from proxy instructions
  const [disconnectProxyInstructionsOpened, setDisconnectProxyInstructionsOpened] = useState(false);

  // Name and price of your proxy
  const [name, setName] = useState("");
  const [initialFee, setInitialFee] = useState("");
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState("");

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
    if (currentProxy != null) {
        setProxyAlreadyConnectedOpened(true);
    } else {
        setSelectedProxy(proxy);
        setConfirmProxyOpened(true);    
    }
    // setCurrentProxy(proxy);
    // setIsProxy(false); // Set isProxy to false whenever a proxy is set
  };

  const openPrice = () => {
    setPriceOpened(true);
  }

  const closePrice = async () => {

    // Register as proxy
    try {
        const data = {
            action: "register",  // Register the proxy
            name: name,
            initialFee: initialFee,
            price: price,
        };
        const response = await fetch("http://localhost:8080/registerProxy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        
        // const data = await response.json();
        if (response.ok) {
            const startProxyResponse = await fetch("http://localhost:50001/startProxy", {
                method: "POST",
            });

            if (!startProxyResponse.ok) {
                const data2 = {
                    action: "deregister",  // Deregister the proxy
                };
                await fetch("http://localhost:8080/registerProxy", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data2),
                });
                alert("Failed to start the proxy server!");
            } else {
                setIsProxy(true);
            }
        }
        setPriceOpened(false);
        setName("");
        setInitialFee("");
        setPrice("");
        setPriceError("");
    } catch (error) {

    }
  }

  const cancelPrice = () => {
    setName("");
    setInitialFee("");
    setPrice("");
    setPriceError("");
    setPriceOpened(false);
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    // Handle form submission

    const initialFeeValue = parseFloat(initialFee);
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0 || isNaN(initialFeeValue) || initialFeeValue <= 0) {
        setPriceError("Error: Invalid Fee or Price!");
        return
    }
    
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
                {proxyInfoList.length === 0 ? "NO " : ""} AVAILABLE PROXIES
            </Typography>
        </Box>
        <ProxyBox proxies = {proxyInfoList} setCurrentProxy = {handleSetCurrentProxy} />
        <Dialog open = {priceOpened}>
            <DialogTitle sx={{ paddingBottom: 0 }}> Set Proxy Details </DialogTitle>
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
                        label = "Name"
                        type = "text"
                        fullWidth
                        variant = "outlined"
                        value = {name}
                        onChange = {(e) => setName(e.target.value)}
                        required
                    />
                    <TextField
                        margin = "dense"
                        label = "Initial Fee (DC)"
                        type = "text"
                        fullWidth
                        variant = "outlined"
                        value = {initialFee}
                        onChange = {(e) => setInitialFee(e.target.value)}
                        required
                    />
                    <TextField
                        margin = "dense"
                        label = "Rate (DC / MB)"
                        type = "text"
                        fullWidth
                        variant = "outlined"
                        value = {price}
                        onChange = {(e) => setPrice(e.target.value)}
                        required
                    />
                </form>
            </DialogContent>
            <Typography 
                sx={{ textAlign: "left", color: "red", fontSize: "0.875rem", wordBreak: "break-word", paddingLeft: 3, paddingRight: 3, marginTop: -1, marginBottom: 3 }}
            >
                {priceError}
            </Typography>
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
        <Dialog open = {proxyAlreadyConnectedOpened}>
            <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}> Already connected to a proxy </DialogTitle>
            <Typography 
                sx={{ textAlign: "left", color: "red", fontSize: "0.875rem", wordBreak: "break-word", paddingLeft: 3, paddingRight: 3, marginTop: 1, marginBottom: 1 }}
            >
            Error: You cannot connect to multiple proxies. Please disconnect from the current one to proceed.
            </Typography>
            <DialogActions sx = {{justifyContent: "center", paddingLeft: 3, paddingRight: 3}}>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setProxyAlreadyConnectedOpened(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    OK
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
                        setProxyInstructionsOpened(true);
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
        <Dialog open = {proxyInstructionsOpened}>
            <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}> Set up {currentProxy == null ? "" : currentProxy.name} as your proxy </DialogTitle>
            <Typography 
                sx={{ alignContent: "center", textAlign: "center", color: "red", fontSize: "0.875rem", wordBreak: "break-word", paddingLeft: 3, paddingRight: 3, marginTop: 1, marginBottom: 1 }}
            >
                To connect to your proxy, configure your device's proxy settings:<br />
                IP: {currentProxy == null ? "" : currentProxy.ip_address} <br />
                PORT: {currentProxy == null ? "" : currentProxy.port}
                <img
                    src = {proxyInstructionsImage}
                    alt = "Proxy Setup"
                    style = {{
                        display: "block",
                        width: "100%"
                    }}
                />
            </Typography>
            <DialogActions sx = {{justifyContent: "center", paddingLeft: 3, paddingRight: 3}}>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setIsProxy(false);
                        setProxyInstructionsOpened(false);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open = {disconnectProxyInstructionsOpened}>
            <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}> Disconnect from {currentProxy == null ? "" : currentProxy.name} </DialogTitle>
            <Typography 
                sx={{ alignContent: "center", textAlign: "center", color: "red", fontSize: "0.875rem", wordBreak: "break-word", paddingLeft: 3, paddingRight: 3, marginTop: 1, marginBottom: 1 }}
            >
                Please disconnect via your device's proxy settings:<br />
                <img
                    src = {disconnectProxyInstructionsImage}
                    alt = "Disconnect Proxy"
                    style = {{
                        display: "block",
                        width: "100%"
                    }}
                />
            </Typography>
            <DialogActions sx = {{justifyContent: "center", paddingLeft: 3, paddingRight: 3}}>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {() => {
                        setDisconnectProxyInstructionsOpened(false);
                        setCurrentProxy(null);
                    }}
                    sx={{ paddingTop: 1, marginBottom: 1 }}
                    fullWidth
                  >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog open = {confirmDisableProxyModeOpened}>
            <DialogTitle sx={{ textAlign: "center", paddingBottom: 0 }}> Disable proxy mode </DialogTitle>
            <DialogActions sx = {{justifyContent: "center", paddingLeft: 3, paddingRight: 3}}>
                <Button 
                    variant = "contained"
                    backgroundColor = "black"
                    onClick = {async () => {
                        try {
                            const data = {
                                action: "deregister",  // Deregister the proxy
                            };
                            const response = await fetch("http://localhost:8080/registerProxy", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify(data),
                            });
                            
                            if (response.ok) {
                                const stopProxyResponse = await fetch("http://localhost:50001/stopProxy", {
                                    method: "POST",
                                });
                    
                                if (!stopProxyResponse.ok) {
                                    alert("Failed to stop the proxy server!");
                                } else {
                                    setIsProxy(false);
                                }
                            }
                            setConfirmDisableProxyModeOpened(false);
                        } catch (error) {
                            console.error(error);
                        }
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
                        setConfirmDisconnectProxyOpen(false);
                        setDisconnectProxyInstructionsOpened(true);
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
                            Disconnect from {currentProxy.name}
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
                        Current Proxy: {currentProxy.name} ({currentProxy.price} DC/MB)
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
