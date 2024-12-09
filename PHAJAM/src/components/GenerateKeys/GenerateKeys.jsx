// import React, { useState, useEffect } from "react";
// import { Box, Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// const generateRandomKey = (length) => {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//     result += characters.charAt(Math.floor(Math.random() * characters.length));
//   }
//   return result;
// };

// export default function GenerateKeys() {
//   const [address, setAddress] = useState("");
//   const [publicKey, setPublicKey] = useState("");
//   const [privateKey, setPrivateKey] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordMatch, setPasswordMatch] = useState(true);
//   const [passwordSaved, setPasswordSaved] = useState(false);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [passwordValidations, setPasswordValidations] = useState({
//     length: false,
//     number: false,
//     specialChar: false,
//   });

//   const navigate = useNavigate();

//   const handleGenerateKeys = () => {
//     setAddress(generateRandomKey(42));
//     setPublicKey(generateRandomKey(57));
//     setPrivateKey(generateRandomKey(57));
//   };

//   useEffect(() => {
//     handleGenerateKeys();
//   }, []);

//   const handleBackToLogin = () => {
//     navigate("/");
//   };

//   const validatePassword = (password) => {
//     const validations = {
//       length: password.length >= 8 && password.length <= 15,
//       number: /\d/.test(password),
//       specialChar: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
//     };
//     setPasswordValidations(validations);
//     return validations.length && validations.number && validations.specialChar;
//   };

//   const downloadFile = (filename, content) => {
//     const element = document.createElement("a");
//     const file = new Blob([content], { type: "text/plain" });
//     element.href = URL.createObjectURL(file);
//     element.download = filename;
//     document.body.appendChild(element);
//     element.click();
//     document.body.removeChild(element);
//   };

//   const downloadAllFiles = () => {
//     downloadFile("Dolphincoin_Address.txt", address);
//     downloadFile("Public_Key.txt", publicKey);
//     downloadFile("Private_Key.txt", privateKey);
//   };

//   const handleSavePassword = () => {
//     if (password === confirmPassword && validatePassword(password)) {
//       setPasswordSaved(true);
//       setDialogOpen(true);
//       downloadAllFiles();
//     } else {
//       setPasswordSaved(false);
//     }
//   };

//   const handleDialogClose = () => {
//     setDialogOpen(false);
//   };

//   useEffect(() => {
//     setPasswordMatch(password === confirmPassword);
//   }, [password, confirmPassword]);

//   const isPasswordValid = () => {
//     return (
//       passwordValidations.length &&
//       passwordValidations.number &&
//       passwordValidations.specialChar &&
//       passwordMatch
//     );
//   };

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         height: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#f0f4f8",
//         padding: "20px",
//       }}
//     >
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           gap: 3,
//           maxWidth: "1200px",
//           width: "100%",
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             flexDirection: "row",
//             gap: 3,
//           }}
//         >
//           <Box
//             sx={{
//               flex: 7,
//               backgroundColor: "#fff",
//               borderRadius: "10px",
//               boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
//               padding: "20px",
//               display: "flex",
//               flexDirection: "column",
//               gap: 2,
//               maxWidth: "700px",
//               width: "100%",
//               border: '2px solid #b2dfdb',
//             }}
//           >
//             <Box>
//               <Typography variant="h6" sx={{ fontWeight: "bold" }}>
//                 Instructions
//               </Typography>
//               <Typography variant="body2" sx={{ fontWeight: "bold" }}>
//                 Please follow the instructions provided to create your account.<br /><br />
//               </Typography>
//               <Typography variant="body2">
//                 You have been provided with a Dolphincoin Address, Public Key, and Private Key. <br />
//                 In order to access these, you must first create the password for your account. <br />
//                 Once you have successfully created your password, your Dolphincoin Address, Public Key, and Private Key will automatically be downloaded onto your device.
//               </Typography>
//               <Typography variant="body2" sx={{ fontWeight: "bold" }}> <br /> MAKE SURE YOU DO NOT LOSE THESE FILES!</Typography>
//             </Box>

//             <Box>
//               <Typography variant="h6" sx={{ fontWeight: "bold" }}>Generated Wallet Address and Keys</Typography>

//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2, marginTop: 2 }}>
//                 <Typography variant="body1">Dolphincoin Address:</Typography>
//                 <Typography variant="body1" sx={{ wordWrap: "break-word", marginRight: 1 }}>
//                   {address}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
//                 <Typography variant="body1">Public Key:</Typography>
//                 <Typography variant="body1" sx={{ wordWrap: "break-word", marginRight: 1 }}>
//                   {publicKey}
//                 </Typography>
//               </Box>

//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
//                 <Typography variant="body1">Private Key:</Typography>
//                 <Typography variant="body1" sx={{ wordWrap: "break-word", marginRight: 1 }}>
//                   {"*".repeat(privateKey.length)}
//                 </Typography>
//               </Box>
//             </Box>
//           </Box>

