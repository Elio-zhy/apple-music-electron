const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

//-------------------------------------------------------------------
// Logging
//
// THIS SECTION IS NOT REQUIRED
//
// This logging setup is not required for auto-updates to work,
// but it sure makes debugging easier :)
//-------------------------------------------------------------------
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Checks for updates
app.on('ready', function() {
  autoUpdater.checkForUpdatesAndNotify();
});

function createWindow() {
  // Window state
  let mainWindowState = windowStateKeeper({
      defaultWidth: 1000,
      defaultHeight: 800
  });
  // Create the browser window.
  const win = new BrowserWindow({
      icon: path.join(__dirname, 'assets/icon.png'),
      'x': mainWindowState.x,
      'y': mainWindowState.y,
      'width': mainWindowState.width,
      'height': mainWindowState.height,
      // Enables DRM
      webPreferences: {
          plugins: true,
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: true
      }
  });
  // Let us register listeners on the window, so we can update the state
  // automatically (the listeners will be removed when the window is closed)
  // and restore the maximized or full screen state
  mainWindowState.manage(win);
  // deletes toolbar entirely
  // can be replaced with "win.setAutoHideMenuBar(true)" to allow access by pressing alt but it was still loading by default when I tried it
  // toolbar is pretty useless anyway
  win.setMenuBarVisibility(false);
  // loads apple music webplayer
  win.loadURL('http://music.apple.com');
  // injects css from styles.css
  win.webContents.on('did-finish-load', function() {
      fs.readFile(__dirname + '/styles.css', "utf-8", function(error, data) {
          if (!error) {
              var formatedData = data.replace(/\s{2,10}/g, ' ').trim();
              win.webContents.insertCSS(formatedData);
          }
      });
  });
  // nukes electron when close button clicked
  // maybe not the cleanest solution but otherwise it does not exit while music is playing
  win.on('close', () => {
      app.exit();
  });
}
// enables DRM and opens window
app.on('widevine-ready', createWindow);