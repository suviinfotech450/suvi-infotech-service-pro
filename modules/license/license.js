import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    deleteField,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

/* ================================
   FIREBASE CONFIG
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


/* ================================
   FIREBASE INIT
================================ */

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================================
   ELEMENTS
================================ */

const licenseKeyInput =
    document.getElementById("licenseKey");

const activateBtn =
    document.getElementById("activateBtn");

const licenseMessage =
    document.getElementById("licenseMessage");

const licenseDetails =
    document.getElementById("licenseDetails");

const deactivateBtn =
    document.getElementById("deactivateBtn");


/* ================================
   DEVICE ID
================================ */

function getDeviceId() {

    let deviceId =
        localStorage.getItem("suviLicenseDeviceId");

    if (!deviceId) {

        if (window.crypto && crypto.randomUUID) {
            deviceId = crypto.randomUUID();
        } else {
            deviceId =
                "DEV-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 10);
        }

        localStorage.setItem(
            "suviLicenseDeviceId",
            deviceId
        );
    }

    return deviceId;
}
/* ================================
   LICENSE PLAN
================================ */

function getLicensePlan() {

    const licenseType =
        document.getElementById("licenseType")?.value || "";

    if (licenseType === "trial") {
        return {
            type: "trial",
            name: "Trial Version",
            days: 7,
            amount: 0,
            paid: false
        };
    }

    if (licenseType === "yearly") {
        return {
            type: "yearly",
            name: "Yearly Version",
            days: 365,
            amount: 5500,
            paid: true
        };
    }

    return null;
}
/* ================================
   YEARLY PAYMENT SECTION TOGGLE
================================ */

document.addEventListener("DOMContentLoaded", () => {

    const licenseType =
        document.getElementById("licenseType");

    const yearlyPaymentSection =
        document.getElementById(
            "yearlyPaymentSection"
        );

    const yearlyAmount =
        document.getElementById("yearlyAmount");

    if (!licenseType || !yearlyPaymentSection) {
        return;
    }

    function updateYearlyPaymentSection() {

    if (licenseType.value === "yearly") {

        yearlyPaymentSection.style.display =
            "block";

        if (yearlyAmount) {
            yearlyAmount.textContent =
                "5,500";
        }

        // Yearly License - 365 Days
        const today = new Date();

        const todayString =
            today.toISOString().split("T")[0];

        const purchaseDate =
            document.getElementById("purchaseDate");

        const activationDate =
            document.getElementById("activationDate");

        const expiryDate =
            document.getElementById("expiryDate");

        if (purchaseDate) {
            purchaseDate.value =
                todayString;
        }

        if (activationDate) {
            activationDate.value =
                todayString;
        }

        const expiry =
            new Date(today);

        expiry.setDate(
            expiry.getDate() + 365
        );

        if (expiryDate) {
            expiryDate.value =
                expiry.toISOString().split("T")[0];
        }

    } else {

        yearlyPaymentSection.style.display =
            "none";
    }
}
     
    licenseType.addEventListener(
        "change",
        updateYearlyPaymentSection
    );

    updateYearlyPaymentSection();
});
/* ================================
   YEARLY RAZORPAY PAYMENT
   ₹5,500 / 365 DAYS
================================ */

window.startYearlyPayment = async function () {

    const plan = getLicensePlan();

    if (!plan || plan.type !== "yearly") {
        showMessage(
            "Please select Yearly Version.",
            "error"
        );
        return;
    }

    const customerName =
        document.getElementById("customerName")
            ?.value.trim();

    if (!customerName) {
        showMessage(
            "Please enter Customer / Company Name.",
            "error"
        );
        return;
    }

    try {

        showMessage(
            "Creating payment order...",
            "success"
        );

        const response = await fetch(
            "http://localhost:3000/api/create-order",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    customerName: customerName,
                    companyId:
                        localStorage.getItem(
                            "SUVI_COMPANY_ID"
                        ) || "",
                    firmName:
                        localStorage.getItem(
                            "SUVI_INFOTECH_SELECTED_FIRM"
                        ) || ""
                })
            }
        );

        const result =
            await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message ||
                "Unable to create payment order."
            );
        }

        console.log(
            "Razorpay Order:",
            result
        );

