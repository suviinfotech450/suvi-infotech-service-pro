function openAdminModule(module) {

    // 🔐 ADMIN PANEL PASSCODE
    if (module === "admin") {

        const passcode = prompt("🔐 Enter Admin Panel Passcode:");

        if (passcode !== "2580") {
            alert("❌ Incorrect Admin Panel Passcode.");
            return;
        }
    }

    switch (module) {

        case "users":
            window.location.href = "user-management.html";
            break;

        case "roles":
            window.location.href = "roles-permissions.html";
            break;

        case "company":
            window.location.href = "company-settings.html";
            break;

        case "reports":
            window.location.href = "reports.html";
            break;

        case "logs":
            window.location.href = "activity-logs.html";
            break;

        case "backup":
            window.location.href = "backup-restore.html";
            break;

        case "admin":
            window.location.href = "admin-panel.html";
            break;

        default:
            console.error("Unknown Admin Module:", module);
    }
}
// Invoice Settings - Show / Hide
const invoiceSettingsTitle =
    document.getElementById("invoiceSettingsTitle");

const invoiceSettingsCard =
    document.getElementById("invoiceSettingsCard");

if (invoiceSettingsTitle && invoiceSettingsCard) {
    invoiceSettingsTitle.addEventListener("click", function () {
        invoiceSettingsCard.style.display =
            invoiceSettingsCard.style.display === "none"
                ? "block"
                : "none";
    });
}
function updateClientCount() {

    let clients = [];

    try {
        clients = JSON.parse(
            localStorage.getItem("suviInfotechClients") || "[]"
        );
    } catch (e) {
        clients = [];
    }

    const count =
        document.getElementById("adminClientCount");

    if (count) {
        count.textContent =
            Array.isArray(clients) ? clients.length : 0;
    }
}

document.addEventListener(
    "DOMContentLoaded",
    updateClientCount
);
// =========================================================
// CLIENT COUNT
// =========================================================

function updateClientCount() {

    let clients = [];

    try {
        const saved =
            localStorage.getItem("suviInfotechClients");

        if (saved) {
            clients = JSON.parse(saved);
        }

    } catch (error) {
        console.error("Client count error:", error);
        clients = [];
    }

    const countElement =
        document.getElementById("adminClientCount");

    if (countElement) {
        countElement.textContent =
            Array.isArray(clients)
                ? clients.length
                : 0;
    }
}


// Load count when Admin Panel opens
updateClientCount();