
const electron = require('electron');
const { app, BrowserWindow } = electron;

app.on('ready', () => {
  const mainWindow = new BrowserWindow({width: 1920, height: 1080});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
});