import { Route, Routes, useLocation } from "react-router-dom";
import Files from "./components/Files/Files";
import Explore from "./components/Explore/Explore";
import Peers from "./components/Peers/Peers";
import Settings from "./components/Settings/Settings";
import Status from "./components/Status/Status";
import Home from "./components/Home/Home";
import Nav from "./components/Navigation/Nav";
import Login from "./components/Login/Login";
import LearnMore from "./components/LearnMore/LearnMore"; 
import GenerateKeys from "./components/GenerateKeys/GenerateKeys"

function App() {
  const location = useLocation(); // Get the current location

  // List of paths where the navbar should be hidden
  const hideNavPaths = ["/", "/learn-more", "/generate-keys"];

  return (
    <>
      {!hideNavPaths.includes(location.pathname) && <Nav />}
      <Routes>
        <Route path="/" element={<Login />} />        
        <Route path="/learn-more" element={<LearnMore />} /> 
        <Route path="/generate-keys" element={<GenerateKeys />} /> 

        <Route path="/home" element={<Home />} />
        <Route path="/status" element={<Status />} />
        <Route path="/files" element={<Files />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/peers" element={<Peers />} />
        <Route path="/settings" element={<Settings />} />

      </Routes>
    </>
  );
}

export default App;
