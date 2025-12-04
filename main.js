const { app, BrowserWindow } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
let db;

function createWindow() {
  const win = new BrowserWindow({
    width: 1080,
    height: 900,
    webPreferences: {
      nodeIntegration: true,    // Permite usar require() en el renderer
      contextIsolation: false   // Permite que jQuery funcione directamente
    }
  });

  win.loadFile(path.join(__dirname, 'renderer/index.html'));
}

app.whenReady().then(() => {
  db = new Database(path.join(__dirname, 'zeda.db'));
  console.log("Base de datos conectada correctamente.");

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