showMessage(
    "Payment order created successfully.",
    "success"
);

/* ================================
   RAZORPAY CHECKOUT
================================ */

if (!result.keyId) {
    throw new Error(
        "Razorpay Key ID is not configured on server."
    );
}

if (!window.Razorpay) {
    throw new Error(
        "Razorpay Checkout is not loaded."
    );
}

const options = {
    key: result.keyId,

    amount: result.amount,

    currency: result.currency || "INR",

    name: "SUVI INFOTECH",

    description: "SUVI INFOTECH Service Pro - Yearly License",

    order_id: result.orderId,

    prefill: {
        name: customerName
    },

    theme: {
        color: "#0d6efd"
    },

  handler: async function (paymentResponse) {

    try {

        console.log(
            "Razorpay Payment Success:",
            paymentResponse
        );

        showMessage(
            "Payment successful. Verifying payment...",
            "success"
        );

        const verifyResponse = await fetch(
            "http://localhost:3000/api/verify-payment",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
             body: JSON.stringify({
    razorpay_order_id:
        paymentResponse.razorpay_order_id,

    razorpay_payment_id:
        paymentResponse.razorpay_payment_id,

    razorpay_signature:
        paymentResponse.razorpay_signature,

    deviceId:
        getDeviceId()
})   
            }
        );

        const verifyResult =
            await verifyResponse.json();

        if (
            !verifyResponse.ok ||
            !verifyResult.success
        ) {
            throw new Error(
                verifyResult.message ||
                "Payment verification failed."
            );
        }

        console.log(
            "Payment verified:",
            verifyResult
        );

     /* ==========================================
   YEARLY LICENSE AUTO-ACTIVATION
========================================== */

const generatedLicenseKey =
    verifyResult.licenseKey;

if (!generatedLicenseKey) {
    throw new Error(
        "License key was not generated by server."
    );
}

/* Save license key locally */
localStorage.setItem(
    "suviLicenseKey",
    generatedLicenseKey
);

/* Put generated key into existing field */
licenseKeyInput.value =
    generatedLicenseKey;

/* Display activated license */
if (verifyResult.licenseData) {

    displayLicense(
        generatedLicenseKey,
        verifyResult.licenseData
    );
}

/* Hide existing activation form */
const formCard =
    document.getElementById(
        "licenseFormCard"
    );

if (formCard) {
    formCard.style.display = "none";
}

/* Refresh license list */
if (typeof loadLicenseList === "function") {
    loadLicenseList();
}

showMessage(
    "Payment successful. Yearly License activated successfully.",
    "success"
);   

    } catch (error) {

        console.error(
            "Payment Verification Error:",
            error
        );

        showMessage(
            error.message ||
            "Payment verification failed.",
            "error"
        );
    }

},

    modal: {
        ondismiss: function () {
            showMessage(
                "Payment cancelled.",
                "error"
            );
        }
    }
};

const razorpayCheckout =
    new window.Razorpay(options);

razorpayCheckout.open();

return result;
    } catch (error) {

        console.error(
            "Yearly Payment Error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to start yearly payment.",
            "error"
        );
    }
};

/* ================================
   DATE HELPERS
================================ */

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function calculateExpiryDate(startDate, days) {

    const expiry =
        new Date(startDate);

    expiry.setDate(
        expiry.getDate() + days
    );

    return formatDateForInput(expiry);
}

/* ================================
   MESSAGE
================================ */

function showMessage(message, type) {

    licenseMessage.textContent = message;

    licenseMessage.className =
        "license-message " + type;
}


/* ================================
   DATE FORMAT
================================ */

