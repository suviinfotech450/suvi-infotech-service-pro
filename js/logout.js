import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    initializeAuth,
    indexedDBLocalPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyBSdggDY9RAhWQTfeUiYu-HRxdHPm7SvwA",
    authDomain: "suvi-infotech-service-pro.firebaseapp.com",
    projectId: "suvi-infotech-service-pro",
    storageBucket: "suvi-infotech-service-pro.firebasestorage.app",
    messagingSenderId: "181967409829",
    appId: "1:181967409829:web:4f17903a0a6dc8479fb34c",
    measurementId: "G-70W7B08X2X"
};


const logoutApp = initializeApp(firebaseConfig);

const logoutAuth = initializeAuth(logoutApp, {
    persistence: [
        indexedDBLocalPersistence,
        browserLocalPersistence,
        browserSessionPersistence
    ]
});


const logoutMessage = document.getElementById("logoutMessage");

async function logoutUser() {

    try {
        await signOut(logoutAuth);

        localStorage.removeItem("suviLoggedUser");
        localStorage.removeItem("suviRememberedUser");

        window.location.replace("index.html");

    } catch (error) {

        if (logoutMessage) {
            logoutMessage.textContent =
                "Logout failed. Please try again.";
        }
    }
}

logoutUser();