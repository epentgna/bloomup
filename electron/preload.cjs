const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onActiveApp: (callback) => {
    ipcRenderer.on('active-app', (_, appName) => callback(appName))
  },
  notify: (title, body) => ipcRenderer.invoke('notify', { title, body }),
  updateTray: (state) => ipcRenderer.invoke('tray-update', state),
  appVersion: () => ipcRenderer.invoke('app-version'),
})