function formatDate(value) {

    if (!value) return "-";

    let date;

    if (value.toDate) {
        date = value.toDate();
    } else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* ================================
   DISPLAY LICENSE
================================ */

function displayLicense(key, data) {

    document.getElementById("showLicenseKey")
        .textContent = key;

    document.getElementById("showCustomerName")
        .textContent = data.customerName || "-";

        const planName =
    data.plan ||
    (
        data.licenseType === "trial"
            ? "Trial Version"
            : data.licenseType === "yearly"
                ? "Yearly Version"
                : "-"
    );

const planDays =
    data.planDays ||
    (
        data.licenseType === "trial"
            ? 7
            : data.licenseType === "yearly"
                ? 365
                : "-"
    );

document.getElementById("showLicensePlan")
    .textContent = planName;

document.getElementById("showLicenseValidity")
    .textContent =
        planDays === "-"
            ? "-"
            : planDays + " Days";
    const validFrom =
    data.activationDate ||
    data.activatedAt ||
    data.purchaseDate ||
    null;

document.getElementById("showActivationDate")
    .textContent = formatDate(validFrom);
    document.getElementById("showExpiryDate")
        .textContent = formatDate(data.expiryDate);

    document.getElementById("showStatus")
        .textContent =
        (data.status || "ACTIVE").toUpperCase();

   document.getElementById("showDeviceId")
    .textContent =
        data.deviceId ||
        getDeviceId();
    licenseDetails.style.display = "block";

   }


/* ================================
   ACTIVATE LICENSE
================================ */

window.activateLicense = async function () {

    const key =
        licenseKeyInput.value
            .trim()
            .toUpperCase();

    if (!key) {

        showMessage(
            "Please enter your license key.",
            "error"
        );

        return;
    }


    activateBtn.disabled = true;

    activateBtn.textContent =
        "Checking License...";


    try {

        const licenseRef =
            doc(db, "licenses", key);

        let licenseSnap =
            await getDoc(licenseRef);


/* LICENSE NOT FOUND */

if (!licenseSnap.exists()) {

    const licenseType =
        document.getElementById("licenseType")?.value || "";

    /*
       Trial license can be created
       from this activation form.
    */
    if (licenseType === "trial") {

        await window.saveLicenseInfo();

        const newLicenseSnap =
            await getDoc(licenseRef);

        if (!newLicenseSnap.exists()) {

            showMessage(
                "Unable to create Trial License.",
                "error"
            );

            return;
        }

        licenseSnap = newLicenseSnap;

    } else {

        showMessage(
            "Invalid license key.",
            "error"
        );

        return;
    }
}

        const data =
            licenseSnap.data();


        /* CHECK STATUS */

        if (
            data.status &&
            data.status.toLowerCase() === "inactive"
        ) {

            showMessage(
                "This license is inactive.",
                "error"
            );

            return;
        }


        /* CHECK DEVICE */

        const deviceId =
            getDeviceId();

        if (
            data.deviceId &&
            data.deviceId !== deviceId
        ) {

            showMessage(
                "This license is already activated on another device.",
                "error"
            );

            return;
        }


        /* CHECK EXPIRY */

        if (data.expiryDate) {

            const expiry =
                data.expiryDate.toDate
                    ? data.expiryDate.toDate()
                    : new Date(data.expiryDate);

            if (expiry < new Date()) {

                showMessage(
                    "This license has expired.",
                    "error"
                );

                return;
            }
        }


        /* ACTIVATE */

        await updateDoc(
            licenseRef,
            {
                status: "active",
                deviceId: deviceId,
                activatedAt: serverTimestamp()
            }
        );


        /* LOCAL STORAGE */

        localStorage.setItem(
            "suviLicenseKey",
            key
        );


        showMessage(
            "License activated successfully.",
            "success"
        );


        displayLicense(
            key,
            {
                ...data,
                status: "active",
                deviceId: deviceId,
                activatedAt: new Date()
            }
        );
        const formCard =
    document.getElementById("licenseFormCard");

if (formCard) {
    formCard.style.display = "none";
}


    } catch (error) {

        console.error(
            "License activation error:",
            error
        );

        showMessage(
            "License activation failed. Check Firebase/Firestore.",
            "error"
        );

    } finally {

        activateBtn.disabled = false;

        activateBtn.textContent =
            "Activate License";
    }
};


/* ================================
   LOAD SAVED LICENSE
================================ */
async function loadSavedLicense() {

    const selectedCompanyId =
        localStorage.getItem("SUVI_COMPANY_ID") || "";

    if (!selectedCompanyId) {
        return;
    }

    const normalizedCompanyId =
        String(selectedCompanyId)
            .trim()
            .toUpperCase();

    try {

        let licenseData = null;
        let licenseKey = null;

        /* =================================
           1. CHECK SAVED LICENSE KEY
        ================================= */

        const savedKey =
            localStorage.getItem("suviLicenseKey");

        if (savedKey) {

            const licenseRef =
                doc(db, "licenses", savedKey);

            const licenseSnap =
                await getDoc(licenseRef);

            if (licenseSnap.exists()) {

                const data =
                    licenseSnap.data();

                const dataCompanyId =
                    String(data.companyId || "")
                        .trim()
                        .toUpperCase();

                if (
                    dataCompanyId ===
                    normalizedCompanyId
                ) {
                    licenseData = data;
                    licenseKey = savedKey;
                }
            }
        }


        /* =================================
           2. FIND LICENSE FOR CURRENT FIRM
        ================================= */

        if (!licenseData) {

            const snapshot =
                await getDocs(
                    collection(db, "licenses")
                );

            const now = new Date();

            const firmLicenses =
                snapshot.docs
                    .map(item => ({
                        key: item.id,
                        data: item.data()
                    }))
                    .filter(item => {

                        const companyId =
                            String(
                                item.data.companyId || ""
                            )
                            .trim()
                            .toUpperCase();

                        if (
                            companyId !==
                            normalizedCompanyId
                        ) {
                            return false;
                        }

                        if (
                            String(
                                item.data.status || ""
                            )
                            .toLowerCase() !==
                            "active"
                        ) {
                            return false;
                        }

                        if (item.data.expiryDate) {

                            const expiry =
                                item.data.expiryDate.toDate
                                    ? item.data.expiryDate.toDate()
                                    : new Date(
                                        item.data.expiryDate
                                    );

                            if (expiry < now) {
                                return false;
                            }
                        }

                        return true;
                    });


            if (firmLicenses.length > 0) {

                const selectedLicense =
                    firmLicenses[0];

                licenseKey =
                    selectedLicense.key;

                licenseData =
                    selectedLicense.data;

                localStorage.setItem(
                    "suviLicenseKey",
                    licenseKey
                );
            }
        }


        /* =================================
           3. NO LICENSE FOR THIS FIRM
        ================================= */

        if (!licenseData) {

            localStorage.removeItem(
                "suviLicenseKey"
            );

            licenseKeyInput.value = "";

            licenseDetails.style.display =
                "none";

            console.log(
                "No license found for:",
                normalizedCompanyId
            );

            return;
        }


        /* =================================
           4. DEVICE CHECK
        ================================= */

        const deviceId =
            getDeviceId();

        if (
            licenseData.deviceId &&
            licenseData.deviceId !== deviceId
        ) {

            showMessage(
                "License belongs to another device.",
                "error"
            );

            return;
        }


        /* =================================
           5. EXPIRY CHECK
        ================================= */

        if (licenseData.expiryDate) {

            const expiry =
                licenseData.expiryDate.toDate
                    ? licenseData.expiryDate.toDate()
                    : new Date(
                        licenseData.expiryDate
                    );

            if (expiry < new Date()) {

                displayLicense(
                    licenseKey,
                    {
                        ...licenseData,
                        status: "expired"
                    }
                );

                showMessage(
                    "License expired.",
                    "error"
                );

                return;
            }
        }


        /* =================================
           6. DISPLAY CURRENT FIRM LICENSE
        ================================= */

        licenseKeyInput.value =
            licenseKey;

        displayLicense(
            licenseKey,
            licenseData
        );

        showMessage(
            "License is active.",
            "success"
        );

    } catch (error) {

        console.error(
            "License loading error:",
            error
        );
    }
}

/* ================================
   DEACTIVATE
================================ */

window.deactivateLicense = async function () {

    const key =
        localStorage.getItem("suviLicenseKey");

    if (!key) return;


    const confirmDeactivate =
        confirm(
            "Are you sure you want to deactivate this license?"
        );

    if (!confirmDeactivate) return;


    try {

        const licenseRef =
            doc(db, "licenses", key);


        await updateDoc(
            licenseRef,
            {
                status: "inactive",
                deviceId: deleteField(),
                activatedAt: deleteField()
            }
        );


        localStorage.removeItem(
            "suviLicenseKey"
        );


        licenseDetails.style.display =
            "none";

        deactivateBtn.style.display =
            "none";

        licenseKeyInput.value = "";


        showMessage(
            "License deactivated.",
            "success"
        );


    } catch (error) {

        console.error(
            "Deactivate error:",
            error
        );

        showMessage(
            "Unable to deactivate license.",
            "error"
        );
    }
};


/* ================================
   DASHBOARD
================================ */

window.goDashboard = function () {

    window.location.href =
        "../../dashboard.html";
};


/* ================================
   AUTH CHECK
================================ */

onAuthStateChanged(auth, (user) => {

    if (!user) {

        showMessage(
            "Please login first.",
            "error"
        );

        activateBtn.disabled = true;

        return;
    }

    loadSavedLicense();
});
/* =========================================================
   LICENSE INFO MANAGEMENT
   SAVE / EDIT / DELETE / SEARCH / EXPIRY STATUS
========================================================= */

const licenseInfoCollection = "licenses";

let editingLicenseKey = null;


/* ================================
   GET FORM DATA
================================ */

function getLicenseFormData() {

    const deviceId =
        document.getElementById("deviceId")?.value ||
        getDeviceId();

    return {

companyId:
    localStorage.getItem("SUVI_COMPANY_ID") || "",

firmName:
    localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM") || "",

        softwareName:
            document.getElementById("softwareName")?.value.trim() || "",

        licenseKey:
            document.getElementById("licenseKey")?.value.trim().toUpperCase() || "",

        licenseType:
            document.getElementById("licenseType")?.value || "",

        customerName:
            document.getElementById("customerName")?.value.trim() || "",

       
            purchaseDate:
            document.getElementById("purchaseDate")?.value || "",

        activationDate:
            document.getElementById("activationDate")?.value || "",

        expiryDate:
            document.getElementById("expiryDate")?.value || "",

        status:
            document.getElementById("licenseStatus")?.value || "pending",

        numberOfDevices:
            Number(document.getElementById("numberOfDevices")?.value || 1),

        deviceId: deviceId,

        vendorName:
            document.getElementById("vendorName")?.value.trim() || "",

        supportContact:
            document.getElementById("supportContact")?.value.trim() || "",

        notes:
            document.getElementById("licenseNotes")?.value.trim() || "",

        updatedAt: serverTimestamp()
    };
}


/* ================================
   SAVE LICENSE INFO
================================ */

window.saveLicenseInfo = async function () {

    const data = getLicenseFormData();

    if (!data.softwareName) {
        showMessage("Please enter Software / Product Name.", "error");
        return;
    }

    if (!data.licenseKey) {
        showMessage("Please enter License Key.", "error");
        return;
    }

    if (!data.customerName) {
        showMessage("Please enter Customer / Company Name.", "error");
        return;
    }

    try {

        const licenseRef =
            doc(db, licenseInfoCollection, data.licenseKey);

        const existing =
            await getDoc(licenseRef);

        if (existing.exists() && !editingLicenseKey) {

            showMessage(
                "This License Key already exists.",
                "error"
            );

            return;
        }

        await updateDoc(licenseRef, data);

        showMessage(
            "License information saved successfully.",
            "success"
        );

        editingLicenseKey = null;
 

        clearLicenseForm();

        loadLicenseList();

    } catch (error) {

        console.error(
            "Save license error:",
            error
        );

        /*
           If document does not exist,
           create it using setDoc.
        */

        try {

            const licenseRef =
                doc(db, licenseInfoCollection, data.licenseKey);

            const { setDoc } =
                await import(
                    "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
                );

            await setDoc(
                licenseRef,
                {
                    ...data,
                    createdAt: serverTimestamp()
                }
            );

            showMessage(
                "License information saved successfully.",
                "success"
            );

            editingLicenseKey = null;
            

            clearLicenseForm();

            loadLicenseList();

        } catch (saveError) {

            console.error(
                "Final save error:",
                saveError
            );

            showMessage(
                "Unable to save license information.",
                "error"
            );
        }
    }
};


/* ================================
   CLEAR FORM
================================ */

window.clearLicenseForm = function () {

    const ids = [
        "softwareName",
        "licenseKey",
        "licenseType",
        "customerName",
        "purchaseDate",
        "activationDate",
        "expiryDate",
        "licenseStatus",
        "numberOfDevices",
        "vendorName",
        "supportContact",
        "licenseNotes"
    ];

    ids.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {

            if (id === "numberOfDevices") {
                element.value = 1;
            } else {
                element.value = "";
            }
        }
    });


    const deviceInput =
        document.getElementById("deviceId");

    if (deviceInput) {
        deviceInput.value = getDeviceId();
    }

    editingLicenseKey = null;
};