//           <Box
//             sx={{
//               flex: 3,
//               backgroundColor: "#fff",
//               borderRadius: "10px",
//               boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
//               padding: "20px",
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//               gap: 2,
//               maxWidth: "600px",
//               width: "100%",
//               border: '2px solid #b2dfdb',
//             }}
//           >
//             <Typography variant="h6" sx={{ fontWeight: "bold" }}>Set Your Password</Typography>
//             <TextField
//               label="Password"
//               type="password"
//               variant="outlined"
//               value={password}
//               onChange={(e) => {
//                 setPassword(e.target.value);
//                 validatePassword(e.target.value);
//               }}
//               required
//               error={!passwordMatch && confirmPassword !== ""}
//             />
//             <TextField
//               label="Confirm Password"
//               type="password"
//               variant="outlined"
//               value={confirmPassword}
//               onChange={(e) => {
//                 setConfirmPassword(e.target.value);
//               }}
//               required
//               error={!passwordMatch && confirmPassword !== ""}
//             />
//             <Typography
//               variant="body2"
//               sx={{ color: passwordMatch ? "green" : "red", marginTop: 1 }}
//             >
//               {passwordMatch ? "Passwords match!" : "Passwords do not match!"}
//             </Typography>

//             <Box sx={{ marginTop: 2 }}>
//               <Typography variant="body2" sx={{ fontWeight: "bold" }}>
//                 Password Requirements:
//               </Typography>
//               <Typography variant="body2" sx={{ color: passwordValidations.length ? "green" : "red" }}>
//                 - Length: 8-15 characters
//               </Typography>
//               <Typography variant="body2" sx={{ color: passwordValidations.number ? "green" : "red" }}>
//                 - At least one number
//               </Typography>
//               <Typography variant="body2" sx={{ color: passwordValidations.specialChar ? "green" : "red" }}>
//                 - At least one special character
//               </Typography>
//             </Box>

//             <Button
//               variant="contained"
//               onClick={handleSavePassword}
//               disabled={!isPasswordValid()}
//               sx={{ marginTop: 2 }}
//             >
//               Create Account
//             </Button>
//           </Box>
//         </Box>

//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "center",
//             width: "100%",
//             marginTop: 2,
//           }}
//         >
//           <Button
//             variant="contained"
//             onClick={handleBackToLogin}
//             color="secondary">
//             Return to Login
//           </Button>
//         </Box>
//       </Box>

//       {/* Dialog Popup */}
//       <Dialog open={dialogOpen} onClose={handleDialogClose}>
//         <DialogTitle sx={{ fontWeight: "bold" }}>{"Account Created Successfully"}</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Your keys have been downloaded to your device.
//             If they did not download or an error occured, click here to download them again.
//             Please make sure to store them securely. <br />
//             <br />
//             You can now return to the login page.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             variant="contained"
//             onClick={downloadAllFiles}
//             backgroundColor="primary">
//             Download Again</Button>
//           <Button
//             variant="contained"
//             onClick={handleBackToLogin}
//             backgroundColor="secondary">
//             Return to Login
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// }

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function GenerateKeys() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    number: false,
    specialChar: false,
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);
  const [seed, setSeed] = useState(null);

  const navigate = useNavigate();

  const validatePassword = (password) => {
    const validations = {
      length: password.length >= 8 && password.length <= 15,
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>_]/.test(password),
    };
    setPasswordValidations(validations);
    return validations.length && validations.number && validations.specialChar;
  };

  const handleSavePassword = async () => {
    if (password !== confirmPassword || !validatePassword(password)) {
      setPasswordMatch(false);
      return;
    }

    setLoading(true); // Show loading dialog
    setDialogMessage("Creating your wallet. Please wait...");
    setDialogOpen(true);

    try {
      // Call backend to create the wallet with the user's password
      const response = await fetch("http://localhost:8080/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      console.log(data);
      console.log(data.message);
      console.log(data.seed);

      if (response.ok) {
        setCreateSuccess(true);
        setSeed(data.seed);
        setDialogMessage(
          `
          Wallet created successfully! Your wallet generation seed is :\n ${data.seed} \n
          Keep your seed in a safe place because you will NOT be able to restore your wallet without it.\n
          Make sure to keep the seed in a secure location and do not share it with anyone.\n
          You can now login!
          `
        );
      } else {
        setCreateSuccess(false);
        setDialogMessage(
          data.error || "Failed to create wallet. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating wallet:", error);
      setCreateSuccess(false);
      setDialogMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (createSuccess) navigate("/");
  };

  const isPasswordValid = () => {
    return (
      passwordValidations.length &&
      passwordValidations.number &&
      passwordValidations.specialChar &&
      passwordMatch
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f4f8",
        padding: "20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          padding: "20px",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Create a Wallet
        </Typography>
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validatePassword(e.target.value);
          }}
          required
        />
        <TextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Typography
          variant="body2"
          sx={{ color: passwordMatch ? "green" : "red", marginTop: 1 }}
        >
          {passwordMatch ? "Passwords match!" : "Passwords do not match!"}
        </Typography>

        <Box sx={{ marginTop: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            Password Requirements:
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: passwordValidations.length ? "green" : "red" }}
          >
            - Length: 8-15 characters
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: passwordValidations.number ? "green" : "red" }}
          >
            - At least one number
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: passwordValidations.specialChar ? "green" : "red" }}
          >
            - At least one special character
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleSavePassword}
          disabled={!isPasswordValid()}
        >
          Create Wallet
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/")}
          sx={{ marginTop: 2 }}
        >
          Return to Login
        </Button>
      </Box>

      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Wallet Creation</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMessage}</DialogContentText>
          {loading && (
            <Box
              sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}
            >
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
