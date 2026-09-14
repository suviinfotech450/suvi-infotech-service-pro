// =========================================================
// SUVI INFOTECH - COMMON FIREBASE CONFIG
// =========================================================

window.firebaseDbReady = (async function () {

    try {

        const {
            initializeApp,
            getApps,
            getApp
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"
        );

        const {
            getFirestore
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        const {
            getAuth,
            signInAnonymously
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"
        );

        const firebaseConfig = {
            apiKey: "AIzaSyBSdggDY9RAhWQTfeUiYu-HRxdHPm7SvwA",
            authDomain: "suvi-infotech-service-pro.firebaseapp.com",
            projectId: "suvi-infotech-service-pro",
            storageBucket: "suvi-infotech-service-pro.firebasestorage.app",
            messagingSenderId: "181967409829",
            appId: "1:181967409829:web:4f17903a0a6dc8479fb34c",
            measurementId: "G-70W7B08X2X"
        };

        const app = getApps().length
            ? getApp()
            : initializeApp(firebaseConfig);

        const auth = getAuth(app);

        if (!auth.currentUser) {
            await signInAnonymously(auth);
        }

        const db = getFirestore(app);

        window.firebaseAuth = auth;
        window.firebaseDb = db;

        console.log("SUVI INFOTECH Firebase connected.");
        console.log("Firebase Authentication ready.");

        return db;

    } catch (error) {

        console.error(
            "Firebase initialization error:",
            error
        );

        throw error;
    }

})();