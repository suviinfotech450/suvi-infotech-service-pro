const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");
function createWindow() {

    const win = new BrowserWindow({
       width: 1150,
height: 750,

minWidth: 1000,
minHeight: 650,

maxWidth: 1400,
maxHeight: 900,

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
            contextIsolation: true
        }
    });

    win.loadFile(
        path.join(
            __dirname,
            "index.html"
        )
    );

    win.once("ready-to-show", () => {
        win.show();
    });
}

app.whenReady().then(() => {

const softwareMenu = Menu.buildFromTemplate([
    {
        label: "Company",
        submenu: [
            {
                label: "SUVI INFOTECH",
                enabled: false
            },
            {
                type: "separator"
            },
            {
                label: "About SUVI INFOTECH",
                click: () => {
                    dialog.showMessageBox({
                        type: "info",
                        title: "SUVI INFOTECH",
                        message: "SUVI INFOTECH Service Pro",
                        detail: "Professional Service & Maintenance Management Software"
                    });
                }
            }
        ]
    },

    {
        label: "File",
        submenu: [
            {
                role: "reload",
                label: "Refresh"
            },
            {
                type: "separator"
            },
            {
                role: "quit",
                label: "Exit"
            }
        ]
    },

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
            }
        ]
    },

    {
        label: "Versions",
        submenu: [
            {
                label: "Current Version",
                click: () => {
                    dialog.showMessageBox({
                        type: "info",
                        title: "Current Version",
                        message: "SUVI INFOTECH Service Pro",
                        detail:
                            "Version: 1.0.0\n" +
                            "Build: 2026.09.14\n" +
                            "Status: Current Version"
                    });
                }
            },

            {
                label: "Check for Updates",
                click: () => {
                    dialog.showMessageBox({
                        type: "info",
                        title: "Software Update",
                        message: "You are using the latest version.",
                        detail:
                            "SUVI INFOTECH Service Pro\n" +
                            "Version 1.0.0\n" +
                            "Build 2026.09.14\n\n" +
                            "Updates are released manually. " +
                            "Please install the latest official version when an update is available.",
                        buttons: ["OK", "Release Notes"],
                        defaultId: 0,
                        cancelId: 0
                    }).then(({ response }) => {

                        if (response === 1) {
                            dialog.showMessageBox({
                                type: "info",
                                title: "Release Notes",
                                message:
                                    "SUVI INFOTECH Service Pro — Version 1.0.0",
                                detail:
                                    "Initial release.\n\n" +
                                    "• Service & Maintenance management\n" +
                                    "• Client and service modules\n" +
                                    "• Billing and inventory features\n" +
                                    "• Desktop application support"
                            });
                        }

                    });
                }
            },

            {
                label: "Release Notes",
                click: () => {
                    dialog.showMessageBox({
                        type: "info",
                        title: "Release Notes",
                        message:
                            "SUVI INFOTECH Service Pro — Version 1.0.0",
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

    {
        label: "Tools",
        submenu: [
            {
                role: "reload",
                label: "Refresh Application"
            }
        ]
    },

    {
        label: "Help",
        submenu: [
            {
                label: "About",
                click: () => {
                    dialog.showMessageBox({
                        type: "info",
                        title: "SUVI INFOTECH Service Pro",
                        message: "SUVI INFOTECH Service Pro",
                        detail:
                            "Version 1.0.0\n" +
                            "Build 2026.09.14"
                    });
                }
            }
        ]
    }
]);

Menu.setApplicationMenu(softwareMenu);

createWindow();
    app.on("activate", () => {

        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }

    });

});


app.on("window-all-closed", () => {

    if (process.platform !== "darwin") {
        app.quit();
    }

});