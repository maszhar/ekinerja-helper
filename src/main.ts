/**
 * Project Name: E-Kinerja Helper
 * Author: Fikri Mustofa
 * Created: 2025
 *
 * License: MIT
 * 
 * Copyright (c) 2025, Fikri Mustofa
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { app, BrowserWindow } from "electron";
import * as net from "net"
import express from "express";
import * as path from "path";

let mainWindow: BrowserWindow | null = null;

let loginEkinerjaWindow: BrowserWindow | null = null
let loginEkinerjaWindowReader: NodeJS.Timeout | null = null

function showLoginEkinerjaWindow() {
    if (loginEkinerjaWindow) {
        return
    }
    loginEkinerjaWindow = new BrowserWindow({
        width: 1024,
        height: 600,
    })
    loginEkinerjaWindow.maximize()
    loginEkinerjaWindow.loadURL("https://kinerja.bkn.go.id/login")

    loginEkinerjaWindow.webContents.once('did-finish-load', () => {
        loginEkinerjaWindowReader = setInterval(() => {
            const getTokens = async () => {
                const accessToken = await loginEkinerjaWindow?.webContents.executeJavaScript('localStorage.getItem("token");')
                if (!accessToken) {
                    throw new Error("Access token is empty")
                }

                const cookies = await loginEkinerjaWindow?.webContents.session.cookies.get({})

                const cookieAuth = cookies?.find(cookie => cookie.name == "a6efbb1502f502ec9fc2904a7a5a7b78")?.value
                if (!cookieAuth) {
                    throw new Error("Cookie auth is empty")
                }

                const sessionAuth = cookies?.find(cookie => cookie.name == "__Host-kinerja_production_session")?.value
                if (!sessionAuth) {
                    throw new Error("Session auth is empty")
                }

                const xsrfToken = cookies?.find(cookie => cookie.name == "XSRF-TOKEN")?.value
                if (!xsrfToken) {
                    throw new Error("XSRF Token is empty")
                }
            }

            getTokens().then(() => {
                loginEkinerjaWindow?.close()
            }).catch(() => { })
        }, 3000)
    })

    loginEkinerjaWindow.on('closed', () => {
        if (loginEkinerjaWindowReader) {
            clearInterval(loginEkinerjaWindowReader)
            loginEkinerjaWindowReader = null
        }
        loginEkinerjaWindow = null;
    })
}

async function getAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject)
        server.listen(0, () => {
            const port = (server.address() as net.AddressInfo).port;
            server.close(() => resolve(port))
        })
    })
}

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 600,
    })
    mainWindow.maximize()
    mainWindow.loadFile('loading.html')

    getAvailablePort().then((port) => {
        const distPath = path.join(__dirname, './external/view')

        const expressApp = express()
        expressApp.use(express.static(distPath))
        expressApp.post("/api/login-ekinerja", async (req, res) => {
            res.sendStatus(204)
            showLoginEkinerjaWindow()
        })
        expressApp.listen(port)

        mainWindow?.loadURL("http://localhost:" + port)
    }).catch(() => {
        mainWindow?.close();
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})