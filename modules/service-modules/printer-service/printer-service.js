// BACK TO SERVICE MODULES
const serviceBackButton =
    document.getElementById("serviceBackButton");

if (serviceBackButton) {
    serviceBackButton.addEventListener(
        "click",
        function (event) {
            event.preventDefault();

            window.location.href =
    "../../../dashboard.html?page=service-modules";
        }
    );
}


// BACK TO DASHBOARD
const backToDashboard =
    document.getElementById("backToDashboard");
/* =====================================================
   DYNAMIC FIRM NAME
   ===================================================== */

const printerServiceFirmName =
    document.getElementById("printerServiceFirmName");

if (printerServiceFirmName) {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (selectedFirm) {
        printerServiceFirmName.textContent =
            selectedFirm.trim();
    }
}
if (backToDashboard) {
    backToDashboard.addEventListener(
        "click",
        function (event) {
            event.preventDefault();

            window.location.href =
                "../../../dashboard.html";
        }
    );
}