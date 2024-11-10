import React from "react";
import { Box, Button, Typography, Grid } from "@mui/material";
import { useTheme } from "../../ThemeContext";

const ProxyBox = ({ proxies, setCurrentProxy }) => {
    const { darkMode } = useTheme(); 

    return (
        <Box
            sx={{
                marginBottom: 2,
                borderTop: "1px solid black",
                borderBottom: "1px solid black",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
                height: "75vh",
                overflowY: "auto",
                '&::-webkit-scrollbar': {
                    width: "8px",
                    marginLeft: 1
                },
                '&::-webkit-scrollbar-track': {
                    background: "#f1f1f1"
                },
                '&::-webkit-scrollbar-thumb': {
                    background: "#888",
                    borderRadius: "10px"
                },
                '&::-webkit-scrollbar-thumb:hover': {
                    background: "#555"
                }
            }}
        >
            <Grid container spacing={4}>
                {proxies.map((proxy, index) => (
                    <Grid item xs={3} key={index}>
                        <Box
                            sx={{
                                flex: 1,
                                backgroundColor: darkMode ? "#333333" : "#f0f0f0", 
                                marginTop: 2,
                                marginRight: 1,
                                borderRadius: 2,
                                boxShadow: 1,
                                display: "flex",
                                flexDirection: "row",
                            }}
                        >
                            <Box
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: 2,
                                }}
                            >
                                <Typography variant="h6" sx={{ marginBottom: 1, fontWeight: "bold", color: darkMode ? "#fff" : "#000" }}>
                                    {proxy.name.toUpperCase()}
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: 1, color: darkMode ? "#fff" : "#000" }}>
                                    IP: {proxy.ip}
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: 1, color: darkMode ? "#fff" : "#000" }}>
                                    Location: {proxy.location}
                                </Typography>
                                <Typography variant="body2" sx={{ marginBottom: 1, color: darkMode ? "#fff" : "#000" }}>
                                    Price: {proxy.price} DC/MB
                                </Typography>
                                <Button
                                    variant="contained"
                                    onClick={() => setCurrentProxy(proxy)}
                                    sx={{
                                        backgroundColor: darkMode ? "#f06292": "#000000",
                                        "&:hover": {
                                            backgroundColor: "#7a99d9",
                                        },
                                        color: "white",
                                        maxHeight: "50px"
                                    }}
                                >
                                    Select Proxy
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default ProxyBox;
