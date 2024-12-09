const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

// Function to determine the wallet path based on the operating system
function getWalletPath() {
  const homeDir = require("os").homedir();
  if (process.platform === "win32") {
    return path.join(homeDir, "AppData", "Local", "Btcwallet", "mainnet", "wallet.db");
  } else if (process.platform === "darwin") {
    return path.join(homeDir, "Library", "Application Support", "Btcwallet", "mainnet", "wallet.db");
  } else {
    return path.join(homeDir, ".btcwallet", "mainnet", "wallet.db");
  }
}

// Function to check if the wallet file exists
function checkWalletExists() {
  const walletPath = getWalletPath();
  const walletExists = fs.existsSync(walletPath);
  console.log(`[Main Process] Wallet exists: ${walletExists}, Path: ${walletPath}`);
  return walletExists;
}

// IPC handler for wallet status
ipcMain.handle("check-wallet", async () => {
  console.log("[Main Process] Handling 'check-wallet' request...");
  return checkWalletExists();
});

// Create the Electron browser window
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./electron/preload.cjs"),
      contextIsolation: true, // Secure context bridge
      nodeIntegration: false, // Disable direct Node.js access
      enableRemoteModule: false,
    },
  });

  win.maximize();
  win.setMenu(null);

  // Load React app based on environment
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "./dist/index.html"));
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
