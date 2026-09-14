/* =========================================================
   SUVI INFOTECH - DASHBOARD JS
   Handles:
   - Overview card drag/drop
   - Quick action drag/drop
   - Reset layout
   - Refresh
   - Dashboard counts from browser storage
   - Quick action navigation
   - Service Modules toggle
   ========================================================= */

(function () {
    "use strict";

    const DEFAULT_OVERVIEW = [
        "clients",
        "calls",
        "services",
        "visits",
        "payments",
        "stock",
        "amc",
        "warranty",
        "ticket"
    ];

    const DEFAULT_ACTIONS = [
        "client",
        "call",
        "visit",
        "invoice",
        "inventory",
        "amc",
        "warranty",
        "reports",
        "ticket"
    ];

    const STORAGE_KEYS = {
        overview: "suvi_dashboard_overview_order",
        actions: "suvi_dashboard_quick_actions_order"
    };

    const MODULES = {
        client: "modules/client-master/client-master.html",
        call: "modules/call-register/call-register.html",
        visit: "modules/field-visit/field-visit.html",
        invoice: "modules/billing/billing.html",
        inventory: "modules/inventory/inventory.html",
        amc: "modules/service-modules/service-modules.html",
        warranty: "modules/service-modules/service-modules.html",
        reports: "modules/service-modules/service-modules.html",
        ticket: "modules/ticket-raise/ticket-raise.html"
    };

    function readArray(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) && value.length ? value : fallback.slice();
        } catch (error) {
            return fallback.slice();
        }
    }

    function saveArray(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            /* Storage may be disabled; dashboard still works. */
        }
    }

    function reorderGrid(grid, order, attribute) {
        if (!grid) return;

        const items = Array.from(grid.children);
        const map = new Map(
            items.map(function (item) {
                return [item.dataset[attribute], item];
            })
        );

        order.forEach(function (id) {
            const item = map.get(id);
            if (item) grid.appendChild(item);
        });
    }

    function setupDragDrop(grid, attribute, storageKey) {
        if (!grid) return;

        let dragged = null;

        Array.from(grid.children).forEach(function (item) {
            item.draggable = true;

            item.addEventListener("dragstart", function () {
                dragged = item;
                item.classList.add("dragging");
            });

            item.addEventListener("dragend", function () {
                item.classList.remove("dragging");
                dragged = null;

                const order = Array.from(grid.children)
                    .map(function (node) {
                        return node.dataset[attribute];
                    })
                    .filter(Boolean);

                saveArray(storageKey, order);
            });

            item.addEventListener("dragover", function (event) {
                event.preventDefault();

                if (!dragged || dragged === item) return;

                const rect = item.getBoundingClientRect();
                const before =
                    event.clientX < rect.left + rect.width / 2;

                grid.insertBefore(
                    dragged,
                    before ? item : item.nextSibling
                );
            });
        });
    }

    function applySavedLayouts() {
        const overview = document.getElementById("overviewGrid");
        const actions = document.getElementById("quickActionsGrid");

        reorderGrid(
            overview,
            readArray(STORAGE_KEYS.overview, DEFAULT_OVERVIEW),
            "card"
        );

        reorderGrid(
            actions,
            readArray(STORAGE_KEYS.actions, DEFAULT_ACTIONS),
            "action"
        );
    }

    function resetLayout() {
        localStorage.removeItem(STORAGE_KEYS.overview);
        localStorage.removeItem(STORAGE_KEYS.actions);

        location.reload();
    }

    function getArray(keys) {
        for (const key of keys) {
            try {
                const value = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(value)) return value;
            } catch (error) {}
        }
        return [];
    }

    function countArray(keys) {
        return getArray(keys).length;
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    }

    function updateCounts() {
        const activeCompanyId =
    localStorage.getItem("SUVI_COMPANY_ID");


        /*
         * These are intentionally defensive.
         * If another module already maintains different storage keys,
         * its data remains untouched.
         */

const allClients = getArray([
    "suviInfotechClients"
]);

const clients = allClients.filter(function (client) {
    return client.companyId === activeCompanyId;
});

        const calls = countArray([
            "calls",
            "serviceCalls",
            "callRegisterData"
        ]);

        const visits = countArray([
            "fieldVisits",
            "visits",
            "fieldVisitData"
        ]);

        const inventory = getArray([
            "inventory",
            "suvi_inventory",
            "inventoryData"
        ]);

        const invoices = countArray([
            "invoices",
            "billing",
            "invoiceData"
        ]);

      setText("totalClients", clients.length);
       /* QUOTATIONS */

const quotations =
    JSON.parse(
        localStorage.getItem("suviInfotechQuotations") || "[]"
    );

setText(
    "totalQuotations",
    quotations.length
);
       /* OPEN CALLS */

const clientData =
    clients;

let openCalls = 0;

clientData.forEach(function (client) {
    if (Array.isArray(client.serviceHistory)) {

        openCalls += client.serviceHistory.filter(function (service) {

            return String(
                service.status || ""
            ).toLowerCase() === "open";

        }).length;
    }
});

setText(
    "openCalls",
    openCalls
);
        const ticketData = JSON.parse(
    localStorage.getItem("suvi_ticket_data") || "[]"
);

const ticketCount = Array.isArray(ticketData)
    ? ticketData.length
    : 0;

const ticketElement = document.getElementById("openTickets");

if (ticketElement) {
    ticketElement.textContent = ticketCount;
}
        setText("openCalls", openCalls);
        setText("todayVisits", visits);
        setText("pendingPayments", invoices);

        if (inventory.length) {
            const lowStock = inventory.filter(function (item) {
                const quantity = Number(
                    item.quantity ??
                    item.stock ??
                    item.qty ??
                    0
                );

                const minimum = Number(
                    item.minimumStock ??
                    item.minStock ??
                    item.reorderLevel ??
                    0
                );

                return quantity <= minimum;
            }).length;

            setText("lowStock", lowStock);
        } else {
            setText("lowStock", 0);
        }

        /* These modules are not assigned a storage schema here.
           Keep their dashboard values safe at zero until the
           corresponding module supplies its own data. */
        const serviceClients = getArray([
    "clients",
    "suvi_clients",
    "clientMasterData"
]);

let pendingServices = 0;

serviceClients.forEach(function (client) {
    if (!Array.isArray(client.serviceHistory)) return;

    pendingServices += client.serviceHistory.filter(function (service) {
        const status = String(service.status || "")
            .trim()
            .toLowerCase();

        return (
            status === "process" ||
            status === "pending" ||
            status === "hold"
        );
    }).length;
});

setText("pendingServices", pendingServices);

setText("activeAmc", 0);
setText("warrantyExpiring", 0);
    }

    function navigateTo(path) {
        if (typeof window.openPage === "function") {
            window.openPage(path);
            return;
        }

        if (typeof window.loadPage === "function") {
            window.loadPage(path);
            return;
        }

        window.location.href = path;
    }

    function setupQuickActions() {
        document.querySelectorAll(".quick-action").forEach(function (button) {
            button.addEventListener("click", function () {
                const action = this.dataset.action;
                const path = MODULES[action];

                if (path) navigateTo(path);
            });
        });
    }

    function setupToolbar() {
        const reset = document.getElementById("btnResetLayout");
        const refresh = document.getElementById("btnRefresh");

        if (reset) {
            reset.addEventListener("click", resetLayout);
        }

        if (refresh) {
            refresh.addEventListener("click", function () {
                updateCounts();
                location.reload();
            });
        }
    }

    function toggleServiceMenu() {
        const submenu = document.getElementById("serviceSubMenu");
        const parent = document.querySelector(".service-menu");

        if (!submenu || !parent) return;

        submenu.classList.toggle("show");
        parent.classList.toggle("open");
    }

    window.toggleServiceMenu = toggleServiceMenu;

    function init() {
        applySavedLayouts();

        setupDragDrop(
            document.getElementById("overviewGrid"),
            "card",
            STORAGE_KEYS.overview
        );

        setupDragDrop(
            document.getElementById("quickActionsGrid"),
            "action",
            STORAGE_KEYS.actions
        );

        setupQuickActions();
        setupToolbar();
        updateCounts();
    }
