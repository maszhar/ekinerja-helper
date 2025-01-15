const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('App', {
    ekinerjaRequest: async (data) => {
        return await ipcRenderer.invoke('ekinerjaRequest', data)
    }
})