/* ================================
   SEARCH LICENSE
================================ */

window.searchLicense = async function () {

    const key =
        document.getElementById("licenseSearch")?.value
            .trim()
            .toUpperCase();

    if (!key) {

        loadLicenseList();

        return;
    }

    try {

        const licenseRef =
            doc(db, licenseInfoCollection, key);

        const snapshot =
            await getDoc(licenseRef);

        if (!snapshot.exists()) {

            showMessage(
                "License not found.",
                "error"
            );

            return;
        }

        const data =
            snapshot.data();

        fillLicenseForm(key, data);

    } catch (error) {

        console.error(
            "Search license error:",
            error
        );

        showMessage(
            "Unable to search license.",
            "error"
        );
    }
};


/* ================================
   EDIT LICENSE
================================ */

window.editLicense = function (key, data) {

    editingLicenseKey = key;

    fillLicenseForm(key, data);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};


/* ================================
   FILL FORM
================================ */

function fillLicenseForm(key, data) {

    const setValue = (id, value) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = value ?? "";
        }
    };

    setValue(
        "softwareName",
        data.softwareName
    );

    setValue(
        "licenseKey",
        key
    );

    setValue(
        "licenseType",
        data.licenseType
    );

    setValue(
        "customerName",
        data.customerName
    );

    setValue(
        "purchaseDate",
        data.purchaseDate
    );

    setValue(
        "activationDate",
        data.activationDate
    );

    setValue(
        "expiryDate",
        data.expiryDate
    );

    setValue(
        "licenseStatus",
        getAutomaticLicenseStatus(data)
    );

    setValue(
        "numberOfDevices",
        data.numberOfDevices || 1
    );

    setValue(
        "deviceId",
        data.deviceId || getDeviceId()
    );

    setValue(
        "vendorName",
        data.vendorName
    );

    setValue(
        "supportContact",
        data.supportContact
    );

    setValue(
        "licenseNotes",
        data.notes
    );
}


