const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronPDF", {

    savePDF: () => ipcRenderer.invoke("save-pdf")

});


/* =========================================================
   SUVI INFOTECH - LOGIN BIOMETRIC
   Login Page Only
   ========================================================= */

contextBridge.exposeInMainWorld("electronBiometric", {

    authenticate: () => ipcRenderer.invoke("biometric-authenticate"),

    isAvailable: () => ipcRenderer.invoke("biometric-available")

});

/* =========================================================
   SUVI INFOTECH - PROJECT BUG SCANNER
   ========================================================= */

contextBridge.exposeInMainWorld("electronBugScanner", {
    scanProject: () => ipcRenderer.invoke("scan-project")
});