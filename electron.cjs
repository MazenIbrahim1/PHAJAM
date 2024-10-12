const { app, BrowserWindow } = require("electron");
const path = require("path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "./electron/preload.cjs"),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173/");
    win.openDevTools();
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
