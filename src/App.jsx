import { Route, Routes } from "react-router-dom";
import Files from "./components/Files/Files";
import Explore from "./components/Explore/explore";
import Peers from "./components/Peers/Peers";
import Settings from "./components/Settings/Settings";
import Status from "./components/Status/Status";
import Home from "./components/Home/Home";
import Nav from "./components/Navigation/Nav";
import { ThemeProvider } from "@mui/material/styles";
import oceanTheme from "./theme"; // Import the theme from the theme.js file

function App() {
  return (
    <ThemeProvider theme={oceanTheme}>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/status" element={<Status />} />
        <Route path="/files" element={<Files />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/peers" element={<Peers />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
