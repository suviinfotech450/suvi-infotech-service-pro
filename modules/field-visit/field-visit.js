/* =========================================================
   SUVI INFOTECH SERVICE PRO
   FIELD VISIT - field-visit.js

   Works with the exact field-visit.html structure.
   HTML/CSS are not changed.
   ========================================================= */

(function () {

    "use strict";

    /* =====================================================
       STORAGE
       ===================================================== */

    const VISIT_STORAGE_KEY =
        "suviInfotechFieldVisitRecords";

    const CLIENT_STORAGE_KEYS = [
        "suviClientMaster",
        "suviInfotechClientMaster",
        "clientMasterRecords",
        "clients",
        "clientsData"
    ];


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const form =
        document.getElementById("fieldVisitForm");

    const visitDate =
        document.getElementById("visitDate");

    const visitId =
        document.getElementById("visitId");

    const clientId =
        document.getElementById("clientId");

    const clientName =
        document.getElementById("clientName");

    const contactPerson =
        document.getElementById("contactPerson");

    const departmentName =
        document.getElementById("departmentName");

    const mobileNumber =
        document.getElementById("mobileNumber");

    const servicePurpose =
        document.getElementById("servicePurpose");

    const technicianName =
        document.getElementById("technicianName");

    const visitType =
        document.getElementById("visitType");

    const visitStatus =
        document.getElementById("visitStatus");

    const problem =
        document.getElementById("problem");

    const workDone =
        document.getElementById("workDone");

    const spareParts =
        document.getElementById("spareParts");

    const remarks =
        document.getElementById("remarks");

    const nextVisitDate =
        document.getElementById("nextVisitDate");

    const historyBody =
        document.getElementById("visitHistoryBody");

    const historyCount =
        document.getElementById("visitCount");


    if (!form) {
        console.error(
            "Field Visit: fieldVisitForm not found."
        );
        return;
    }


    /* =====================================================
       DATE
       ===================================================== */

    function getTodayText() {

        const d = new Date();

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

        return (
            d.getDate() +
            "-" +
            months[d.getMonth()] +
            "-" +
            d.getFullYear()
        );

    }


    function setVisitDate() {

        if (visitDate) {
            visitDate.value =
                getTodayText();
        }

    }


    /* =====================================================
       VISIT ID
       ===================================================== */

    function getVisitRecords() {

        try {

            const saved =
                localStorage.getItem(
                    VISIT_STORAGE_KEY
                );

            if (!saved) {
                return [];
            }

            const parsed =
                JSON.parse(saved);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                "Field Visit records read error:",
                error
            );

            return [];

        }

    }


    function createVisitId() {

        const records =
            getVisitRecords();

        let highest = 0;

        records.forEach(function (record) {

            const value =
                String(
                    record.visitId || ""
                );

            const match =
                value.match(
                    /^FV(\d+)$/i
                );

            if (match) {

                const number =
                    parseInt(
                        match[1],
                        10
                    );

                if (number > highest) {
                    highest = number;
                }

            }

        });

        return (
            "FV" +
            String(
                highest + 1
            ).padStart(3, "0")
        );

    }


    function setVisitId() {

        if (visitId) {
            visitId.value =
                createVisitId();
        }

    }


    /* =====================================================
       CLIENT DATA
       ===================================================== */

    function readArrayFromStorage(key) {

        try {

            const raw =
                localStorage.getItem(key);

            if (!raw) {
                return [];
            }

            const parsed =
                JSON.parse(raw);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            /* Some projects store records inside an object. */

            if (
                parsed &&
                Array.isArray(parsed.clients)
            ) {
                return parsed.clients;
            }

            if (
                parsed &&
                Array.isArray(parsed.records)
            ) {
                return parsed.records;
            }

            if (
                parsed &&
                Array.isArray(parsed.data)
            ) {
                return parsed.data;
            }

            return [];

        } catch (error) {

            return [];

        }

    }


    function getClients() {

        for (
            let i = 0;
            i < CLIENT_STORAGE_KEYS.length;
            i++
        ) {

            const clients =
                readArrayFromStorage(
                    CLIENT_STORAGE_KEYS[i]
                );

            if (clients.length) {
                return clients;
            }

        }

        return [];

    }
async function syncClientsFromFirebase() {

    try {

        const firebaseClients =
            await window.SuviFirebaseSync.getAll("clients");

        if (!Array.isArray(firebaseClients) ||
            firebaseClients.length === 0) {

            console.warn(
                "Field Visit: No clients found in Firebase."
            );

            return;
        }

        // Existing local clients
        const localClients = getClients();

        // Merge by Client ID
        const merged = [...localClients];

        firebaseClients.forEach(function (firebaseClient) {

            const firebaseId =
                getClientId(firebaseClient).toLowerCase();

            if (!firebaseId) {
                return;
            }

            const existingIndex =
                merged.findIndex(function (localClient) {

                    return getClientId(localClient)
                        .toLowerCase() === firebaseId;

                });

            if (existingIndex >= 0) {

                merged[existingIndex] =
                    firebaseClient;

            } else {

                merged.push(firebaseClient);

            }

        });

        // Save synced clients locally
        localStorage.setItem(
            "clients",
            JSON.stringify(merged)
        );

        // Refresh dropdown
        loadClientDropdown();

        console.log(
            "Field Visit: Client Master synced from Firebase.",
            merged.length
        );

    } catch (error) {

        console.error(
            "Field Visit Client Firebase sync error:",
            error
        );

    }
}

    function getClientId(client) {

        return String(
            client.clientId ??
            client.clientID ??
            client.id ??
            client.client_id ??
            ""
        ).trim();

    }


    function getClientName(client) {

        return String(
            client.companyName ??
            client.company ??
            client.clientName ??
            client.name ??
            ""
        ).trim();

    }


    function getContactPerson(client) {

        return String(
            client.contactPerson ??
            client.contactName ??
            client.contact ??
            ""
        ).trim();

    }


    function getDepartmentName(client) {

        return String(
            client.departmentName ??
            client.department ??
            client.deptName ??
            ""
        ).trim();

    }


    function getMobile(client) {

        return String(
            client.mobileNumber ??
            client.mobile ??
            client.phone ??
            client.contactNumber ??
            client.phoneNumber ??
            ""
        ).trim();

    }


    function getServicePurpose(client) {

        return String(
            client.servicePurpose ??
            client.service ??
            client.purpose ??
            client.serviceType ??
            ""
        ).trim();

    }


    /* =====================================================
       CLIENT DROPDOWN
       ===================================================== */

   async function loadClientDropdown() {

        if (!clientId) {
            return;
        }
        let clients =
    getClients();

try {

    const firebaseClients =
        await window.SuviFirebaseSync.getAll("clients");

    if (
        Array.isArray(firebaseClients) &&
        firebaseClients.length > 0
    ) {

        clients = firebaseClients;

        localStorage.setItem(
            "clients",
            JSON.stringify(clients)
        );

        console.log(
            "Field Visit: Firebase clients loaded:",
            clients.length
        );
    }

} catch (error) {

    console.warn(
        "Field Visit Firebase client load failed:",
        error
    );
}

const currentValue =
    clientId.value;

clientId.innerHTML =
    '<option value="">Select Client</option>';
        
        /* =====================================================
           MANUAL CLIENT ENTRY
           ===================================================== */

        const manualOption =
            document.createElement("option");

        manualOption.value =
            "MANUAL";

        manualOption.textContent =
            "Manual Client Entry";

        clientId.appendChild(
            manualOption
        );


        clients.forEach(function (client) {

            const id =
                getClientId(client);

            if (!id) {
                return;
            }

            const option =
                document.createElement("option");

            option.value =
                id;

            option.textContent =
                id +
                " - " +
                getClientName(client);

            clientId.appendChild(
                option
            );

        });


        if (currentValue) {
            clientId.value =
                currentValue;
        }


        if (
            clients.length === 0
        ) {

            console.warn(
                "Field Visit: No Client Master records found in localStorage."
            );

        }

    }


    /* =====================================================
       FILL CLIENT DETAILS
       ===================================================== */

    function setManualClientMode(isManual) {

        const fields = [
            clientName,
            contactPerson,
            departmentName,
            mobileNumber
        ];

        fields.forEach(function (field) {

            if (!field) {
                return;
            }

            field.readOnly = !isManual;

            field.placeholder =
                isManual
                    ? "Enter manually"
                    : "Auto-filled from Client Master";
        });

        if (mobileNumber) {
            mobileNumber.setAttribute("inputmode", "numeric");
            mobileNumber.setAttribute("maxlength", "10");
        }
    }


    function clearClientDetails() {

        setManualClientMode(false);

        if (clientName) {
            clientName.value = "";
        }

        if (contactPerson) {
            contactPerson.value = "";
        }

        if (departmentName) {
            departmentName.value = "";
        }

        if (mobileNumber) {
            mobileNumber.value = "";
        }

        if (servicePurpose) {
            servicePurpose.value = "";
        }

    }


    function fillClientDetails() {

        const selectedId =
            String(
                clientId?.value || ""
            ).trim()
            .toLowerCase();


        if (!selectedId) {

            clearClientDetails();

            return;

        }


                
        /* =====================================================
           MANUAL CLIENT ENTRY
           ===================================================== */

        if (selectedId === "manual") {

            setManualClientMode(true);

            if (clientName) clientName.value = "";
            if (contactPerson) contactPerson.value = "";
            if (departmentName) departmentName.value = "";
            if (mobileNumber) mobileNumber.value = "";
            if (servicePurpose) servicePurpose.value = "";

            if (clientName) clientName.focus();

            return;
        }

        setManualClientMode(false);

const client =
            getClients().find(
                function (item) {

                    return (
                        getClientId(item)
                            .toLowerCase()
                        ===
                        selectedId
                    );

                }
            );


        if (!client) {

            clearClientDetails();

            console.warn(
                "Field Visit: Selected Client ID not found."
            );

            return;

        }


        if (clientName) {
            clientName.value =
                getClientName(client);
        }

        if (contactPerson) {
            contactPerson.value =
                getContactPerson(client);
        }

        if (departmentName) {
            departmentName.value =
                getDepartmentName(client);
        }

        if (mobileNumber) {
            mobileNumber.value =
                getMobile(client);
        }

        if (servicePurpose) {
            servicePurpose.value =
                getServicePurpose(client);
        }

    }


    if (clientId) {

        clientId.addEventListener(
            "change",
            fillClientDetails
        );

    }


    /* =====================================================
       SAVE
       ===================================================== */
async function saveVisit() {

    const records =
        getVisitRecords();

    const record = {

        id:
            "FV" +
            Date.now(),

        visitDate:
            visitDate.value,

        visitId:
            visitId.value,

        clientId:
            clientId.value,

        clientName:
            clientName.value,

        contactPerson:
            contactPerson.value,

        departmentName:
            departmentName.value,

        mobileNumber:
            mobileNumber.value,

        servicePurpose:
            servicePurpose.value,

        technicianName:
            technicianName.value.trim(),

        visitType:
            visitType.value,

        visitStatus:
            visitStatus.value,

        problem:
            problem.value.trim(),

        workDone:
            workDone.value.trim(),

        spareParts:
            spareParts.value.trim(),

        remarks:
            remarks.value.trim(),

        nextVisitDate:
            nextVisitDate.value,

        savedAt:
            new Date().toISOString()

    };

    // Existing LocalStorage
    records.push(record);

    localStorage.setItem(
        VISIT_STORAGE_KEY,
        JSON.stringify(records)
    );

    // Firebase Sync
    await window.SuviFirebaseSync.save(
        "fieldVisits",
        record.id,
        record
    );

    console.log(
        "Field Visit synced to Firebase successfully.",
        record.id
    );

    return record;
}
   


    /* =====================================================
       FORM VALIDATION
       ===================================================== */

    form.addEventListener(
        "submit",
      async function (event) {

            event.preventDefault();


            if (!clientId.value) {

                alert(
                    "Please select Client or Manual Client Entry."
                );

                clientId.focus();

                return;

            }


            const isManualClient =
                String(clientId.value)
                    .trim()
                    .toLowerCase() ===
                "manual";


            if (isManualClient) {

                if (!clientName.value.trim()) {

                    alert(
                        "Please enter Client Name."
                    );

                    clientName.focus();

                    return;
                }


                if (!contactPerson.value.trim()) {

                    alert(
                        "Please enter Contact Person."
                    );

                    contactPerson.focus();

                    return;
                }


                if (!departmentName.value.trim()) {

                    alert(
                        "Please enter Department Name."
                    );

                    departmentName.focus();

                    return;
                }


                const manualMobile =
                    mobileNumber.value
                        .replace(/\\D/g, "");


                if (
                    manualMobile.length !== 10
                ) {

                    alert(
                        "Please enter a valid 10-digit Mobile Number."
                    );

                    mobileNumber.focus();

                    return;
                }


                mobileNumber.value =
                    manualMobile;

            }


            if (
                !technicianName.value.trim()
            ) {

                alert(
                    "Please enter Technician Name."
                );

                technicianName.focus();

                return;

            }


            if (!visitType.value) {

                alert(
                    "Please select Visit Type."
                );

                visitType.focus();

                return;

            }


            if (!visitStatus.value) {

                alert(
                    "Please select Visit Status."
                );

                visitStatus.focus();

                return;

            }

            await saveVisit();

alert(
    "Field Visit saved successfully."
);
          

            form.reset();

          setVisitDate();

setVisitId();

loadClientDropdown();

loadVisitHistory();

syncClientsFromFirebase();
        }
    );


    /* =====================================================
       CLEAR / RESET
       ===================================================== */

    form.addEventListener(
        "reset",
        function () {

            /*
             * Browser reset happens after this event.
             * Re-apply readonly automatic fields immediately.
             */

            setTimeout(
                function () {

                    setVisitDate();

                    setVisitId();

                    clearClientDetails();

                    loadClientDropdown();

                },
                0
            );

        }
    );


    /* =====================================================
       HISTORY
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


    function loadVisitHistory() {

        if (!historyBody) {
            return;
        }


        const records =
            getVisitRecords();


        historyBody.innerHTML =
            "";


        if (
            historyCount
        ) {

            historyCount.textContent =
                records.length +
                (
                    records.length === 1
                        ? " Visit"
                        : " Visits"
                );

        }


        if (
            records.length === 0
        ) {

            historyBody.innerHTML = `

                <tr>

                    <td
                        colspan="8"
                        class="empty-visit-history">

                        No field visits found.

                    </td>

                </tr>

            `;

            return;

        }


        records
            .slice()
            .reverse()
            .forEach(
                function (record) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>
                            ${escapeHtml(
                                record.visitDate
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                record.visitId
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                record.clientId
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                record.clientName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                record.mobileNumber
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                record.servicePurpose
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                record.technicianName
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                record.visitStatus
                            )}
                        </td>

                    `;


                    historyBody.appendChild(
                        row
                    );

                }
            );

    }


    /* =====================================================
       INITIALIZE
       ===================================================== */

    setVisitDate();

    setVisitId();

    loadClientDropdown();

    loadVisitHistory();


    /* =====================================================
       CLIENT MASTER CAN CHANGE WHILE PAGE IS OPEN
       ===================================================== */

    window.addEventListener(
        "storage",
    async function (event) {

            if (
                CLIENT_STORAGE_KEYS.includes(
                    event.key
                )
            ) {

                loadClientDropdown();

                fillClientDetails();

            }

        }
    );


    console.log(
        "SUVI INFOTECH Field Visit JS loaded successfully."
    );

})();
