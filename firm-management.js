const FIRM_STORAGE_KEY = "SUVI_INFOTECH_FIRMS";
const SELECTED_FIRM_KEY = "SUVI_INFOTECH_SELECTED_FIRM";

let firms = JSON.parse(
    localStorage.getItem(FIRM_STORAGE_KEY) || "[]"
);

document.addEventListener("DOMContentLoaded", function () {

    document
        .getElementById("firmForm")
        .addEventListener("submit", saveFirm);

    document
        .getElementById("newFirmBtn")
        .addEventListener("click", function () {

            clearForm();

            document.getElementById("firmFormSection").style.display = "block";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

    document.getElementById("firmFormSection").style.display = "none";

    displayFirms();
});

function saveFirm(event) {

    event.preventDefault();

    const firm = {
        firmName: document.getElementById("firmName").value.trim(),
        contactPerson: document.getElementById("contactPerson").value.trim(),
        mobile: document.getElementById("mobile").value.trim(),
        landline: document.getElementById("landline").value.trim(),
        email: document.getElementById("email").value.trim(),
        gstNumber: document.getElementById("gstNumber").value.trim(),
        city: document.getElementById("city").value.trim(),
        state: document.getElementById("state").value,
        pincode: document.getElementById("pincode").value.trim(),
        address: document.getElementById("address").value.trim(),
        bankDetails: document.getElementById("bankDetails").value.trim()
    };

    if (!firm.firmName) {
        alert("Please enter Firm Name");
        return;
    }

    const editIndex = document.getElementById("editIndex").value;

if (editIndex === "") {

    // Generate Company ID for new firm
    let prefix = firm.firmName
        .toUpperCase()
        .replace(/[^A-Z]/g, "");

    if (firm.firmName.toUpperCase().includes("SUVI")) {
        prefix = "SUVI";
    } else if (firm.firmName.toUpperCase().includes("ECO")) {
        prefix = "ECO";
    } else {
        prefix = prefix.substring(0, 3) || "COM";
    }

    let number = 1;
    let companyId = prefix + String(number).padStart(3, "0");

    while (firms.some(f => f.companyId === companyId)) {
        number++;
        companyId = prefix + String(number).padStart(3, "0");
    }

    firm.companyId = companyId;

    firms.push(firm);

    console.log("NEW COMPANY ID:", companyId);

    alert(
        "Firm added successfully.\nCompany ID: " + companyId
    );

} else {

    // Preserve existing Company ID while editing
    const oldFirm = firms[Number(editIndex)];

    firm.companyId =
        oldFirm.companyId || null;

    firms[Number(editIndex)] = firm;

    console.log(
        "UPDATED COMPANY ID:",
        firm.companyId
    );

    alert("Firm updated successfully.");
}

    localStorage.setItem(
        FIRM_STORAGE_KEY,
        JSON.stringify(firms)
    );

    clearForm();
document.getElementById("firmFormSection").style.display = "none";
displayFirms();
}

async function displayFirms() {

    const list = document.getElementById("firmList");
    const count = document.getElementById("firmCount");

    list.innerHTML = "";

    count.textContent =
        firms.length + (firms.length === 1 ? " Firm" : " Firms");

    if (firms.length === 0) {

        list.innerHTML =
            "<p>No firms added yet.</p>";

        return;
    }

 let licenses = [];

try {

    const {
        getFirestore,
        collection,
        getDocs
    } = await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
    );

    const {
        getAuth,
        signInAnonymously
    } = await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"
    );

    const {
        getApps,
        getApp,
        initializeApp
    } = await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"
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


    const app =
        getApps().length
            ? getApp()
            : initializeApp(firebaseConfig);


    const db =
        window.firebaseDb ||
        getFirestore(app);


    const auth =
        getAuth(app);


    /* WAIT FOR FIREBASE AUTH */

    if (!auth.currentUser) {

        try {

            await signInAnonymously(auth);

        } catch (authError) {

            console.error(
                "Firebase Auth Error:",
                authError
            );

        }

    }


    /* LOAD LICENSES */

    if (auth.currentUser) {

        const snapshot =
            await getDocs(
                collection(db, "licenses")
            );


        snapshot.forEach(function (doc) {

            licenses.push({
                id: doc.id,
                ...doc.data()
            });

        });


        console.log(
            "Firm Management Licenses Loaded:",
            licenses.length
        );

    } else {

        console.warn(
            "Firebase user not available."
        );

    }


} catch (error) {

    console.error(
        "License Load Error:",
        error
    );

}  


    try {

        const {
    getFirestore,
    collection,
    getDocs
} = await import(
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
);

const {
    getAuth,
    onAuthStateChanged
} = await import(
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js"
);

        const {
            getApps,
            getApp,
            initializeApp
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"
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
const app =
    getApps().length
        ? getApp()
        : initializeApp(firebaseConfig);

const db =
    window.firebaseDb ||
    getFirestore(app);

const auth = getAuth(app);

const currentUser = auth.currentUser;

if (currentUser) {

    const snapshot =
        await getDocs(
            collection(db, "licenses")
        );

    snapshot.forEach(function (doc) {

        licenses.push({
            id: doc.id,
            ...doc.data()
        });

    });

}

    } catch (error) {

        console.error(
            "License Load Error:",
            error
        );

    }

    const selectedFirm =
        localStorage.getItem(SELECTED_FIRM_KEY);

    firms.forEach(function (firm, index) {

        const card =
            document.createElement("div");

        card.className = "firm-card";

        if (selectedFirm === firm.firmName) {
            card.classList.add("selected");
        }

        const savedLicenseKey =
    localStorage.getItem("suviLicenseKey");

let license = null;


/* =================================
   ECO PRINT → TRIAL VERSION
   ================================= */

if (firm.companyId === "ECO001") {

    license = null;

}


/* =================================
   SUVI INFOTECH → ACTIVE LICENSE
   ================================= */

else if (firm.companyId === "SUVI001") {

    const savedLicenseKey =
        localStorage.getItem("suviLicenseKey");

    if (savedLicenseKey) {

        license =
            licenses.find(function (item) {

                return (
                    String(item.id || "")
                        .trim()
                        .toUpperCase() ===
                    String(savedLicenseKey)
                        .trim()
                        .toUpperCase()
                );

            });

    }

}
/* =================================
   ECO PRINT → TRIAL ONLY
   SUVI INFOTECH → FIRESTORE LICENSE
   ================================= */

if (firm.companyId === "ECO001") {

    license = null;

} else if (firm.companyId === "SUVI001") {

    license =
        licenses.find(function (item) {

            return (
                String(item.customerName || "")
                    .trim()
                    .toLowerCase() === "suvi infotech"
            );

        });

}


        let licenseHTML = "";

if (license) {

    const status =
        String(
            license.status || "pending"
        ).toUpperCase();

    const activatedDate =
        formatFirmLicenseDate(
            license.activationDate ||
            license.activatedAt
        );

    const expiryDate =
        formatFirmLicenseDate(
            license.expiryDate
        );

    const statusClass =
        status === "ACTIVE"
            ? "license-active"
            : "license-pending";

    licenseHTML = `
        <div class="firm-license-box">

            <div class="license-header">

                <span class="license-title">
                    🔑 License
                </span>

                <span class="license-status ${statusClass}">
                    ${escapeHTML(status)}
                </span>

            </div>

            <div class="license-details">

                <div class="license-row">
                    <span>Activated</span>
                    <strong>
                        ${escapeHTML(activatedDate)}
                    </strong>
                </div>

                <div class="license-row">
                    <span>Valid Until</span>
                    <strong>
                        ${escapeHTML(expiryDate)}
                    </strong>
                </div>

            </div>

        </div>
    `;

} else {

    if (firm.companyId === "ECO001") {

        licenseHTML = `
            <div class="firm-license-box license-not-active">

                <div class="license-header">

                    <span class="license-title">
                        🔑 License
                    </span>

                    <span class="license-status license-pending">
                        TRIAL VERSION
                    </span>

                </div>

                <div class="license-details">

                    <div class="license-row">
                        <span>Trial Period</span>
                        <strong>7 Days Only</strong>
                    </div>

                </div>

            </div>
        `;

    } else {

        licenseHTML = `
            <div class="firm-license-box license-not-active">

                <div class="license-header">

                    <span class="license-title">
                        🔑 License
                    </span>

                    <span class="license-status license-pending">
                        NOT ACTIVATED
                    </span>

                </div>

            </div>
        `;
    }
}
      
        card.innerHTML = `

    <div class="firm-card-top">

        <div class="firm-title-area">

            <div class="firm-icon">
                🏢
            </div>

            <div>
                <h4>
                    ${escapeHTML(firm.firmName)}
                </h4>

                <span class="company-id">
                    ${escapeHTML(
                        firm.companyId || ""
                    )}
                </span>
            </div>

        </div>

    </div>


    <div class="firm-info">

        ${
            firm.contactPerson
            ? `
                <div class="firm-info-row">
                    <span class="info-label">👤 Contact</span>
                    <strong>
                        ${escapeHTML(firm.contactPerson)}
                    </strong>
                </div>
            `
            : ""
        }


        ${
            firm.mobile
            ? `
                <div class="firm-info-row">
                    <span class="info-label">📱 Mobile</span>
                    <strong>
                        ${escapeHTML(firm.mobile)}
                    </strong>
                </div>
            `
            : ""
        }


        ${
            firm.email
            ? `
                <div class="firm-info-row">
                    <span class="info-label">✉️ Email</span>
                    <strong>
                        ${escapeHTML(firm.email)}
                    </strong>
                </div>
            `
            : ""
        }


        ${
            firm.gstNumber
            ? `
                <div class="firm-info-row">
                    <span class="info-label">📄 GST</span>
                    <strong>
                        ${escapeHTML(firm.gstNumber)}
                    </strong>
                </div>
            `
            : ""
        }


        ${
            firm.city
            ? `
                <div class="firm-info-row">
                    <span class="info-label">📍 City</span>
                    <strong>
                        ${escapeHTML(firm.city)}
                    </strong>
                </div>
            `
            : ""
        }


        ${
            firm.state
            ? `
                <div class="firm-info-row">
                    <span class="info-label">🌐 State</span>
                    <strong>
                        ${escapeHTML(firm.state)}
                    </strong>
                </div>
            `
            : ""
        }


        ${licenseHTML}

    </div>


    <div class="firm-actions">

        <button
            class="select-btn"
            onclick="selectFirm(${index})">
            ✓ Select Firm
        </button>

        <button
            class="edit-btn"
            onclick="editFirm(${index})">
            ✎ Edit
        </button>

        <button
            class="delete-btn"
            onclick="deleteFirm(${index})">
            🗑 Delete
        </button>

    </div>

`;

        list.appendChild(card);

    });
}
function formatFirmLicenseDate(value) {

    if (!value) {
        return "-";
    }

    let date;

    if (
        value &&
        typeof value.toDate === "function"
    ) {
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

function selectFirm(index) {

    const firm = firms[index];

    // Selected Firm
    localStorage.setItem(
        SELECTED_FIRM_KEY,
        firm.firmName
    );

    // Selected Company ID
    if (firm.companyId) {
        localStorage.setItem(
            "SUVI_COMPANY_ID",
            firm.companyId
        );
    }

    // Notify other pages immediately
    window.dispatchEvent(
        new StorageEvent("storage", {
            key: SELECTED_FIRM_KEY,
            newValue: firm.firmName
        })
    );

    alert(
        "Selected Firm: " +
        firm.firmName +
        "\nCompany ID: " +
        firm.companyId
    );

    displayFirms();
}

function editFirm(index) {

    const firm = firms[index];
    document.getElementById("firmFormSection").style.display = "block";
    document.getElementById("editIndex").value = index;

    document.getElementById("firmName").value = firm.firmName || "";
    document.getElementById("contactPerson").value = firm.contactPerson || "";
    document.getElementById("mobile").value = firm.mobile || "";
    document.getElementById("landline").value = firm.landline || "";
    document.getElementById("email").value = firm.email || "";
    document.getElementById("gstNumber").value = firm.gstNumber || "";
    document.getElementById("city").value = firm.city || "";
    document.getElementById("state").value = firm.state || "";
    document.getElementById("pincode").value = firm.pincode || "";
    document.getElementById("address").value = firm.address || "";
    document.getElementById("bankDetails").value = firm.bankDetails || "";

    document.getElementById("formTitle").textContent =
        "Edit Firm";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function deleteFirm(index) {

    const firm = firms[index];

    if (!confirm(
        "Delete " + firm.firmName + "?"
    )) {
        return;
    }

    firms.splice(index, 1);

    localStorage.setItem(
        FIRM_STORAGE_KEY,
        JSON.stringify(firms)
    );

    const selectedFirm =
        localStorage.getItem(SELECTED_FIRM_KEY);

    if (selectedFirm === firm.firmName) {
        localStorage.removeItem(SELECTED_FIRM_KEY);
    }

    displayFirms();
}

function clearForm() {

    document.getElementById("firmForm").reset();

    document.getElementById("editIndex").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Firm";

    document.getElementById("firmFormSection").style.display = "none";
}

function goDashboard() {

    window.location.href = "dashboard.html";
}

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}