const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, nativeImage } = require('electron')
const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')

let mainWindow = null
let tray = null
let pollHandle = null
let lastNotifiedHealth = 100
let lastActiveApp = null

const POLL_INTERVAL_MS = 5000

function getActiveApp(callback) {
  if (process.platform === 'darwin') {
    exec(
      `osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true'`,
      { timeout: 2000 },
      (err, stdout) => { if (!err) callback(stdout.trim()) }
    )
  } else if (process.platform === 'win32') {
    exec(
      `powershell -command "(Get-Process | Where-Object {$_.MainWindowHandle -ne 0} | Sort-Object CPU -Descending | Select-Object -First 1).Name"`,
      { timeout: 2000 },
      (err, stdout) => { if (!err) callback(stdout.trim()) }
    )
  }
}

function startPolling() {
  if (pollHandle) return
  pollHandle = setInterval(() => {
    if (!mainWindow || mainWindow.isDestroyed()) return
    getActiveApp((appName) => {
      if (appName && appName !== lastActiveApp) {
        lastActiveApp = appName
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('active-app', appName)
      }
    })
  }, POLL_INTERVAL_MS)
}

function stopPolling() {
  if (pollHandle) {
    clearInterval(pollHandle)
    pollHandle = null
  }
}

function buildTrayIcon() {
  // Tiny inline plant emoji rendered as a 16x16 PNG via a base64 fallback;
  // on macOS we use the leaf in the menubar with text-only template.
  const iconPath = path.join(__dirname, 'tray-icon.png')
  if (fs.existsSync(iconPath)) {
    const img = nativeImage.createFromPath(iconPath)
    img.setTemplateImage(true)
    return img
  }
  // Fallback: empty template image with title text.
  return nativeImage.createEmpty()
}

function createTray() {
  if (tray) return
  tray = new Tray(buildTrayIcon())
  tray.setTitle('🌱')
  tray.setToolTip('BloomUp')
  refreshTrayMenu({ health: 100, level: 1, coins: 0 })
  tray.on('click', () => showOrCreateWindow())
}

function refreshTrayMenu(state) {
  if (!tray) return
  const menu = Menu.buildFromTemplate([
    { label: `🌱 Plant Lv.${state.level}  ${Math.round(state.health)}% health`, enabled: false },
    { label: `🪙 ${state.coins} coins`, enabled: false },
    { type: 'separator' },
    { label: 'Open BloomUp', click: () => showOrCreateWindow() },
    { label: 'Quit', click: () => { app.isQuiting = true; app.quit() } },
  ])
  tray.setContextMenu(menu)
  tray.setTitle(state.health < 30 ? '🥀' : state.health < 70 ? '🌿' : '🌳')
}

function notify(title, body) {
  if (!Notification.isSupported()) return
  new Notification({ title, body, silent: false }).show()
}

function showOrCreateWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
    return
  }
  createWindow()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 880,
    minHeight: 620,
    backgroundColor: '#0d0d0d',
    title: 'BloomUp',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (process.env.ELECTRON_DEV === 'true') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('close', (e) => {
    // Hide to tray instead of quitting (unless user explicitly quit).
    if (!app.isQuiting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  startPolling()
}

app.whenReady().then(() => {
  createWindow()
  createTray()

  if (process.env.ELECTRON_DEV !== 'true') {
    try {
      const { autoUpdater } = require('electron-updater')
      autoUpdater.checkForUpdatesAndNotify()
    } catch (err) {
      console.error('[autoUpdater] failed to init:', err.message)
    }
  }
})

app.on('window-all-closed', (e) => {
  // Keep the app alive in the tray; do not quit on window close.
  if (process.platform !== 'darwin' && app.isQuiting) app.quit()
})

app.on('activate', () => {
  showOrCreateWindow()
})

app.on('before-quit', () => {
  app.isQuiting = true
  stopPolling()
})

// --- IPC bridge from renderer ---

ipcMain.handle('notify', (_evt, { title, body }) => {
  notify(title, body)
})

ipcMain.handle('tray-update', (_evt, state) => {
  refreshTrayMenu(state)
  // Optional: push a friendly notification when health dives below 30 for the
  // first time in a session.
  if (state.health < 30 && lastNotifiedHealth >= 30) {
    notify('🥀 Your plant is wilting', 'Log an activity to bring it back to life.')
  }
  if (state.health >= 80 && lastNotifiedHealth < 80) {
    notify('🌳 Thriving!', 'Your plant is healthy and earning coins.')
  }
  lastNotifiedHealth = state.health
})

ipcMain.handle('app-version', () => app.getVersion())
