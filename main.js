const {
    app,
    BrowserWindow,
    Menu,
    dialog,
    ipcMain
} = require("electron");

const path = require("path");
const express = require("express");
const { autoUpdater } = require("electron-updater");


// SUVI INFOTECH - STABLE DATA & CACHE PATH

const fs = require("fs");

// Permanent application data folder
const suviDataPath = path.join(
    app.getPath("appData"),
    "suvi-infotech-service-maintenance"
);

if (!fs.existsSync(suviDataPath)) {
    fs.mkdirSync(suviDataPath, { recursive: true });
}

// Set stable userData path
app.setPath("userData", suviDataPath);

// Separate cache folders
const suviCachePath = path.join(suviDataPath, "Cache");
const suviMediaCachePath = path.join(suviDataPath, "Media Cache");

fs.mkdirSync(suviCachePath, { recursive: true });
fs.mkdirSync(suviMediaCachePath, { recursive: true });

app.setPath("cache", suviCachePath);

app.commandLine.appendSwitch(
    "disk-cache-dir",
    suviCachePath
);

app.commandLine.appendSwitch(
    "media-cache-dir",
    suviMediaCachePath
);
/* =========================================================
   SUVI INFOTECH LOCAL WEB SERVER
   Required for secure WebAuthn / Windows Hello login
   ========================================================= */

const localApp = express();

localApp.use(
    express.static(__dirname)
);

let localServer = null;


/* =========================================================
   CREATE WINDOW
   ========================================================= */

async function createWindow() {

    const win = new BrowserWindow({

        width: 1150,
        height: 750,

        minWidth: 1000,
        minHeight: 650,

        resizable: true,
        maximizable: true,
        center: true,

        show: false,

        icon: path.join(
            __dirname,
            "assets",
            "suvi_logo.ico"
        ),

        webPreferences: {

            nodeIntegration: false,

            contextIsolation: true,

            preload: path.join(
                __dirname,
                "preload.js"
            )
        }
    });
    // =========================================================
// SUVI INFOTECH - ELECTRON DISPLAY SCALE FIX
// Keep Dashboard UI same as localhost
// =========================================================

win.webContents.setZoomFactor(1.0);

win.webContents.setVisualZoomLevelLimits(1, 1);
win.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {

        console.error(
            "SUVI INFOTECH PAGE LOAD FAILED",
            {
                errorCode,
                errorDescription,
                validatedURL
            }
        );

    }
);

win.webContents.on(
    "console-message",
    (event, level, message, line, ) => {

        console.log(
            "SUVI LOGIN CONSOLE:",
            message,
            "Line:",
            line
        );

    }
);

    /* =====================================================
       START LOCAL SERVER
       ===================================================== */

    try {

        if (!localServer) {

            localServer = await new Promise(
                (resolve, reject) => {

                    const server =
                        localApp.listen(
                            32187,
                            "127.0.0.1",
                            () => {

                                console.log(
                                    "SUVI INFOTECH Local Server Started"
                                );

                                console.log(
                                    "Port:",
                                    32187
                                );

                                resolve(server);
                            }
                        );

                    server.on(
                        "error",
                        reject
                    );
                }
            );
        }


        const port = 32187;


        console.log(
            `SUVI INFOTECH URL: http://127.0.0.1:${port}/index.html`
        );


        /* =================================================
           LOAD APPLICATION
           ================================================= */

        const appUrl =
    `http://127.0.0.1:${port}/index.html`;

console.log(
    "SUVI INFOTECH Loading URL:",
    appUrl
);

try {

    await win.loadURL(appUrl);

    console.log(
        "SUVI INFOTECH Login Page Loaded Successfully"
    );

} catch (error) {

    console.error(
        "SUVI INFOTECH loadURL ERROR:",
        error
    );

    dialog.showErrorBox(
        "SUVI INFOTECH - Login Load Error",
        error.message
    );

    return win;
}

        /* =================================================
           SHOW WINDOW
           ================================================= */

        win.show();

console.log(
    "SUVI INFOTECH Window Shown"
);


    } catch (error) {

        console.error(
            "Application Load Error:",
            error
        );

        dialog.showErrorBox(
            "SUVI INFOTECH",
            "Application could not be loaded.\n\n" +
            error.message
        );
    }


    return win;
}


