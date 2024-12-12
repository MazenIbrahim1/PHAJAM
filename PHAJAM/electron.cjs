const { app, BrowserWindow, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

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

// IPC handler for checking wallet existence
ipcMain.handle("check-wallet", async () => {
  console.log("[Main Process] Handling 'check-wallet' request...");
  return checkWalletExists();
});

// IPC handler for creating a wallet
ipcMain.handle("create-wallet", async (event, password) => {
  try {
    console.log(`[Main Process] Attempting to create a wallet with the provided password...`);
    const walletCreationCommand = `btcwallet --create`;

    return new Promise((resolve, reject) => {
      const walletProcess = exec(walletCreationCommand);

      walletProcess.stdin.write(`${password}\n`);
      walletProcess.stdin.write(`${password}\n`);
      walletProcess.stdin.end();

      walletProcess.stdout.on("data", (data) => {
        console.log(`[Main Process] Wallet creation process: ${data}`);
      });

      walletProcess.stderr.on("data", (data) => {
        console.error(`[Main Process] Wallet creation error: ${data}`);
        reject({ success: false, error: data });
      });

      walletProcess.on("exit", (code) => {
        if (code === 0) {
          console.log("[Main Process] Wallet created successfully!");
          resolve({ success: true });
        } else {
          console.error(`[Main Process] Wallet creation failed with exit code ${code}.`);
          reject({ success: false, error: `Wallet creation failed with exit code ${code}.` });
        }
      });
    });
  } catch (error) {
    console.error("[Main Process] Error during wallet creation:", error);
    return { success: false, error: error.message };
  }
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
    autoHideMenuBar: true,
  });

  win.maximize();

  // Load React app based on environment
  //win.setMenu(null);
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
