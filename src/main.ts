import { app, BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null = null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
    })
    mainWindow.maximize()
    mainWindow.loadURL("https://kinerja.bkn.go.id/login")

    mainWindow.webContents.once('did-finish-load', () => {
        setInterval(() => {
            mainWindow?.webContents.executeJavaScript('localStorage.getItem("token");')
                .then((token) => {
                    console.log("Token:", token)
                })
                .catch((e) => {
                    console.error(e)
                })
        }, 3000)
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})