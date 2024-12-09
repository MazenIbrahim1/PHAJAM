const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("walletApi", {
  // Dynamically check wallet status
  checkWallet: () => ipcRenderer.invoke("check-wallet"),
});

console.log("Preload script loaded!");
