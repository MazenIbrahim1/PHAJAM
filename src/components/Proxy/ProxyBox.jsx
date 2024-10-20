import React from "react"
import { Box, Button, Typography, Grid, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

const ProxyBox = ({proxies, setCurrentProxy}) => {
    return(
        <Box
            sx = {{
                // marginTop: 2,
                borderTop: "1px solid black",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                width: "100%",
                height: "100%",
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
            <Grid container spacing = {4}>
                {proxies.map((proxy, index) => (
                    <Grid item xs = {4} key = {index}>
                        <Box
                            sx = {{
                                flex: 1,
                                backgroundColor: "#f0f0f0",
                                marginTop: 2,
                                marginRight: 1,
                                borderRadius: 2,
                                boxShadow: 1,
                                display: "flex",
                                flexDirection: "row",
                                // height: "125px"
                            }}
                        >
                            <Box
                                sx = {{
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 4,
                                    // border: "dashed",
                                    padding: 2,
                                }}
                            >
                                <Typography variant = "h6" sx = {{ marginBottom: 1, fontWeight: "bold"}}>
                                    {proxy.name.toUpperCase()}
                                </Typography>
                                <Typography variant = "body2" sx = {{ marginBottom: 1 }}>
                                    IP: {proxy.ip}
                                </Typography>
                                <Typography variant = "body2" sx = {{ marginBottom: 1 }}>
                                    Location: {proxy.location}
                                </Typography>
                                <Typography variant = "body2" sx = {{ marginBottom: 1 }}>
                                    Price: {proxy.price} DC/MB
                                </Typography>
                            </Box>
                            <Button
                                onClick = {() => setCurrentProxy(proxy)}
                                sx = {{
                                    flex: 3,
                                    borderRadius: "0 8px 8px 0",
                                    backgroundColor: "black",
                                    '&:hover': {
                                        backgroundColor: "#444"
                                    },
                                    color: "white",
                                    // border: "solid"
                                }}
                            >
                                <Typography variant = "h5" sx = {{ fontWeight: "bold" }}>
                                    SELECT<br />
                                    AS<br />
                                    PROXY
                                </Typography>
                            </Button>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    )
}

export default ProxyBox;