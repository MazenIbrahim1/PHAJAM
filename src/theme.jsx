import { createTheme } from "@mui/material/styles";

const oceanTheme = createTheme({
  palette: {
    primary: {
      main: "#000000", // Deep blue
      light: "#7a99d9", // Light blue
    },
    secondary: {
      main: "#f06292", // Pink
      light: "#f8bbd0", // Light pink
    },
    background: {
      default: "#f0f4f8", // Soft background resembling ocean mist
      paper: "#ffffff",   // White background for paper elements
    },
    text: {
      primary: "#000000", // White text on the dark background
      secondary: "#000000", // Light text for inactive elements
    },
  },
  typography: {
    fontFamily: '"Bitter", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none",
    },
  },
});

export default oceanTheme;