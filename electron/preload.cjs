const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onActiveApp: (callback) => {
    ipcRenderer.on('active-app', (_, appName) => callback(appName))
  },
})