window.addEventListener("suviDataChanged", function () {
    updateCounts();
});
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
/* =========================================================
   WELCOME BACK AUTO HIDE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const welcomeBack =
            document.getElementById(
                "welcomeBackCard"
            );

        if (!welcomeBack) {
            return;
        }

        /* Click to hide */

        welcomeBack.addEventListener(
            "click",
            function () {

                welcomeBack.style.display =
                    "none";
            }
        );

        /* Auto hide after 5 seconds */

        setTimeout(
            function () {

                welcomeBack.style.display =
                    "none";

            },
            5000
        );
    }
);
// GLOBAL SEARCH
const globalSearch = document.getElementById("globalSearch");
const globalSearchResults = document.getElementById("globalSearchResults");

if (globalSearch && globalSearchResults) {

    globalSearch.addEventListener("input", function () {

        const searchText = this.value.trim().toLowerCase();

        globalSearchResults.innerHTML = "";

        if (!searchText) {
            globalSearchResults.style.display = "none";
            return;
        }

        const dataSources = [
            "suviInfotechClients",
            "suvi_ticket_data",
            "suviInfotechQuotations",
            "suviInfotechCallRegister"
        ];

        let found = [];

        dataSources.forEach(function (key) {

            const data = JSON.parse(
                localStorage.getItem(key) || "[]"
            );

            if (Array.isArray(data)) {

                data.forEach(function (item) {

                    const text = JSON.stringify(item).toLowerCase();

                    if (text.includes(searchText)) {
                        found.push(item);
                    }

                });

            }
        });

        if (found.length === 0) {

            globalSearchResults.innerHTML =
                "<div class='search-no-result'>No results found</div>";

        } else {

            found.slice(0, 10).forEach(function (item) {

    const result = document.createElement("div");

    result.className = "search-result-item";
            result.addEventListener("click", function () {

            // Client Master record
            if (
                item.clientId ||
                item.companyName ||
                item.contactPerson ||
                item.mobileNumber
            ) {
                localStorage.setItem(
                    "selectedClientForView",
                    JSON.stringify(item)
                );

                window.location.href =
                    "modules/client-master/client-master.html";
                return;
            }

            // Other records
            if (item.callId) {
                window.location.href =
                    "modules/call-register/call-register-list.html";
                return;
            }

        });

    const name =
    item.clientName ||
    item.companyName ||
    item.contactPerson ||
    item.callerName ||
    item.customerName ||
    item.name ||
    "Unknown";

const mobile =
    item.mobile ||
    item.mobileNumber ||
    item.phone ||
    item.contactNumber ||
    item.whatsappNumber ||
    "-";

    result.innerHTML = `
        <strong>${name}</strong>
        <span>${mobile}</span>
    `;

    globalSearchResults.appendChild(result);

});
        }

        globalSearchResults.style.display = "block";

    });
}
document.addEventListener("DOMContentLoaded", async function () {

    const countElement =
        document.getElementById("dashboardCallRegisterCount");

    if (!countElement) return;

    try {

        if (window.firebaseDbReady) {
            await window.firebaseDbReady;
        }

        if (!window.firebaseDb) {
            console.warn("Firebase database not available.");
            return;
        }

        const { collection, getDocs } =
            await import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
            );

        const snapshot = await getDocs(
    collection(window.firebaseDb, "callRegister")
);

const companyId =
    localStorage.getItem("SUVI_COMPANY_ID");

    const clients =
    JSON.parse(
        localStorage.getItem("suviInfotechClients") || "[]"
    );

const activeCompanyId =
    localStorage.getItem("SUVI_COMPANY_ID");

let callHistoryCount = 0;

clients.forEach(function (client) {

    if (
        client.companyId !== activeCompanyId
    ) {
        return;
    }

    if (
        Array.isArray(
            client.serviceHistory
        )
    ) {
        callHistoryCount +=
            client.serviceHistory.length;
    }

});

countElement.textContent =
    callHistoryCount;

        console.log(
            "Dashboard Call Register Count:",
            snapshot.size
        );

    } catch (error) {

        console.error(
            "Dashboard Call Register Sync Error:",
            error
        );

    }

});
document.addEventListener("DOMContentLoaded", function () {

    const greeting =
        document.getElementById("welcomeGreeting");

    if (!greeting) return;

    const companyId =
        localStorage.getItem("SUVI_COMPANY_ID");

    let companyName = "SUVI INFOTECH";

    if (companyId === "ECO001") {
        companyName = "ECO PRINT";
    } else if (companyId === "SUVI001") {
        companyName = "SUVI INFOTECH";
    }

    const hour = new Date().getHours();

    if (hour < 12) {
        greeting.textContent =
            "Good Morning, " + companyName + " 👋";

    } else if (hour < 17) {
        greeting.textContent =
            "Good Afternoon, " + companyName + " 👋";

    } else if (hour < 21) {
        greeting.textContent =
            "Good Evening, " + companyName + " 👋";

    } else {
        greeting.textContent =
            "Good Night, " + companyName + " 👋";
    }

});
document.addEventListener("DOMContentLoaded", function () {

    const companyNameEl =
        document.getElementById("dashboardCompanyName");

    if (!companyNameEl) return;

    const companyId =
        localStorage.getItem("SUVI_COMPANY_ID");

    if (companyId === "ECO001") {
        companyNameEl.textContent = "ECO PRINT";

    } else if (companyId === "SUVI001") {
        companyNameEl.textContent = "SUVI INFOTECH";

    } else {
        companyNameEl.textContent = "SUVI INFOTECH";
    }

});document.addEventListener("DOMContentLoaded", function () {

    const companyNameEl =
        document.getElementById("dashboardCompanyName");

    if (!companyNameEl) return;

    const companyId =
        localStorage.getItem("SUVI_COMPANY_ID");

    if (companyId === "ECO001") {
        companyNameEl.textContent = "ECO PRINT";

    } else if (companyId === "SUVI001") {
        companyNameEl.textContent = "SUVI INFOTECH";

    } else {
        companyNameEl.textContent = "SUVI INFOTECH";
    }

});
document.addEventListener("DOMContentLoaded", function () {

    const menuCompanyName =
        document.getElementById("menuCompanyName");

    if (!menuCompanyName) return;

    const companyId =
        localStorage.getItem("SUVI_COMPANY_ID");

    if (companyId === "ECO001") {

        menuCompanyName.textContent = "ECO PRINT";

    } else if (companyId === "SUVI001") {

        menuCompanyName.textContent = "SUVI INFOTECH";

    } else {

        menuCompanyName.textContent = "SUVI INFOTECH";
    }

});
document.addEventListener("DOMContentLoaded", function () {

    const logo =
        document.getElementById("companyLogo");

    if (!logo) return;

    const companyId =
        localStorage.getItem("SUVI_COMPANY_ID");

    if (companyId === "ECO001") {

        logo.src = "assets/eco_logo.png";
        logo.alt = "ECO PRINT Logo";

    } else {

        logo.src = "assets/suvi_logo.png";
        logo.alt = "SUVI INFOTECH Logo";
    }

});
/* =========================================================
   ACTIVE FIRM → DASHBOARD BANNER
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const companyId =
        localStorage.getItem("SUVI_COMPANY_ID");

    if (!companyId) return;

    let firm = null;

    /*
       Find the firm record using Company ID.
       This avoids depending on a fixed LocalStorage key.
    */
    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);

        try {

            const data =
                JSON.parse(localStorage.getItem(key));

            if (!Array.isArray(data)) continue;

            const found =
                data.find(function (item) {

                    return (
                        item &&
                        item.companyId === companyId &&
                        item.firmName
                    );

                });

            if (found) {
                firm = found;
                break;
            }

        } catch (error) {
            // Ignore non-JSON LocalStorage values
        }
    }

    if (!firm) {
        console.warn(
            "Firm details not found for:",
            companyId
        );
        return;
    }

    const setFirmText = function (id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                value || "-";
        }
    };

    setFirmText(
        "dashboardFirmContact",
        firm.contactPerson
    );

    setFirmText(
        "dashboardFirmMobile",
        firm.mobile
    );

    setFirmText(
        "dashboardFirmLandline",
        firm.landline
    );

    setFirmText(
        "dashboardFirmEmail",
        firm.email
    );

    setFirmText(
        "dashboardFirmAddress",
        [
            firm.address,
            firm.city,
            firm.state,
            firm.pincode
        ]
        .filter(Boolean)
        .join(", ")
    );

});