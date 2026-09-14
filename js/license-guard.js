// SUVI INFOTECH ServiceOps Pro
// License Guard - separate file

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBSdggDY9RAhWQTfeUiYu-HRxdHPm7SvwA",
  authDomain: "suvi-infotech-service-pro.firebaseapp.com",
  projectId: "suvi-infotech-service-pro",
  storageBucket: "suvi-infotech-service-pro.firebasestorage.app",
  messagingSenderId: "181967409829",
  appId: "1:181967409829:web:4f17903a0a6dc8479fb34c",
  measurementId: "G-70W7B08X2X"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const LICENSE_PAGE = "modules/license/license.html";

function redirectToLicense() {
  if (!window.location.pathname.endsWith("/license.html")) {
    window.location.href = LICENSE_PAGE;
  }
}

async function checkLicense(user) {

  if (!user) return;

  const licenseKey = localStorage.getItem("suviLicenseKey");
  const deviceId = localStorage.getItem("suviLicenseDeviceId");

// No activated license
// Allow Dashboard / Modules to open.
// License page can be opened manually for activation.
if (!licenseKey || !deviceId) {
  console.log("SUVI License: Not activated");
  return;
}
  try {

    const licenseRef = doc(db, "licenses", licenseKey);
    const licenseSnap = await getDoc(licenseRef);

    if (!licenseSnap.exists()) {
      localStorage.removeItem("suviLicenseKey");
      redirectToLicense();
      return;
    }

    const license = licenseSnap.data();

    // Status check
    if (license.status !== "active") {
      redirectToLicense();
      return;
    }

    // Device check
    if (license.deviceId !== deviceId) {
      redirectToLicense();
      return;
    }

    // Expiry check
if (license.expiryDate) {

  let expiryDate;

  if (
    license.expiryDate &&
    typeof license.expiryDate.toDate === "function"
  ) {
    // Firestore Timestamp
    expiryDate = license.expiryDate.toDate();

  } else if (license.expiryDate instanceof Date) {
    // JavaScript Date
    expiryDate = license.expiryDate;

  } else {
    // String / Number
    expiryDate = new Date(license.expiryDate);
  }

  if (
    isNaN(expiryDate.getTime()) ||
    new Date() > expiryDate
  ) {
    redirectToLicense();
    return;
  }
}
    const selectedFirm =
  localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM")
  || "SUVI INFOTECH";

console.log(
  selectedFirm + " License: ACTIVE"
);

  } catch (error) {

    console.error("License check failed:", error);

    redirectToLicense();
  }
}

onAuthStateChanged(auth, (user) => {
  checkLicense(user);
});