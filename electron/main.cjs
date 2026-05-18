const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { exec } = require('child_process')
const path = require('path')
const { autoUpdater } = require('electron-updater')

let mainWindow

function getActiveApp(callback) {
  if (process.platform === 'darwin') {
    exec(
      `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
      (err, stdout) => {
        if (!err) callback(stdout.trim())
      }
    )
  } else if (process.platform === 'win32') {
    exec(
      `powershell -command "(Get-Process | Where-Object {$_.MainWindowHandle -ne 0} | Sort-Object CPU -Descending | Select-Object -First 1).Name"`,
      (err, stdout) => {
        if (!err) callback(stdout.trim())
      }
    )
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.ELECTRON_DEV === 'true') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Poll the active app every second
  const pollInterval = setInterval(() => {
    getActiveApp((appName) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('active-app', appName)
      }
    })
  }, 1000)

  mainWindow.on('closed', () => {
    clearInterval(pollInterval)
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  if (process.env.ELECTRON_DEV !== 'true') {
    autoUpdater.checkForUpdatesAndNotify()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
