const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron');

const {
    autoUpdater
} = require('electron-updater');


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    });
    // mainWindow.removeMenu();
    // mainWindow.setAutoHideMenuBar(true);
    // mainWindow.webContents.openDevTools();
    mainWindow.loadFile('index.html');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    logEverywhere("window launched")

}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', {
        version: app.getVersion()
    });
});

ipcMain.on('app_checkUpdates', (event) => {
    logEverywhere("ipc_checkForUpdatesAndNotify")
    autoUpdater.checkForUpdatesAndNotify();

    logEverywhere(event);

    event.sender.send('to_render_console', {
        version: app.getVersion()
    });
});

ipcMain.on('open_developer_tools', (event) => {
    mainWindow.webContents.openDevTools();
});

autoUpdater.on('update-available', () => {
    // mainWindow.webContents.send('update_available');
    mainWindow.loadFile('update.html');
});
autoUpdater.on('download-progress', (progress) => {
    logEverywhere("download-progress fired");
    // let progressMsg = `Progress: ${progress.percent} (${progress.transferred} / ${progress.total})`;
    mainWindow.webContents.send('update_progress', progress);
    // mainWindow.webContents.send('update_progress', {
    //     'percent': progress.percent, 
    //     'transferred': progress.transferred,
    //     'total': progress.total
    // });
});
autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});
autoUpdater.on('update-not-available', async (info) => {
    mainWindow.webContents.send('update_none', info);
});
autoUpdater.on('error', (err) => {
    updateWindow.webContents.send('update_error', err);
});


ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});


ipcMain.on('nav_update', () => {
    mainWindow.loadFile('update.html');
});
// Log both at dev console and at running node console instance
function logEverywhere(s) {
    console.log(s)
    if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.executeJavaScript(`console.log("${s}")`)
    }
}

ipcMain.on('set_progress', (event, args) => {
    mainWindow.setProgressBar(args)
});
