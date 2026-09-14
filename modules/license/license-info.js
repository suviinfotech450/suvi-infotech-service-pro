import {
    initializeApp,
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    deleteDoc,
    collection,
    getDocs,
    serverTimestamp
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


const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


/* ================================
   DEVICE ID
================================ */

function getDeviceId() {

    let deviceId =
        localStorage.getItem("suviLicenseDeviceId");

    if (!deviceId) {

        if (
            window.crypto &&
            crypto.randomUUID
        ) {
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
   MESSAGE
================================ */

function showInfoMessage(message, type) {

    const box =
        document.getElementById("licenseMessage");

    if (!box) return;

    box.textContent = message;

    box.className =
        "license-message " + type;
}


/* ================================
   LOAD DEVICE ID
================================ */

function loadDeviceId() {

    const input =
        document.getElementById("deviceId");

    if (input) {
        input.value = getDeviceId();
    }
}


/* ================================
   GET FORM DATA
================================ */

function getFormData() {

    return {
companyId:
    localStorage.getItem("SUVI_COMPANY_ID") || "",

firmName:
    localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM") || "",
        softwareName:
            document.getElementById("softwareName")?.value.trim() || "",

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
            Number(
                document.getElementById("numberOfDevices")?.value || 1
            ),

        deviceId:
            document.getElementById("deviceId")?.value ||
            getDeviceId(),

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
            paid: false
        };
    }

    if (licenseType === "yearly") {
        return {
            type: "yearly",
            name: "Yearly Version",
            days: 365,
            paid: true
        };
    }

    return null;
}


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
document.getElementById("licenseType")
    ?.addEventListener("change", function () {

        if (this.value !== "trial") {
            return;
        }

        const today = new Date();

        const todayString =
            formatDateForInput(today);

        const expiryString =
            calculateExpiryDate(today, 7);

        const purchaseDate =
            document.getElementById("purchaseDate");

        const activationDate =
            document.getElementById("activationDate");

        const expiryDate =
            document.getElementById("expiryDate");

        if (purchaseDate) {
            purchaseDate.value = todayString;
        }

        if (activationDate) {
            activationDate.value = todayString;
        }

        if (expiryDate) {
            expiryDate.value = expiryString;
        }

    });
/* ================================
   SAVE LICENSE
================================ */

window.saveLicenseInfo = async function () {

    const licenseKey =
        document.getElementById("licenseKey")
            ?.value
            .trim()
            .toUpperCase();

    if (!licenseKey) {

        showInfoMessage(
            "Please enter License Key.",
            "error"
        );

        return;
    }


    const data = getFormData();
    const plan = getLicensePlan();

if (!plan) {

    showInfoMessage(
        "Please select Trial Version or Yearly Version.",
        "error"
    );

    return;
}


/* ================================
   TRIAL - 7 DAYS
================================ */

if (plan.type === "trial") {

    const today = new Date();

    const todayString =
        formatDateForInput(today);

    const expiryString =
        calculateExpiryDate(
            today,
            7
        );

    data.licenseType =
        "trial";

    data.purchaseDate =
        todayString;

    data.activationDate =
        todayString;

    data.expiryDate =
        expiryString;

    data.status =
        "active";

    data.plan =
        "Trial Version";

    data.planDays =
        7;
}


    if (!data.softwareName) {

        showInfoMessage(
            "Please enter Software / Product Name.",
            "error"
        );

        return;
    }


    if (!data.licenseType) {

        showInfoMessage(
            "Please select License Type.",
            "error"
        );

        return;
    }


    if (!data.customerName) {

        showInfoMessage(
            "Please enter Customer / Company Name.",
            "error"
        );

        return;
    }


    try {

        const licenseRef =
            doc(db, "licenses", licenseKey);

        const existing =
            await getDoc(licenseRef);


        /*
           Existing license:
           update it.
        */

        if (existing.exists()) {

            const confirmUpdate =
                confirm(
                    "License already exists. Update this license?"
                );

            if (!confirmUpdate) {
                return;
            }
        }


        await setDoc(
            licenseRef,
            {
                ...data,
                licenseKey: licenseKey,
                updatedAt: serverTimestamp()
            },
            {
                merge: true
            }
        );


        showInfoMessage(
            "License information saved successfully.",
            "success"
        );
        const formCard =
    document.getElementById("licenseFormCard");

if (formCard) {
    formCard.style.display = "none";
}

        document.getElementById("licenseKey").value =
            licenseKey;


        loadLicenseList();

    } catch (error) {

        console.error(
            "Save License Error:",
            error
        );

        showInfoMessage(
            "Unable to save license information.",
            "error"
        );
    }
};


/* ================================
   SEARCH
================================ */

window.searchLicenseInfo = async function () {

    const searchKey =
        document.getElementById("licenseSearch")
            ?.value
            .trim()
            .toUpperCase();

    if (!searchKey) {

        loadLicenseList();

        return;
    }


    try {

        const licenseRef =
            doc(db, "licenses", searchKey);

        const snapshot =
            await getDoc(licenseRef);


        if (!snapshot.exists()) {

            showInfoMessage(
                "License not found.",
                "error"
            );

            return;
        }


        fillForm(
            searchKey,
            snapshot.data()
        );


        showInfoMessage(
            "License found.",
            "success"
        );

    } catch (error) {

        console.error(
            "Search Error:",
            error
        );

        showInfoMessage(
            "Unable to search license.",
            "error"
        );
    }
};


/* ================================
   FILL FORM
================================ */

function fillForm(key, data) {

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
        getStatus(data.expiryDate)
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
   STATUS
================================ */

function getStatus(expiryDate) {

    if (!expiryDate) {
        return "pending";
    }


    const today =
        new Date();

    const expiry =
        new Date(expiryDate);


    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);


    if (expiry < today) {
        return "expired";
    }


    return "active";
}


/* ================================
   EXPIRY REMINDER
================================ */
function formatLicenseDate(value) {

    if (!value) {
        return "-";
    }

    let date;

    // Firestore Timestamp
    if (
        value &&
        typeof value.toDate === "function"
    ) {
        date = value.toDate();
    }

    // Normal date / string
    else {
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

function getExpiryReminder(expiryDate) {

    if (!expiryDate) {
        return `<span class="reminder-badge reminder-none">
                    NO EXPIRY DATE
                </span>`;
    }

    let expiry;

    if (
        expiryDate &&
        typeof expiryDate.toDate === "function"
    ) {
        expiry = expiryDate.toDate();
    } else {
        expiry = new Date(expiryDate);
    }

    if (isNaN(expiry.getTime())) {
        return `<span class="reminder-badge reminder-none">
                    NO EXPIRY DATE
                </span>`;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const days = Math.ceil(
        (expiry - today) /
        (1000 * 60 * 60 * 24)
    );

    if (days < 0) {
        return `<span class="reminder-badge reminder-expired">
                    EXPIRED
                </span>`;
    }

    if (days === 0) {
        return `<span class="reminder-badge reminder-today">
                    EXPIRES TODAY
                </span>`;
    }

    if (days <= 7) {
        return `<span class="reminder-badge reminder-urgent">
                    ${days} DAYS LEFT
                </span>`;
    }

    if (days <= 30) {
        return `<span class="reminder-badge reminder-warning">
                    ${days} DAYS LEFT
                </span>`;
    }

    return `<span class="reminder-badge reminder-valid">
                ${days} DAYS LEFT
            </span>`;
}

/* ================================
   EDIT
================================ */

window.editLicenseInfo = function (
    key,
    data
) {

    fillForm(
        key,
        data
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};


/* ================================
   DELETE
================================ */

window.deleteLicenseInfo = async function (key) {

    if (!key) return;


    const confirmed =
        confirm(
            "Are you sure you want to delete this license?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const licenseRef =
            doc(db, "licenses", key);


        await deleteDoc(
            licenseRef
        );


        if (
            localStorage.getItem(
                "suviLicenseKey"
            ) === key
        ) {

            localStorage.removeItem(
                "suviLicenseKey"
            );
        }


        showInfoMessage(
            "License deleted successfully.",
            "success"
        );


        clearLicenseForm();
        window.openLicenseForm = function () {

    clearLicenseForm();

    const formCard =
        document.getElementById("licenseFormCard");

    if (formCard) {
        formCard.style.display = "block";
    }
};
window.openLicenseForm = function () {

    clearLicenseForm();

    const formCard =
        document.getElementById("licenseFormCard");

    if (formCard) {
        formCard.style.display = "block";
    }
};
const formCard =
    document.getElementById("licenseFormCard");

if (formCard) {
    formCard.style.display = "none";
}

        loadLicenseList();

    } catch (error) {

        console.error(
            "Delete License Error:",
            error
        );

        showInfoMessage(
            "Unable to delete license.",
            "error"
        );
    }
};


/* ================================
   CLEAR FORM
================================ */

window.clearLicenseForm = function () {

    const fields = [
        "softwareName",
        "licenseKey",
        "licenseType",
        "customerName",
        "purchaseDate",
        "activationDate",
        "expiryDate",
        "vendorName",
        "supportContact",
        "licenseNotes"
    ];


    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }
    });


    const status =
        document.getElementById(
            "licenseStatus"
        );

    if (status) {
        status.value = "pending";
    }


    const devices =
        document.getElementById(
            "numberOfDevices"
        );

    if (devices) {
        devices.value = 1;
    }


    loadDeviceId();
};


/* ================================
   LOAD LICENSE LIST
================================ */

async function loadLicenseList() {

    const list =
        document.getElementById(
            "licenseList"
        );

    if (!list) return;


    try {
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

        return (
            String(data.companyId || "")
                .trim()
                .toUpperCase() ===
            String(companyId)
                .trim()
                .toUpperCase()
        );

    });


        list.innerHTML = "";
const header = document.createElement("div");

header.className = "license-list-header";

header.innerHTML = `
    <div>Software / Product</div>
    <div>Customer / Company</div>
    <div>Status</div>
    <div>Expiry Date</div>
    <div>Reminder</div>
    <div>Action</div>
`;

list.appendChild(header);

       if (firmLicenses.length === 0) {

            list.innerHTML =
                "<p>No licenses found.</p>";

            return;
        }

firmLicenses.forEach(item => {

            const key =
                item.id;

            const data =
                item.data();


            const status =
                getStatus(
                    data.expiryDate
                );


            const reminder =
                getExpiryReminder(
                    data.expiryDate
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "license-list-row";


            row.innerHTML = `

                <div>
                    <strong>
                        ${escapeHTML(
                            data.softwareName || "-"
                        )}
                    </strong>

                    <small>
                        ${escapeHTML(key)}
                    </small>
                </div>

                <div>
                    ${escapeHTML(
                        data.customerName || "-"
                    )}
                </div>

                <div>
                    ${status.toUpperCase()}
                </div>

                <div>
                    ${formatLicenseDate(data.expiryDate)}
                </div>

                <div>
                    ${reminder}
                </div>

                <div>

                    <button
                        type="button"
                        class="edit-license-btn"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-license-btn"
                    >
                        Delete
                    </button>

                </div>
            `;


            row
                .querySelector(
                    ".edit-license-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        editLicenseInfo(
                            key,
                            data
                        );
                    }
                );


            row
                .querySelector(
                    ".delete-license-btn"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteLicenseInfo(
                            key
                        );
                    }
                );


            list.appendChild(row);
        });

    } catch (error) {

        console.error(
            "Load License List Error:",
            error
        );
    }
}


/* ================================
   HTML SECURITY
================================ */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ================================
   AUTH CHECK
================================ */
onAuthStateChanged(
    auth,
    user => {

        if (!user) {

            showInfoMessage(
                "Please login first.",
                "error"
            );

            return;
        }

        loadDeviceId();
    }
);