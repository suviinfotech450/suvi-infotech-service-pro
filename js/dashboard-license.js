import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* ================================
   FIREBASE
================================ */

const firebaseConfig = {
    apiKey: "AIzaSyBSdggDY9RAhWQTfeUiYu-HRxdHPm7SvwA",
    authDomain: "suvi-infotech-service-pro.firebaseapp.com",
    projectId: "suvi-infotech-service-pro",
    storageBucket: "suvi-infotech-service-pro.firebasestorage.app",
    messagingSenderId: "181967409829",
    appId: "1:181967409829:web:4f17903a0a6dc8479fb34c",
    measurementId: "G-70W7B08X2X"
};

const app =
    getApps().length
        ? getApp()
        : initializeApp(firebaseConfig);

const db = getFirestore(app);


/* ================================
   LOAD LICENSE
================================ */

async function loadDashboardLicense() {

    const statusEl =
        document.getElementById("dashboardLicenseStatus");

    const daysEl =
        document.getElementById("dashboardLicenseDays");

    if (!statusEl || !daysEl) return;


    try {

        const snapshot =
            await getDocs(
                collection(db, "licenses")
            );


        if (snapshot.empty) {

            statusEl.textContent =
                "Not Activated";

            daysEl.textContent =
                "-";

            return;
        }


        /* Get latest / first license */

        let license = null;

        snapshot.forEach((docSnap) => {

            const data = docSnap.data();

            if (!license) {
                license = data;
            }

        });


        if (!license) {

            statusEl.textContent =
                "Not Activated";

            daysEl.textContent =
                "-";

            return;
        }


        /* ==========================
           EXPIRY
        ========================== */

        if (!license.expiryDate) {

            statusEl.textContent =
                "Activated";

            daysEl.textContent =
                "No Expiry";

            return;
        }


        const expiry =
            license.expiryDate?.toDate
                ? license.expiryDate.toDate()
                : new Date(license.expiryDate);


        const today =
            new Date();

        today.setHours(0, 0, 0, 0);
        expiry.setHours(0, 0, 0, 0);


        const difference =
            expiry.getTime() -
            today.getTime();


        const daysLeft =
            Math.ceil(
                difference /
                (1000 * 60 * 60 * 24)
            );


        /* ==========================
           STATUS
        ========================== */

        if (daysLeft < 0) {

            statusEl.textContent =
                "Expired";

            daysEl.textContent =
                "0 Days Left";

            return;
        }


        statusEl.textContent =
            "Activated";

        daysEl.textContent =
            `${daysLeft} Days Left`;


    } catch (error) {

        console.error(
            "Dashboard License Error:",
            error
        );

        statusEl.textContent =
            "Not Activated";

        daysEl.textContent =
            "-";
    }
}


/* ================================
   START
================================ */

document.addEventListener(
    "DOMContentLoaded",
    loadDashboardLicense
);