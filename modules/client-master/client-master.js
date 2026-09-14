/* =========================================================
   SUVI INFOTECH
   CLIENT MASTER - FINAL MATCHED VERSION
   ========================================================= */

function initClientMaster() {
    /* =====================================================
       ELEMENTS
       ===================================================== */

    const clientForm =
        document.getElementById("clientForm");

    const clearClientButton =
        document.getElementById("clearClientButton");

    const saveClientButton =
        document.getElementById("saveClientButton");

    const backToDashboard =
        document.getElementById("backToDashboard");
    /* =====================================================
   DYNAMIC FIRM NAME
   ===================================================== */

const clientMasterFirmName =
    document.getElementById("clientMasterFirmName");

if (clientMasterFirmName) {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (selectedFirm) {
        clientMasterFirmName.textContent =
            selectedFirm.trim();
    }
}
    const clientDetailsTab =
        document.getElementById("clientDetailsTab");

    const serviceHistoryTab =
        document.getElementById("serviceHistoryTab");

    const clientDetailsSection =
        document.getElementById("clientDetailsSection");

    const serviceHistorySection =
        document.getElementById("serviceHistorySection");

/* =====================================================
   BACK TO DASHBOARD
   ===================================================== */

if (backToDashboard) {
    backToDashboard.addEventListener("click", function () {
       window.location.href = "../../dashboard.html";
    });
}
    /* =====================================================
       FORM FIELDS
       ===================================================== */

    const clientDate =
        document.getElementById("clientDate");

    const clientId =
        document.getElementById("clientId");

    const contactPerson =
        document.getElementById("contactPerson");

    const mobileNumber =
        document.getElementById("mobileNumber");

    const emailId =
        document.getElementById("emailId");

    const gstNumber =
        document.getElementById("gstNumber");

    const departmentName =
        document.getElementById("departmentName");

    const state =
        document.getElementById("state");

    const pincode =
        document.getElementById("pincode");

    const address =
        document.getElementById("address");

    const notes =
        document.getElementById("notes");


    /* =====================================================
       SEARCH / TABLE
       ===================================================== */

    const clientSearch =
        document.getElementById("clientSearch");

    const clientList =
        document.getElementById("client-table");

    const clientTotalCount =
        document.getElementById("clientTotalCount");


    const serviceHistorySearch =
        document.getElementById(
            "serviceHistorySearch"
        );

    const serviceHistoryList =
        document.getElementById(
            "serviceHistoryList"
        );

    const serviceHistoryCount =
        document.getElementById(
            "serviceHistoryCount"
        );

    const clientFormMode =
        document.getElementById(
            "clientFormMode"
        );

    
    /* =====================================================
       SAFETY CHECK

       IMPORTANT:
       No companyName
       No whatsappNumber
       No city
       ===================================================== */

    const requiredElements = [

        clientForm,
        clearClientButton,
        saveClientButton,

        clientDetailsTab,
        serviceHistoryTab,

        clientDetailsSection,
        serviceHistorySection,

        clientDate,
        clientId,
        contactPerson,
        mobileNumber,
        emailId,
        gstNumber,
        departmentName,
        state,
        pincode,
        address,
        notes,

        clientSearch,
        clientList,
        clientTotalCount,

        serviceHistorySearch,
        serviceHistoryList,
        serviceHistoryCount,

        clientFormMode

    ];


    if (
        requiredElements.some(
            function (element) {
                return !element;
            }
        )
    ) {

        console.error(
            "Client Master HTML element missing."
        );

        alert(
            "Client Master page error: required HTML element missing."
        );

        return;
    }


    /* =====================================================
       STORAGE
       ===================================================== */

    const STORAGE_KEY =
        "suviInfotechClients";


    let clients = [];

    let editClientId = null;


    /* =====================================================
       DATE
       Example: 11-Aug-2026
       ===================================================== */

    function getFormattedDate() {

        const months = [

            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"

        ];


        const today =
            new Date();


        return (

            today.getDate() +
            "-" +
            months[
                today.getMonth()
            ] +
            "-" +
            today.getFullYear()

        );
    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(
            value ?? ""
        )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       CAPITALIZE WORDS

       Space bar works normally.
       Caps applied on blur / Tab.
       ===================================================== */

    function capitalizeWords(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase()
            .replace(
                /\b[a-z]/g,
                function (letter) {

                    return letter.toUpperCase();
                }
            );
    }


    /* =====================================================
       LOAD CLIENTS
       ===================================================== */

    function loadClients() {

    try {

        const saved =
            localStorage.getItem(
                "suviInfotechClients"
            );

        console.log(
            "CLIENT STORAGE:",
            saved
        );

        if (!saved) {

            clients = [];

            return;
        }

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) {

            clients = [];

            return;
        }

        // CURRENT COMPANY
        const companyId =
            SuviCompany.getCompanyId();

        if (!companyId) {

            console.error(
                "Company ID not available."
            );

            clients = [];

            return;
        }

        // COMPANY-WISE CLIENT ISOLATION
        clients = parsed.filter(function (client) {

            return client.companyId === companyId;

        });

        console.log(
            "CURRENT COMPANY ID:",
            companyId
        );

        console.log(
            "COMPANY CLIENTS LOADED:",
            clients.length,
            clients
        );

    } catch (error) {

        console.error(
            "CLIENT LOAD ERROR:",
            error
        );

        clients = [];

    }

}
    /* =====================================================
       SAVE CLIENTS
       ===================================================== */

    async function saveClients() {

    try {
        const companyId = SuviCompany.getCompanyId();

if (!companyId) {
    console.error("Company ID not available.");
    alert("Company information not available. Please login again.");
    return false;
}
const allClients = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

const updatedClients = allClients.map(function (client) {
    return clients.find(
        c => c.clientId === client.clientId
    ) || client;
});

clients.forEach(function (client) {

    const index = updatedClients.findIndex(
        c => c.clientId === client.clientId
    );

    const clientWithCompany = {
        ...client,
        companyId: companyId
    };

    if (index >= 0) {
        updatedClients[index] = clientWithCompany;
    } else {
        updatedClients.push(clientWithCompany);
    }
});

clients = updatedClients;

        // Existing LocalStorage
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(clients)
        );

        // Firebase Sync
        for (const client of clients) {

            if (client.clientId) {

                await window.SuviFirebaseSync.save(
                    "clients",
                    client.clientId,
                    client
                );

            }
        }

        console.log("Client Master Firebase sync completed.");

        return true;

    } catch (error) {

        console.error(
            "Client save/sync error:",
            error
        );

        alert(
            "Client data could not be synced."
        );

        return false;
    }
}


    /* =====================================================
       NEXT CLIENT ID

       CLI001
       CLI002
       ===================================================== */

    function generateClientId() {

        let highest =
            0;


        clients.forEach(
            function (client) {

                const match =
                    String(
                        client.clientId || ""
                    ).match(
                        /^CLI(\d+)$/i
                    );


                if (match) {

                    const number =
                        parseInt(
                            match[1],
                            10
                        );


                    if (
                        number >
                        highest
                    ) {

                        highest =
                            number;
                    }
                }

            }
        );


        return (

            "CLI" +
            String(
                highest + 1
            ).padStart(
                3,
                "0"
            )

        );
    }


    /* =====================================================
       PREPARE NEW CLIENT
       ===================================================== */

    function prepareNewClient() {

        editClientId =
            null;


        clientDate.value =
            getFormattedDate();


        clientId.value =
            generateClientId();


        clientFormMode.textContent =
            "New Client";


        clearClientButton.textContent =
            "Clear";


        saveClientButton.innerHTML =
            "💾 Save Client";

       const editFormCard =
    document.querySelector(".client-form-card");

if (editFormCard) {
    editFormCard.classList.remove("edit-mode");
}     
    }


    /* =====================================================
       CAPITALIZATION EVENTS

       IMPORTANT:
       input does NOT change text.
       Therefore SPACE BAR works.
       ===================================================== */

    function addCapitalization(
        element
    ) {

        if (!element) {
            return;
        }


        element.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Tab"
                ) {

                    this.value =
                        capitalizeWords(
                            this.value
                        );
                }

            }
        );


        element.addEventListener(
            "blur",
            function () {

                this.value =
                    capitalizeWords(
                        this.value
                    );

            }
        );
    }


    addCapitalization(
        contactPerson
    );

    addCapitalization(
        departmentName
    );

    addCapitalization(
        address
    );


    /* =====================================================
       MOBILE - 10 DIGITS
       ===================================================== */

    mobileNumber.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        10
                    );

        }
    );


    /* =====================================================
       PINCODE - 6 DIGITS
       ===================================================== */

    pincode.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        6
                    );

        }
    );


    /* =====================================================
       GST UPPERCASE
       ===================================================== */

    gstNumber.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .toUpperCase()
                    .replace(
                        /\s/g,
                        ""
                    )
                    .slice(
                        0,
                        15
                    );

        }
    );


    /* =====================================================
       CLIENT DETAILS TABLE
       ===================================================== */

    function renderClients(
        searchText = ""
    ) {

        const search =
            String(
                searchText
            )
                .trim()
                .toLowerCase();


        const filtered =
            clients.filter(
                function (client) {

                    const text = (

    String(client.clientId || "") +
    " " +
    String(client.contactPerson || "") +
    " " +
    String(client.mobileNumber || "") +
    " " +
    String(client.emailId || "") +
    " " +
    String(client.gstNumber || "") +
    " " +
    String(client.departmentName || "") +
    " " +
    String(client.state || "") +
    " " +
    String(client.pincode || "") +
    " " +
    String(client.address || "")

).toLowerCase();


                    return text.includes(
                        search
                    );

                }
            );


        clientTotalCount.textContent =

            filtered.length +
            (
                filtered.length === 1
                    ? " Client"
                    : " Clients"
            );


        if (
            filtered.length === 0
        ) {

            clientList.innerHTML = `

                <tr class="empty-client-row">

                    <td
                        colspan="11"
                        style="
                            text-align:center;
                            padding:35px;
                        ">

                        No client records found.

                    </td>

                </tr>

            `;

            return;
        }


        clientList.innerHTML =
    filtered.map(
        function (client) {

            return `

                <div class="client-card">

                    <!-- TOP -->
                    <div class="client-card-top">

                        <div class="client-profile">

                            <div class="client-avatar">
                                👤
                            </div>

                            <div>

                                <h3 class="client-name">
                                    ${escapeHtml(
                                        client.contactPerson || "-"
                                    )}
                                </h3>

                                <div class="client-type">
                                    Client
                                </div>

                            </div>

                        </div>


                        <div class="client-id-badge">
    ${escapeHtml(
        String(client.clientId || "-").toUpperCase()
    )}
</div>
                    </div>
<!-- SERVICE COUNT -->
<div class="client-service-count">

    <div class="service-count-box">
        <span class="service-count-number">
            ${
                Array.isArray(client.serviceHistory)
                    ? client.serviceHistory.filter(
                        service => service.callId
                    ).length
                    : 0
            }
        </span>

        <span class="service-count-label">
            Total Calls
        </span>
    </div>

    <div class="service-count-box">
        <span class="service-count-number">
            ${
                Array.isArray(client.serviceHistory)
                    ? client.serviceHistory.filter(
                        service => !service.callId
                    ).length
                    : 0
            }
        </span>

        <span class="service-count-label">
            Total Services
        </span>
    </div>

</div>

                    <!-- INFORMATION -->
                    <div class="client-info-grid">


                        <!-- DATE -->
                        <div class="client-info-item">

                            <span class="client-info-label">
                                Date
                            </span>

                            <span class="client-info-value">

                                ${escapeHtml(
                                    client.date || "-"
                                )}

                            </span>

                        </div>


                        <!-- MOBILE -->
                        <div class="client-info-item">

                            <span class="client-info-label">
                                Mobile Number
                            </span>

                            <span class="client-info-value">

                                ${escapeHtml(
                                    client.mobileNumber || "-"
                                )}

                            </span>

                        </div>


                        <!-- EMAIL -->
                        <div class="client-info-item">

                            <span class="client-info-label">
                                Email ID
                            </span>

                            <span class="client-info-value">

                                ${escapeHtml(
                                    client.emailId || "-"
                                )}

                            </span>

                        </div>


                        <!-- GST -->
                        <div class="client-info-item">

                            <span class="client-info-label">
                                GST Number
                            </span>

                            <span class="client-info-value">

                                ${escapeHtml(
                                    client.gstNumber || "-"
                                )}

                            </span>

                        </div>


                        <!-- DEPARTMENT -->
                        <div class="client-info-item">

                            <span class="client-info-label">
                                Department
                            </span>

                            <span class="client-info-value">

                                ${escapeHtml(
                                    client.departmentName || "-"
                                )}

                            </span>

                        </div>


                        <!-- STATE -->
                        <div class="client-info-item">

                            <span class="client-info-label">
                                State
                            </span>

                            <span class="client-info-value">

                                ${escapeHtml(
                                    client.state || "-"
                                )}

                            </span>

                        </div>


                        <!-- PINCODE -->
                        <div class="client-info-item">

                            <span class="client-info-label">
                                Pincode
                            </span>

                            <span class="client-info-value">

                                ${escapeHtml(
                                    client.pincode || "-"
                                )}

                            </span>

                        </div>

                    </div>


                    <!-- ADDRESS -->
                    <div class="client-address-box">

                        <div class="client-address-label">
                            Address
                        </div>

                        <div class="client-address-value">

                            ${escapeHtml(
                                client.address || "-"
                            )}

                        </div>

                    </div>


                    <!-- ACTIONS -->
                    <div class="client-card-actions">
<button
    type="button"
    class="client-action-btn edit-client-btn"
    data-id="${escapeHtml(client.clientId)}">
    ✏️ Edit
</button>

         

                        <button
                            type="button"
                            class="client-action-btn delete-client-btn"
                            data-id="${escapeHtml(
                                client.clientId
                            )}">

                            🗑️ Delete

                        </button>


                    </div>

                </div>

            `;

        }
    ).join("");
    }


    /* =====================================================
       EDIT CLIENT
       ===================================================== */

    function editClient(
        id
    ) {

        const client =
            clients.find(
                function (item) {

                    return (
                        item.clientId ===
                        id
                    );

                }
            );


        if (!client) {
            return;
        }

        

        editClientId =
            client.clientId;


        clientDate.value =
            client.date ||
            getFormattedDate();


        clientId.value =
            client.clientId;


        contactPerson.value =
            client.contactPerson ||
            "";


        mobileNumber.value =
            client.mobileNumber ||
            "";


        emailId.value =
    client.emailId === "-"
        ? ""
        : (client.emailId || "");

        gstNumber.value =
            client.gstNumber ||
            "";


        departmentName.value =
            client.departmentName ||
            "";


        state.value =
            client.state ||
            "";


        pincode.value =
            client.pincode ||
            "";


        address.value =
            client.address ||
            "";


        notes.value =
            client.notes ||
            "";


        clientFormMode.textContent =
            "Edit Client";


     saveClientButton.innerHTML =
    "💾 Update Client";

showClientDetails();

const editFormCard =
    document.querySelector(".client-form-card");

if (editFormCard) {
    editFormCard.classList.add("edit-mode");

    editFormCard.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}
    }
    window.editClient = editClient;

    /* =====================================================
       DELETE CLIENT
       ===================================================== */

    async function deleteClient(id) {

    const client =
        clients.find(
            function (item) {

                return (
                    item.clientId ===
                    id
                );

            }
        );


    if (!client) {
        return;
    }


    const confirmed =
        confirm(

            "Delete client " +
            client.clientId +
            "?\n\n" +
            "This client will be moved to Recycle Bin for 60 days."

        );


    if (!confirmed) {
        return;
    }


    try {

        /* 1. MOVE FULL CLIENT DATA TO RECYCLE BIN FIRST */

        const recycleId =
            "client_" +
            client.clientId +
            "_" +
            Date.now();


        await window.SuviFirebaseSync.save(

            "recycleBin",

            recycleId,

            {
                ...client,

                deletedFrom:
                    "Client Master",

                module:
                    "Client Master",

                recordId:
                    client.clientId,

                deletedAt:
                    new Date().toISOString()
            }

        );


        /* 2. REMOVE CLIENT FROM ACTIVE LOCAL DATA */

        clients =
            clients.filter(
                function (item) {

                    return (
                        item.clientId !==
                        id
                    );

                }
            );


        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(clients)

        );


        /* 3. DELETE ACTIVE CLIENT FROM FIREBASE */

        await window.SuviFirebaseSync.delete(

            "clients",

            id

        );


        console.log(
            "Client moved to Recycle Bin:",
            id
        );


        /* 4. REFRESH CLIENT LIST */

        renderClients(
            clientSearch.value
        );


        renderServiceHistory(
            serviceHistorySearch.value
        );


        prepareNewClient();


        /* 5. UPDATE DASHBOARD COUNT IMMEDIATELY */

        window.dispatchEvent(
            new Event("suviDataChanged")
        );


        if (
            typeof window.updateDashboardCounts ===
            "function"
        ) {

            window.updateDashboardCounts();

        }


        alert(
            "Client moved to Recycle Bin successfully."
        );


    } catch (error) {

        console.error(
            "Client Recycle Bin Error:",
            error
        );


        alert(
            "Client could not be moved to Recycle Bin.\n\n" +
            error.message
        );

    }

}
/* =====================================================
   CLIENT DETAILS TAB
   ===================================================== */

