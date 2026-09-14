/* =====================================================
   DYNAMIC FIRM NAME
   ===================================================== */

const warrantyFirmName =
    document.getElementById("warrantyFirmName");

if (warrantyFirmName) {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (selectedFirm) {
        warrantyFirmName.textContent =
            selectedFirm.trim();
    }
}
// BACK TO SERVICE MODULES
const serviceBackButton =
    document.getElementById("serviceBackButton");

if (serviceBackButton) {
    serviceBackButton.addEventListener("click", function (event) {
        event.preventDefault();

        window.location.href =
            "../../../dashboard.html?page=service-modules";
    });
}


// BACK TO DASHBOARD
const backToDashboard =
    document.getElementById("backToDashboard");

if (backToDashboard) {
    backToDashboard.addEventListener("click", function (event) {
        event.preventDefault();

        window.location.href =
            "../../../dashboard.html";
    });
}