document.addEventListener("DOMContentLoaded", function () {

    const selectedFirm =
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM");

    if (!selectedFirm) return;

    const activeFirmBox = document.createElement("div");

    activeFirmBox.innerHTML = `
        🏢 <span>Active Firm:</span>
        <strong>${escapeHTML(selectedFirm)}</strong>
    `;

    activeFirmBox.style.cssText = `
        position: fixed;
        top: 75px;
        right: 180px;
        z-index: 9999;
        padding: 7px 14px;
        background: #ffffff;
        border: 1px solid #198754;
        border-radius: 20px;
        color: #198754;
        font-size: 13px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    `;

    document.body.appendChild(activeFirmBox);
});
document.addEventListener("DOMContentLoaded", function () {

    const firmNameEl =
        document.getElementById("dashboardFirmName");

    if (!firmNameEl) return;

    const selectedFirm =
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM")
        || "SUVI INFOTECH";

    firmNameEl.textContent =
        selectedFirm.trim();

});

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}