function showClientDetails() {

    clientDetailsTab.classList.add("active");

    serviceHistoryTab.classList.remove("active");

    clientDetailsSection.classList.add(
        "active-section"
    );

    serviceHistorySection.classList.remove(
        "active-section"
    );
}


/* =====================================================
   SERVICE HISTORY TAB
   ===================================================== */

function showServiceHistory() {

    serviceHistoryTab.classList.add("active");

    clientDetailsTab.classList.remove("active");

    serviceHistorySection.classList.add(
        "active-section"
    );

    clientDetailsSection.classList.remove(
        "active-section"
    );

    renderServiceHistory(
        serviceHistorySearch.value
    );
}


/* =====================================================
   SERVICE HISTORY RENDER
   ===================================================== */

function renderServiceHistory(
    searchText = ""
) {

    const history = [];

    clients.forEach(
        function (client) {

            const services =
                Array.isArray(
                    client.serviceHistory
                )
                    ? client.serviceHistory
                    : [];

            services.forEach(
                function (service) {

                    history.push({

                        ...service,

                        clientId:
                            client.clientId,

                        clientName:
                            client.contactPerson,

                        mobile:
                            client.mobileNumber,

                        departmentName:
                            client.departmentName || "",

                        state:
                            client.state || "",

                        pincode:
                            client.pincode || "",

                        address:
                            client.address || ""

                    });

                }
            );

        }
    );


    const search =
        String(
            searchText || ""
        )
            .trim()
            .toLowerCase();


    const filtered =
        history.filter(
            function (item) {

                if (!search) {
                    return true;
                }

                return (

                    String(
                        item.clientId || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        item.clientName || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        item.mobile || ""
                    )
                        .includes(search)

                    ||

                    String(
                        item.callId || ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        item.service ||
                        item.purpose ||
                        ""
                    )
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(
                        item.status || ""
                    )
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    serviceHistoryCount.textContent =
        filtered.length +
        (
            filtered.length === 1
                ? " Record"
                : " Records"
        );


    if (
        filtered.length === 0
    ) {

        serviceHistoryList.innerHTML = `

            <div class="empty-service-history">

                <div class="empty-icon">
                    🛠️
                </div>

                <h3>
                    No Service History
                </h3>

                <p>
                    ${
                        search
                            ? "No service history matches your search."
                            : "Service records will appear here after services are completed."
                    }
                </p>

            </div>

        `;

        return;
    }


    serviceHistoryList.innerHTML = `

        <div
            style="
                width:100%;
                overflow-x:auto;
            "
        >

            <table
                style="
                    width:100%;
                    border-collapse:collapse;
                    min-width:900px;
                "
            >

                <thead>

                    <tr>

                        <th>Date</th>

                        <th>Call ID</th>

                        <th>Client ID</th>

                        <th>Client Name</th>

                        <th>Mobile</th>

                        <th>Service</th>

                        <th>Department</th>

                        <th>State</th>

                        <th>Pincode</th>

                        <th>Address</th>

                        <th>Status</th>

                        <th>Reason</th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        filtered.map(
                            function (item) {

                                return `

                                    <tr>

                                        <td>
                                            ${escapeHtml(
                                                item.date || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.callId || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.clientId || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.clientName || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.mobile || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.service ||
                                                item.purpose ||
                                                "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.departmentName || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.state || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.pincode || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.address || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.status || "-"
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHtml(
                                                item.reason ||
                                                item.holdReason ||
                                                item.pendingReason ||
                                                item.cancelReason ||
                                                "-"
                                            )}
                                        </td>

                                    </tr>

                                `;

                            }
                        ).join("")
                    }

                </tbody>

            </table>

        </div>

    `;
}
/* =====================================================
   CLIENT TABLE BUTTONS
   ===================================================== */

clientList.addEventListener("click", function (event) {

    const editButton = event.target.closest(".edit-client-btn");

    if (editButton) {

        const id = editButton.dataset.id;

        console.log("EDIT CLICK:", id);

        if (!id) {
            console.error("Edit Client ID missing");
            return;
        }

        editClient(id);
        return;
    }


    const deleteButton =
        event.target.closest(".delete-client-btn");

    if (deleteButton) {

        const id = deleteButton.dataset.id;

        if (!id) {
            console.error("Delete Client ID missing");
            return;
        }

        deleteClient(id);
    }

});
   
/* =====================================================
   TAB BUTTON EVENTS
   ===================================================== */

clientDetailsTab.addEventListener(
    "click",
    showClientDetails
);

serviceHistoryTab.addEventListener(
    "click",
    showServiceHistory
);
    /* =====================================================
       SAVE / UPDATE CLIENT
       ===================================================== */

    clientForm.addEventListener(
        "submit",
        async function (event) {
            if (isCallSaving) {
            return;
        }

        isCallSaving = true;

            event.preventDefault();


            /* FINAL CAPITALIZATION */

            contactPerson.value =
                capitalizeWords(
                    contactPerson.value
                );


            departmentName.value =
                capitalizeWords(
                    departmentName.value
                );


            address.value =
                capitalizeWords(
                    address.value
                );


            const data = {

                date:
                    clientDate.value.trim(),

                clientId:
                    clientId.value.trim(),

                contactPerson:
                    contactPerson.value.trim(),

                mobileNumber:
                    mobileNumber.value.trim(),

                emailId:
                    emailId.value.trim(),

                gstNumber:
                    gstNumber.value
                        .trim()
                        .toUpperCase(),

                departmentName:
                    departmentName.value.trim(),

                state:
                    state.value,

                pincode:
                    pincode.value.trim(),

                address:
                    address.value.trim(),

                notes:
                    notes.value.trim(),

                updatedAt:
                    new Date().toISOString()

            };


            /* MOBILE */

            if (
                !/^[6-9]\d{9}$/.test(
                    data.mobileNumber
                )
            ) {

                alert(
                    "Mobile Number must be exactly 10 digits."
                );

                mobileNumber.focus();

                return;
            }


            /* PINCODE */

            if (
                data.pincode &&
                !/^\d{6}$/.test(
                    data.pincode
                )
            ) {

                alert(
                    "Pincode must be exactly 6 digits."
                );

                pincode.focus();

                return;
            }


            /* EMAIL */

            if (
                data.emailId &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    data.emailId
                )
            ) {

                alert(
                    "Please enter a valid Email ID."
                );

                emailId.focus();

                return;
            }


            /* =================================================
               UPDATE EXISTING
               ================================================= */

            if (
                editClientId
            ) {

                const index =
                    clients.findIndex(
                        function (client) {

                            return (
                                client.clientId ===
                                editClientId
                            );

                        }
                    );


                if (
                    index !== -1
                ) {

                    const oldHistory =
                        clients[index]
                            .serviceHistory || [];

                    const updatedHistory =
                        oldHistory.map(
                            function (service) {
                                return {
                                    ...service,
                                    clientName:
                                        data.contactPerson,
                                    mobile:
                                        data.mobileNumber,
                                    departmentName:
                                        data.departmentName,
                                    state:
                                        data.state,
                                    pincode:
                                        data.pincode,
                                    address:
                                        data.address
                                };
                            }
                        );

                    clients[index] = {

                        ...clients[index],

                        date:
                            data.date,

                        clientId:
                            data.clientId,

                        contactPerson:
                            data.contactPerson,

                        mobileNumber:
                            data.mobileNumber,

                        emailId:
                            data.emailId,

                        gstNumber:
                            data.gstNumber,

                        departmentName:
                            data.departmentName,

                        state:
                            data.state,

                        pincode:
                            data.pincode,

                        address:
                            data.address,

                        notes:
                            data.notes,

                        serviceHistory:
                            updatedHistory,

                        updatedAt:
                            data.updatedAt

                    };

                }

            }


            /* =================================================
               NEW CLIENT
               ================================================= */

            else {

                const newClient = {

                    date:
                        data.date,

                    clientId:
                        data.clientId ||
                        generateClientId(),
                        companyId:
                    SuviCompany.getCompanyId(),

                    contactPerson:
                        data.contactPerson,

                    mobileNumber:
                        data.mobileNumber,

                    emailId:
                        data.emailId,

                    gstNumber:
                        data.gstNumber,

                    departmentName:
                        data.departmentName,

                    state:
                        data.state,

                    pincode:
                        data.pincode,

                    address:
                        data.address,

                    notes:
                        data.notes,

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        data.updatedAt,

                    serviceHistory:
                        []

                };


                clients.push(
                    newClient
                );

            }


            /* =================================================
               SAVE LOCAL + FIREBASE
               ================================================= */

            const saved =
                await saveClients();

            if (!saved) {
                return;
            }

            alert(
                editClientId
                    ? "Client updated successfully."
                    : "Client saved successfully."
            );


            clientForm.reset();

loadClients();

prepareNewClient();

renderClients();

renderServiceHistory();

setTimeout(
    function () {

        loadClients();

        renderClients();

        renderServiceHistory();

      

    },
    100
);
        
        }
    );
    loadClients();
renderClients();
renderServiceHistory();
}


/* =========================================================
   SAFE INITIALIZATION
   ========================================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initClientMaster
    );

} else {

    initClientMaster();

}