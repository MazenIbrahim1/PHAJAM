const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("walletApi", {
  // Check if the wallet exists
  checkWallet: () => ipcRenderer.invoke("check-wallet"),

  // Create a wallet with the provided password
  createWallet: (password) => ipcRenderer.invoke("create-wallet", password),
});

console.log("Preload script loaded!");
