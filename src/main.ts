import { app, BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
    })

    mainWindow.loadURL("https://kinerja.bkn.go.id/login")
})

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') {
        app.quit();
    }
})