/* ================================
   DELETE LICENSE
================================ */

window.deleteLicense = async function (key) {

    if (!key) return;

    const confirmed =
        confirm(
            "Are you sure you want to delete this license?"
        );

    if (!confirmed) return;

    try {

        const licenseRef =
            doc(db, licenseInfoCollection, key);

        const { deleteDoc } =
            await import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
            );

        await deleteDoc(licenseRef);

        if (
            localStorage.getItem("suviLicenseKey") === key
        ) {
            localStorage.removeItem(
                "suviLicenseKey"
            );
        }

        showMessage(
            "License deleted successfully.",
            "success"
        );

        clearLicenseForm();

        loadLicenseList();

    } catch (error) {

        console.error(
            "Delete license error:",
            error
        );

        showMessage(
            "Unable to delete license.",
            "error"
        );
    }
};


/* ================================
   AUTOMATIC STATUS
================================ */

function getAutomaticLicenseStatus(data) {

    if (!data.expiryDate) {
        return data.status || "pending";
    }

    const expiry =
        new Date(data.expiryDate);

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);

    expiry.setHours(0, 0, 0, 0);

    if (expiry < today) {
        return "expired";
    }

    if (
        data.activationDate &&
        data.activationDate > today
    ) {
        return "pending";
    }

    return "active";
}


