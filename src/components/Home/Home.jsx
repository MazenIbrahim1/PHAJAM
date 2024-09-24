import { Box, Typography } from "@mui/material";

export default function Home() {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography>Home</Typography>
    </Box>
  );
}
