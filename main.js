const { app, BrowserWindow, Menu, Tray } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')
const os = require('os')

const Store = require('data-store')
const config = new Store({ path: path.join(os.homedir(), '.config/volumio/config.json') });

const express = require('express')
const eapp = express()
const port = 8837

const urlExists = require('url-exists');

// ##################################################################### DEBUG
const showFrame = false;
const showDevTools = false;
const debugLog = true;

// ##################################################################### STATIC VARIABLES
const SERVER_CHECK_INTERVAL = 2000;

// ##################################################################### VARIABLES
let tray = null;
let win_main = null;
let win_settings = null;
let firstStart = false;
let loaded = false;

// ##################################################################### CONFIG
if (!config.has('width'))
  config.set('width', 400)
if (!config.has('height'))
  config.set('height', 600)
if (!config.has('url'))
  config.set('url', 'http://volumio.local/')
if (!config.has('onBlurClose'))
  config.set('onBlurClose', true)

// ##################################################################### SERVE STATIC CONTENT
eapp.use('/app/themes/volumio/assets/variants/volumio/fonts', express.static(path.join(__dirname, 'assets', 'fonts')))
eapp.use('/assets/css', express.static(path.join(__dirname, 'assets', 'css')))
eapp.use('/assets/fonts', express.static(path.join(__dirname, 'assets', 'fontawesome')))
eapp.use('/assets/img', express.static(path.join(__dirname, 'assets', 'img')))
eapp.listen(port, () => console.log(`Example app listening on port ${port}!`))

let debug = (...args) => {
  if (debugLog) {
    console.log(...args)
  }
}

// ##################################################################### LOADING VOLUMIO

let loadVolumio = () => {
  console.log("loadVolumio");
  loaded = false;
  urlExists(config.get('url'), function (err, exists) {
    if (err)
      debug(`Error@urlExists: ${err}`)
    debug(`${config.get('url')} exists ? ${exists}`);
    if (exists) {
      createMainWindow()
      win_main.loadURL(config.get('url'))
      win_main.show()
      createSettingsWindow()
      win_settings.loadURL(`file://${__dirname}/settings.html`)
      loaded = true
      firstStart = false
    } else {
      createMainWindow()
      createSettingsWindow()
      win_settings.loadURL(`file://${__dirname}/welcome.html`)
      loaded = true
      firstStart = true
    }
  });
}

// ##################################################################### FREQUENT CHECK

let periodicCheckServer = () => {
  console.log(firstStart, loaded);
  
  return setTimeout(() => {
    urlExists(config.get('url'), function (err, exists) {
      if (err)
        debug(`Error@urlExists: ${err}`)
      debug(`${config.get('url')} exists ? ${exists}`);
      if(exists){
        if(firstStart && loaded)
          loadVolumio();
      } else {
        periodicCheckServer();
      }
    });
  }, SERVER_CHECK_INTERVAL);
}

// ##################################################################### WINDOW GENERATOR
let createSettingsWindow = (force) => {
  if (win_settings == null || Boolean(force) == true) {
    win_settings = new BrowserWindow({
      width: config.get('width'),
      height: config.get('height'),
      webPreferences: {
        nodeIntegration: true,
        devTools: showDevTools
      },
      resizable: false,
      frame: showFrame,
      show: false
    })

    // TODO check if Settings should behave like default window
    win_settings.on("blur", () => {
      if (config.get('onBlurClose'))
        win_settings.isVisible() ? win_settings.hide() : null;
    })
  }

  if (showDevTools)
    win_settings.webContents.openDevTools()

  win_settings.webContents.on('did-finish-load', () => {
    win_settings.webContents.send('set-general', { 'blur': config.get('onBlurClose'), 'width': config.get('width'), 'height': config.get('height') })
    win_settings.webContents.send('set-network', { 'url': config.get('url') })
  })
}

let createMainWindow = () => {
  if (win_main == null) {
    win_main = new BrowserWindow({
      width: config.get('width'),
      height: config.get('height'),
      webPreferences: {
        nodeIntegration: false,
        devTools: showDevTools
      },
      resizable: false,
      frame: showFrame,
      show: false
    })

    win_main.on("blur", () => {
      if (config.get('onBlurClose'))
        win_main.isVisible() ? win_main.hide() : null;
    })
  }

  if (showDevTools)
    win_main.webContents.openDevTools()
}

// ##################################################################### IPC MAIN SECTION
ipcMain.on('settings-close', (event, arg) => {
  win_settings.hide();
  loadVolumio()
})

ipcMain.on('save-general', (event, arg) => {
  console.log("save-general");
  console.log(arg);

  let update = false

  if (config.get('width') != Number(arg.width)) {
    config.set('width', Number(arg.width));
    update = true; 400
  }
  if (config.get('height') != Number(arg.height)) {
    config.set('height', Number(arg.height));
    update = true;
  }
  if (config.get('onBlurClose') != Boolean(arg.blur)) {
    config.set('onBlurClose', Boolean(arg.blur));
  }

  if (update) {
    let n_x = win_settings.getBounds().x + ((win_settings.getBounds().width - config.get('width'))) / 2
    let n_y = win_settings.getBounds().y + ((win_settings.getBounds().height - config.get('height'))) / 2

    win_settings.setBounds({ x: n_x, y: n_y, width: config.get('width'), height: config.get('height') })
    win_main.setBounds({ x: n_x, y: n_y, width: config.get('width'), height: config.get('height') })
  }
})

ipcMain.on('save-network', (event, arg) => {
  console.log("save-network");
  console.log(arg);
  if (config.get('url') != String(arg.url) && arg.url != null) {
    config.set('url', String(arg.url));
    loadVolumio()
  }
})

// ##################################################################### TRAY CLICK HANDLERS
let onSettingsClickHandler = (menuItem, browserWindow, event) => {
  if (win_main.isVisible()) {
    win_main.hide()
  }
  win_settings.show();
  // createSettingsWindow(false)
}

let onClose = () => {
  config.save()
  win_settings.close()
  win_main.close()
}

// ##################################################################### APPLICATION MAIN
app.on("ready", () => {

  // construct window
  loadVolumio()

  // construct tray
  tray = new Tray(path.join(__dirname, 'assets/img/favicon-play.png'))
  const contextMenu = Menu.buildFromTemplate([
    //   { label: 'Show/Hide Window' },
    { label: 'Settings', click: onSettingsClickHandler },
    { label: 'Quit', click: onClose }
  ])
  tray.setToolTip('Volumio Desktop Control')
  tray.setContextMenu(contextMenu)

  tray.on("click", () => {
    if (loaded) {
      console.log(firstStart)
      if (!firstStart)
        win_main.isVisible() ? win_main.hide() : win_main.show()
      else
        win_settings.isVisible() ? win_settings.hide() : win_settings.show()
    }
  })

  periodicCheckServer();

})