/* ================================
   EXPIRY REMINDER
================================ */

function getExpiryReminder(expiryDate) {

    if (!expiryDate) {
        return "";
    }

    const expiry =
        new Date(expiryDate);

    const today =
        new Date();

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const difference =
        Math.ceil(
            (expiry - today) /
            (1000 * 60 * 60 * 24)
        );

    if (difference < 0) {

        return "Expired";
    }

    if (difference === 0) {

        return "Expires Today";
    }

    if (difference <= 7) {

        return `Expires in ${difference} days`;
    }

    if (difference <= 15) {

        return `Expires in ${difference} days`;
    }

    if (difference <= 30) {

        return `Expires in ${difference} days`;
    }

    return "";
}


/* ================================
   LOAD LICENSE LIST
================================ */

async function loadLicenseList() {

    const container =
        document.getElementById(
            "licenseList"
        );

    if (!container) return;

    try {

        const {
            collection,
            getDocs
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        const selectedFirm =
    localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM") || "";

const companyId =
    localStorage.getItem("SUVI_COMPANY_ID") || "";

const snapshot =
    await getDocs(
        collection(
            db,
            "licenses"
        )
    );

    const firmLicenses =
    snapshot.docs.filter(item => {

        const data = item.data();

        const recordCompanyId =
            String(data.companyId || "")
                .trim()
                .toUpperCase();

        const recordFirmName =
            String(data.firmName || "")
                .trim()
                .toUpperCase();

        const selectedCompanyId =
            String(companyId || "")
                .trim()
                .toUpperCase();

        const selectedFirmName =
            String(selectedFirm || "")
                .trim()
                .toUpperCase();

        return (
            recordCompanyId === selectedCompanyId &&
            recordFirmName === selectedFirmName
        );

    });

        container.innerHTML = "";

        if (firmLicenses.length === 0) {

            container.innerHTML =
                "<p>No licenses found.</p>";

            return;
        }

        firmLicenses.forEach(item => {

            const data =
                item.data();

            const key =
                item.id;

            const status =
                getAutomaticLicenseStatus(data);

            const reminder =
                getExpiryReminder(
                    data.expiryDate
                );

            const row =
                document.createElement("div");

            row.className =
                "license-list-row";

            row.innerHTML = `

                <div>
                    <strong>
                        ${data.softwareName || "-"}
                    </strong>

                    <small>
                        ${key}
                    </small>
                </div>

                <div>
                    ${data.customerName || "-"}
                </div>

                <div>
                    ${status.toUpperCase()}
                </div>

                <div>
                    ${data.expiryDate || "-"}
                </div>

                <div>
                    ${reminder || "-"}
                </div>

                <div>

                    <button
                        type="button"
                        onclick='editLicense(
                            ${JSON.stringify(key)},
                            ${JSON.stringify(data)}
                        )'
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onclick='deleteLicense(
                            ${JSON.stringify(key)}
                        )'
                    >
                        Delete
                    </button>

                </div>
            `;

            container.appendChild(row);
        });

    } catch (error) {

        console.error(
            "Load license list error:",
            error
        );
    }
}


/* ================================
   AUTO DEVICE ID
================================ */

function loadLicenseDeviceId() {

    const input =
        document.getElementById(
            "deviceId"
        );

    if (input) {

        input.value =
            getDeviceId();
    }
}


/* ================================
   START LICENSE MANAGEMENT
================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadLicenseDeviceId();

        loadLicenseList();

    }
);