/* =========================================================
   SUVI INFOTECH - GITHUB RELEASE AUTO UPDATE
   ========================================================= */

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

let manualUpdateCheck = false;
let updateDialogOpen = false;


let updateProgressWindow = null;

function showUpdateProgress() {
    if (updateProgressWindow && !updateProgressWindow.isDestroyed()) {
        updateProgressWindow.show();
        return;
    }

    updateProgressWindow = new BrowserWindow({
        width: 470,
        height: 255,
        resizable: false,
        minimizable: false,
        maximizable: false,
        center: true,
        alwaysOnTop: true,
        title: "SUVI INFOTECH - Downloading Update",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    const progressHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SUVI INFOTECH Update</title>
            <style>
                * { box-sizing: border-box; }
                body {
                    margin: 0;
                    padding: 25px;
                    font-family: Arial, sans-serif;
                    color: #172554;
                    background: #f8fafc;
                }
                h2 { margin: 0 0 10px; font-size: 20px; }
                #status { margin: 0 0 18px; color: #475569; }
                .track {
                    width: 100%;
                    height: 16px;
                    overflow: hidden;
                    border-radius: 20px;
                    background: #dbeafe;
                }
                #bar {
                    width: 0%;
                    height: 100%;
                    border-radius: 20px;
                    background: linear-gradient(90deg, #0ea5e9, #4f46e5);
                    transition: width .25s ease;
                }
                #percent {
                    margin-top: 12px;
                    font-size: 22px;
                    font-weight: bold;
                    color: #1d4ed8;
                }
                #details {
                    margin-top: 7px;
                    font-size: 12px;
                    color: #64748b;
                }
                .note { margin-top: 17px; font-size: 12px; color: #64748b; }
            </style>
        </head>
        <body>
            <h2>SUVI INFOTECH Service Pro</h2>
            <p id="status">Update download is starting...</p>
            <div class="track"><div id="bar"></div></div>
            <div id="percent">0.0%</div>
            <div id="details">Preparing download...</div>
            <div class="note">Please keep the application open until the download completes.</div>
        </body>
        </html>
    `;

    updateProgressWindow.on("closed", () => {
        updateProgressWindow = null;
    });

    updateProgressWindow.loadURL(
        "data:text/html;charset=utf-8," + encodeURIComponent(progressHtml)
    );
}

function updateDownloadProgress(progress) {
    if (!updateProgressWindow || updateProgressWindow.isDestroyed()) return;

    const percent = Math.max(0, Math.min(100, Number(progress.percent) || 0));
    const transferred = Number(progress.transferred) || 0;
    const total = Number(progress.total) || 0;
    const speed = Number(progress.bytesPerSecond) || 0;

    const formatMB = (bytes) => (bytes / (1024 * 1024)).toFixed(1);

    const details = total > 0
        ? `${formatMB(transferred)} MB / ${formatMB(total)} MB • ${formatMB(speed)} MB/s`
        : "Receiving update data...";

    const script = `
        document.getElementById("bar").style.width = "${percent.toFixed(1)}%";
        document.getElementById("percent").textContent = "${percent.toFixed(1)}%";
        document.getElementById("status").textContent = "Downloading update...";
        document.getElementById("details").textContent = ${JSON.stringify(details)};
    `;

    updateProgressWindow.webContents.executeJavaScript(script).catch(() => {});
}

function closeUpdateProgress() {
    if (updateProgressWindow && !updateProgressWindow.isDestroyed()) {
        updateProgressWindow.close();
    }
    updateProgressWindow = null;
}

async function checkForApplicationUpdates(manual = false) {
    manualUpdateCheck = manual;

    if (!app.isPackaged) {
        if (manual) {
            await dialog.showMessageBox({
                type: "info",
                title: "Software Update",
                message: "Update check is available in the installed application.",
                detail: "Please test GitHub Releases updates using the installed SUVI INFOTECH Service Pro application."
            });
        }
        return;
    }

    try {
        await autoUpdater.checkForUpdates();
    } catch (error) {
        console.error("SUVI INFOTECH Update Check Error:", error);
        if (manual) {
            await dialog.showMessageBox({
                type: "error",
                title: "Update Check Failed",
                message: "Could not check for updates.",
                detail: error.message
            });
        }
    }
}

autoUpdater.on("checking-for-update", () => {
    console.log("SUVI INFOTECH: Checking GitHub Releases for updates...");
});

autoUpdater.on("update-available", async (info) => {
    if (updateDialogOpen) return;
    updateDialogOpen = true;

    try {
        const { response } = await dialog.showMessageBox({
            type: "info",
            title: "SUVI INFOTECH Update Available",
            message: `Version ${info.version} is available.`,
            detail: "Would you like to download this update now? You can continue using the application while it downloads.",
            buttons: ["Download Update", "Later"],
            defaultId: 0,
            cancelId: 1
        });

       if (response === 0) {
    showUpdateProgress();
    await autoUpdater.downloadUpdate();
}
    } catch (error) {
        console.error("SUVI INFOTECH Update Download Start Error:", error);
        await dialog.showMessageBox({
            type: "error",
            title: "Update Download Error",
            message: "The update download could not be started.",
            detail: error.message
        });
    } finally {
        updateDialogOpen = false;
        manualUpdateCheck = false;
    }
});

autoUpdater.on("update-not-available", async (info) => {
    console.log("SUVI INFOTECH: No update available.", info.version);
    if (manualUpdateCheck) {
        await dialog.showMessageBox({
            type: "info",
            title: "Software Update",
            message: "You are using the latest version.",
            detail: `Installed version: ${app.getVersion()}`
        });
    }
    manualUpdateCheck = false;
});

autoUpdater.on("download-progress", (progress) => {
    console.log(`SUVI INFOTECH Update Download: ${progress.percent.toFixed(1)}%`);
    updateDownloadProgress(progress);
});
autoUpdater.on("update-downloaded", async (info) => {
        closeUpdateProgress();
    const { response } = await dialog.showMessageBox({
        type: "info",
        title: "SUVI INFOTECH Update Ready",
        message: `Version ${info.version} has been downloaded.`,
        detail: "Restart the application now to install the update. Save your work before restarting.",
        buttons: ["Restart and Install", "Later"],
        defaultId: 0,
        cancelId: 1
    });

    if (response === 0) {
        autoUpdater.quitAndInstall();
    }
});

autoUpdater.on("error", async (error) => {
        closeUpdateProgress();
    console.error("SUVI INFOTECH Auto Update Error:", error);
    if (manualUpdateCheck) {
        await dialog.showMessageBox({
            type: "error",
            title: "Software Update Error",
            message: "Unable to check or download the update.",
            detail: error.message
        });
    }
    manualUpdateCheck = false;
});

/* =========================================================
   ELECTRON READY
   ========================================================= */

app.whenReady().then(() => {
console.log("SUVI USER DATA PATH:", app.getPath("userData")); 
    /* =====================================================
       SOFTWARE MENU
       ===================================================== */

    const softwareMenu =
        Menu.buildFromTemplate([

            /* =============================================
               COMPANY
               ============================================= */

            {
                label: "Company",

                submenu: [

                    {
                        label:
                            "SUVI INFOTECH",

                        enabled: false
                    },

                    {
                        type:
                            "separator"
                    },

                    {
                        label:
                            "About SUVI INFOTECH",

                        click: () => {

                            dialog.showMessageBox({

                                type: "info",

                                title:
                                    "SUVI INFOTECH",

                                message:
                                    "SUVI INFOTECH Service Pro",

                                detail:
                                    "Professional Service & Maintenance Management Software"
                            });

                        }
                    }
                ]
            },


            /* =============================================
               FILE
               ============================================= */

            {
                label: "File",

                submenu: [

                    {
                        role: "reload",

                        label: "Refresh"
                    },

                    {
                        type:
                            "separator"
                    },

                    {
                        role: "quit",

                        label: "Exit"
                    }
                ]
            },


            /* =============================================
               VIEW
               ============================================= */

            
{
    label: "View",

    submenu: [

        {
            role: "togglefullscreen",
            label: "Full Screen"
        },

        {
            role: "reload",
            label: "Refresh"
        },

        {
            type: "separator"
        },

        {
            label: "Developer Tools",
            accelerator: "CommandOrControl+Shift+I",
            click: () => {
                const targetWindow =
                    BrowserWindow.getFocusedWindow() ||
                    BrowserWindow.getAllWindows()[0];

                if (
                    targetWindow &&
                    !targetWindow.isDestroyed()
                ) {
                    targetWindow.webContents.openDevTools({
                        mode: "detach"
                    });
                }
            }
        }

    ]
},


                  
            


            /* =============================================
               VERSIONS
               ============================================= */

            {
                label: "Versions",

                submenu: [

                    {
                        label:
                            "Current Version",

                        click: () => {

                            dialog.showMessageBox({

                                type: "info",

                                title:
                                    "Current Version",

                                message:
                                    "SUVI INFOTECH Service Pro",

                                detail:
                                    `Version: ${app.getVersion()}\n` +
                                    "Build: 2026.09.14\n" +
                                    "Status: Current Version"
                            });

                        }
                    },


                    {
                        label:
                            "Check for Updates",

                        click: () => {
                            checkForApplicationUpdates(true);
                        }
                    },

                    {
                        label:
                            "Release Notes",

                        click: () => {

                            dialog.showMessageBox({

                                type: "info",

                                title:
                                    "Release Notes",

                                message:
                                    `SUVI INFOTECH Service Pro — Version ${app.getVersion()}`,

                                detail:
                                    "Initial release.\n\n" +
                                    "• Service & Maintenance management\n" +
                                    "• Client and service modules\n" +
                                    "• Billing and inventory features\n" +
                                    "• Desktop application support"
                            });

                        }
                    }
                ]
            },


            /* =============================================
               TOOLS
               ============================================= */

            {
                label: "Tools",

                submenu: [

                    {
                        role:
                            "reload",

                        label:
                            "Refresh Application"
                    }
                ]
            },


            /* =============================================
               HELP
               ============================================= */

            {
                label: "Help",

                submenu: [

                    {
                        label:
                            "About",

                        click: () => {

                            dialog.showMessageBox({

                                type: "info",

                                title:
                                    "SUVI INFOTECH Service Pro",

                                message:
                                    "SUVI INFOTECH Service Pro",

                                detail:
                                    `Version ${app.getVersion()}\n` +
                                    "Build 2026.09.14"
                            });

                        }
                    }
                ]
            }

        ]);


    /* =====================================================
       SET APPLICATION MENU
       ===================================================== */

    Menu.setApplicationMenu(
        softwareMenu
    );


    /* =====================================================
       CREATE MAIN WINDOW
       ===================================================== */

    createWindow();

    // Check GitHub Releases after the main window has opened.
    if (app.isPackaged) {
        setTimeout(() => {
            checkForApplicationUpdates(false);
        }, 10000);
    }


    /* =====================================================
       MACOS ACTIVATE
       ===================================================== */

    app.on(
        "activate",
        () => {

            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {

                createWindow();

            }

        }
    );

});


/* =========================================================
   SAVE PDF
   Existing functionality preserved
   ========================================================= */

ipcMain.handle(
    "save-pdf",
    async (event) => {

        try {

            const win =
                BrowserWindow.fromWebContents(
                    event.sender
                );


            if (!win) {

                return {

                    success: false,

                    message:
                        "Window not found"
                };
            }


            const {
                canceled,
                filePath
            } =
                await dialog.showSaveDialog(
                    win,
                    {

                        title:
                            "Save Bill as PDF",

                        defaultPath:
                            "Cash-Bill.pdf",

                        filters: [

                            {
                                name:
                                    "PDF Files",

                                extensions:
                                    ["pdf"]
                            }

                        ]
                    }
                );


            if (
                canceled ||
                !filePath
            ) {

                return {

                    success: false,

                    canceled: true
                };
            }


            const pdfData =
                await win.webContents.printToPDF({

                    printBackground:
                        true,

                    landscape:
                        false,

                    pageSize:
                        "A4",

                    margins: {

                        marginType:
                            "default"
                    }
                });


            require("fs")
                .writeFileSync(
                    filePath,
                    pdfData
                );


            return {

                success: true,

                filePath
            };


        } catch (error) {

            console.error(
                "PDF Save Error:",
                error
            );


            return {

                success: false,

                message:
                    error.message
            };
        }

    }
);

/* =========================================================
   PROJECT BUG SCANNER
   Electron File System Scanner
   ========================================================= */

ipcMain.handle("scan-project", async () => {

    try {

        const fs = require("fs");
        const path = require("path");

        const projectRoot = __dirname;

        const results = {
            success: true,
            projectRoot: projectRoot,
            files: [],
            errors: [],
            warnings: [],
            passed: [],
            summary: {
                totalFiles: 0,
                errors: 0,
                warnings: 0,
                passed: 0
            }
        };


        /* =====================================================
           ALLOWED FILE EXTENSIONS
           ===================================================== */

        const allowedExtensions = new Set([
            ".html",
            ".htm",
            ".css",
            ".js"
        ]);


        /* =====================================================
           IGNORED FOLDERS
           ===================================================== */

        const ignoredFolders = new Set([
            "node_modules",
            ".git",
            "dist",
            "build",
            ".cache"
        ]);


        /* =====================================================
           SCAN DIRECTORY
           ===================================================== */

        function scanDirectory(directory) {

            let entries;

            try {

                entries = fs.readdirSync(
                    directory,
                    {
                        withFileTypes: true
                    }
                );

            } catch (error) {

                results.errors.push({

                    type: "Directory Read",

                    file: directory,

                    message: error.message

                });

                return;
            }


            for (const entry of entries) {

                if (
                    entry.isDirectory() &&
                    ignoredFolders.has(entry.name)
                ) {

                    continue;
                }


                const fullPath = path.join(
                    directory,
                    entry.name
                );


                if (entry.isDirectory()) {

                    scanDirectory(fullPath);

                    continue;
                }


                const extension =
                    path.extname(
                        entry.name
                    ).toLowerCase();


                if (
                    !allowedExtensions.has(extension)
                ) {

                    continue;
                }


                scanFile(fullPath);
            }
        }


        /* =====================================================
           SCAN FILE
           ===================================================== */

        function scanFile(filePath) {

            const relativePath =
                path.relative(
                    projectRoot,
                    filePath
                );


            results.files.push(
                relativePath
            );


            let content;

            try {

                content = fs.readFileSync(
                    filePath,
                    "utf8"
                );

            } catch (error) {

                results.errors.push({

                    type: "File Read",

                    file: relativePath,

                    message: error.message

                });

                return;
            }


            /* =================================================
               EMPTY FILE CHECK
               ================================================= */

            if (
                content.trim().length === 0
            ) {

                results.warnings.push({

                    type: "Empty File",

                    file: relativePath,

                    message: "File is empty."

                });

            }


            /* =================================================
               HTML DUPLICATE ID CHECK
               ================================================= */

            if (
                filePath
                    .toLowerCase()
                    .endsWith(".html")
            ) {

                const idMatches =
                    content.match(
                        /\bid\s*=\s*["'][^"']+["']/gi
                    ) || [];


                const ids = {};


                idMatches.forEach(
                    (item) => {

                        const match =
                            item.match(
                                /\bid\s*=\s*["']([^"']+)["']/i
                            );


                        if (!match) {
                            return;
                        }


                        const id = match[1];


                        ids[id] =
                            (ids[id] || 0) + 1;

                    }
                );


                Object.entries(ids).forEach(
                    ([id, count]) => {

                        if (count > 1) {

                            results.warnings.push({

                                type: "Duplicate HTML ID",

                                file: relativePath,

                                message:
                                    `ID "${id}" appears ${count} times.`

                            });

                        }

                    }
                );

            }


            /* =================================================
               JAVASCRIPT BRACE CHECK
               ================================================= */

            if (
                filePath
                    .toLowerCase()
                    .endsWith(".js")
            ) {

                let curlyOpen = 0;
                let squareOpen = 0;
                let roundOpen = 0;

                let invalidClosing = false;


                for (
                    const character of content
                ) {

                    if (character === "{") {
                        curlyOpen++;
                    }

                    if (character === "}") {
                        curlyOpen--;
                    }

                    if (character === "[") {
                        squareOpen++;
                    }

                    if (character === "]") {
                        squareOpen--;
                    }

                    if (character === "(") {
                        roundOpen++;
                    }

                    if (character === ")") {
                        roundOpen--;
                    }


                    if (
                        curlyOpen < 0 ||
                        squareOpen < 0 ||
                        roundOpen < 0
                    ) {

                        invalidClosing = true;

                        break;
                    }

                }


                if (invalidClosing) {

                    results.errors.push({

                        type: "JavaScript Syntax",

                        file: relativePath,

                        message:
                            "Unexpected closing bracket detected."

                    });

                } else {

                    if (curlyOpen !== 0) {

                        results.errors.push({

                            type: "JavaScript Syntax",

                            file: relativePath,

                            message:
                                "Curly braces { } are not balanced."

                        });

                    }


                    if (squareOpen !== 0) {

                        results.errors.push({

                            type: "JavaScript Syntax",

                            file: relativePath,

                            message:
                                "Square brackets [ ] are not balanced."

                        });

                    }


                    if (roundOpen !== 0) {

                        results.errors.push({

                            type: "JavaScript Syntax",

                            file: relativePath,

                            message:
                                "Parentheses ( ) are not balanced."

                        });

                    }

                }


                if (
                    curlyOpen === 0 &&
                    squareOpen === 0 &&
                    roundOpen === 0 &&
                    !invalidClosing
                ) {

                    results.passed.push({

                        type: "JavaScript Check",

                        file: relativePath,

                        message:
                            "JavaScript bracket check passed."

                    });

                }

            }


            /* =================================================
               CSS BRACE CHECK
               ================================================= */

            if (
                filePath
                    .toLowerCase()
                    .endsWith(".css")
            ) {

                let cssOpen = 0;
                let invalidClosing = false;


                for (
                    const character of content
                ) {

                    if (character === "{") {
                        cssOpen++;
                    }

                    if (character === "}") {
                        cssOpen--;
                    }


                    if (cssOpen < 0) {

                        invalidClosing = true;

                        break;
                    }

                }


                if (invalidClosing) {

                    results.errors.push({

                        type: "CSS Syntax",

                        file: relativePath,

                        message:
                            "Unexpected closing CSS brace detected."

                    });

                } else if (cssOpen !== 0) {

                    results.errors.push({

                        type: "CSS Syntax",

                        file: relativePath,

                        message:
                            "CSS braces { } are not balanced."

                    });

                } else {

                    results.passed.push({

                        type: "CSS Check",

                        file: relativePath,

                        message:
                            "CSS brace check passed."

                    });

                }

            }


            /* =================================================
               NORMAL FILE PASS
               ================================================= */

            if (
                content.trim().length > 0
            ) {

                results.passed.push({

                    type: "File Check",

                    file: relativePath,

                    message:
                        "File loaded successfully."

                });

            }

        }


        /* =====================================================
           START PROJECT SCAN
           ===================================================== */

        scanDirectory(
            projectRoot
        );


        /* =====================================================
           SUMMARY
           ===================================================== */

        results.summary = {

            totalFiles:
                results.files.length,

            errors:
                results.errors.length,

            warnings:
                results.warnings.length,

            passed:
                results.passed.length

        };


        results.success =
            results.errors.length === 0;


        return results;


    } catch (error) {

        console.error(
            "Project Scan Error:",
            error
        );


        return {

            success: false,

            projectRoot: __dirname,

            files: [],

            errors: [

                {

                    type: "Scanner Error",

                    file: "",

                    message: error.message

                }

            ],

            warnings: [],

            passed: [],

            summary: {

                totalFiles: 0,

                errors: 1,

                warnings: 0,

                passed: 0

            }

        };

    }

});
/* =========================================================
   ALL WINDOWS CLOSED
   ========================================================= */

app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {

            if (localServer) {

                localServer.close(
                    () => {

                        console.log(
                            "SUVI INFOTECH Local Server Closed"
                        );

                        app.quit();
                    }
                );

            } else {

                app.quit();

            }

        }

    }
);

