import { Route, Routes, useLocation } from "react-router-dom";
import Files from "./components/Files/Files";
import Explore from "./components/Explore/Explore";
import Peers from "./components/Peers/Peers";
import Settings from "./components/Settings/Settings";
import Status from "./components/Status/Status";
import Home from "./components/Home/Home";
import Nav from "./components/Navigation/Nav";
import { ThemeProvider } from "@mui/material/styles";
import oceanTheme from "./theme"; // Import the theme from the theme.js file
import Login from "./components/Login/Login";
import LearnMore from "./components/LearnMore/LearnMore";
import GenerateKeys from "./components/GenerateKeys/GenerateKeys";

function App() {
  const location = useLocation(); // Get the current location

  // List of paths where the navbar should be hidden
  const hideNavPaths = ["/", "/learn-more", "/generate-keys"];

  return (
    <ThemeProvider theme={oceanTheme}>
      {!hideNavPaths.includes(location.pathname) && <Nav />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/generate-keys" element={<GenerateKeys />} />

        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Status />} />
        <Route path="/files" element={<Files />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/proxy" element={<Peers />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
