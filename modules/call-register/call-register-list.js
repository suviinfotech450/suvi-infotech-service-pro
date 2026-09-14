/* =========================================================
   SUVI INFOTECH
   CALL REGISTER HISTORY
   MOBILE + DESKTOP FIRESTORE SYNC
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const historyBody =
        document.getElementById("callHistoryBody");

    const searchBox =
        document.getElementById("callHistorySearch");

    let allCallHistory = [];

/* =====================================================
   BACK TO DASHBOARD
   ===================================================== */

const backToDashboard =
    document.getElementById("backToDashboard");

if (backToDashboard) {
    backToDashboard.addEventListener(
        "click",
        function () {
            window.location.href =
    "../../dashboard.html";
        }
    );
}
    /* =====================================================
       LOAD CALL HISTORY
       ===================================================== */

    async function loadCallHistory() {

        if (window.firebaseDbReady) {
    await window.firebaseDbReady;
}
        try {

            if (!window.firebaseDb) {

                console.warn(
                    "Firebase database not available."
                );

                historyBody.innerHTML = `
                    <tr>
                        <td colspan="9">
                            Firebase connection not available.
                        </td>
                    </tr>
                `;

                return;
            }


            const {
                collection,
                getDocs
            } = await import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
            );


            const snapshot =
                await getDocs(
                    collection(
                        window.firebaseDb,
                        "callRegister"
                    )
                );
                const activeCompanyId =
    localStorage.getItem("SUVI_COMPANY_ID");



const allClients =
    JSON.parse(
        localStorage.getItem("suviInfotechClients") || "[]"
    );

/* Active company clients only */
const activeClients =
    allClients.filter(function (client) {
        return client.companyId === activeCompanyId;
    });

/*
 * Build old-call lookup from Client Master.
 * This allows old Firebase calls without companyId
 * to be safely identified by Call ID + Mobile Number.
 */
const activeCallKeys = new Set();

activeClients.forEach(function (client) {

    const services =
        Array.isArray(client.serviceHistory)
            ? client.serviceHistory
            : [];

    services.forEach(function (service) {

        if (!service.callId) return;

        const mobile =
            String(
                client.mobileNumber || ""
            ).replace(/\D/g, "");

        const key =
            String(service.callId)
                .trim()
                .toUpperCase()
            + "|" +
            mobile;

        activeCallKeys.add(key);

    });

});


allCallHistory = [];

snapshot.forEach(function (doc) {

    const callData = doc.data();

    const callId =
        String(
            callData.callId || ""
        )
            .trim()
            .toUpperCase();

    const mobile =
        String(
            callData.mobileNumber || ""
        ).replace(/\D/g, "");

    const callKey =
        callId + "|" + mobile;


    /*
     * New records:
     * companyId directly identifies the firm.
     *
     * Old records:
     * companyId may be missing, so identify them
     * from the active company's Client Master history.
     */
    const belongsToActiveCompany =
        callData.companyId === activeCompanyId ||
        (
            !callData.companyId &&
            activeCallKeys.has(callKey)
        );


    if (belongsToActiveCompany) {

        allCallHistory.push({

            firestoreId: doc.id,

            ...callData

        });

    }

});

            

            


            /* Latest call first */

            allCallHistory.sort(function (a, b) {

                return new Date(
                    b.createdAt || 0
                ) - new Date(
                    a.createdAt || 0
                );

            });


            renderCallHistory(
                allCallHistory
            );


            console.log(
                "Call History Loaded:",
                allCallHistory.length
            );


        } catch (error) {

            console.error(
                "Call History Load Error:",
                error
            );

            historyBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        Unable to load Call History.
                    </td>
                </tr>
            `;

        }

    }


    /* =====================================================
       RENDER HISTORY
       ===================================================== */

    function renderCallHistory(records) {

        historyBody.innerHTML = "";


        if (!records.length) {

            historyBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        No Call History Found.
                    </td>
                </tr>
            `;

            return;

        }


        records.forEach(function (call, index) {

            const row =
                document.createElement("tr");


            const reason =
                call.pendingReason ||
                call.holdReason ||
                call.cancelReason ||
                call.reason ||
                "";


row.innerHTML = `
    <td>${index + 1}</td>
    <td>${escapeHtml(call.callId || "-")}</td>
    <td>${escapeHtml(call.date || "-")}</td>
    <td>${escapeHtml(call.time || "-")}</td>
    <td>${escapeHtml(call.callerName || "-")}</td>
    <td>${escapeHtml(call.mobileNumber || "-")}</td>
    <td>${escapeHtml(call.otherPurpose || call.purpose || "-")}</td>
    <td>${escapeHtml(call.status || "-")}</td>
    <td>${escapeHtml(reason || "-")}</td>
    <td class="history-actions">
        <button type="button" class="edit-call-btn"
            onclick="editCallHistory('${call.firestoreId}')">
            ✏️ Edit
        </button>
        <button type="button" class="delete-call-btn"
            onclick="deleteCallHistory('${call.firestoreId}')">
            🗑️ Delete
        </button>
    </td>
`;

            historyBody.appendChild(row);
async function editCallHistory(firestoreId) {

    const call = allCallHistory.find(
        item => item.firestoreId === firestoreId
    );

    if (!call) {
        alert("Call History record not found.");
        return;
    }

    /* Remove old popup if already open */
    const oldModal = document.getElementById("callEditModal");
    if (oldModal) oldModal.remove();

    /* Create Edit Popup */
    const modal = document.createElement("div");
    modal.id = "callEditModal";

    modal.innerHTML = `
        <div class="call-edit-overlay">

            <div class="call-edit-box">

                <div class="call-edit-header">
                    <div>
                        <div class="call-edit-brand">
                            SUVI INFOTECH
                        </div>
                        <div class="call-edit-title">
                            Edit Call History
                        </div>
                    </div>

                    <button
                        type="button"
                        id="closeCallEdit"
                        class="call-edit-close"
                    >
                        ×
                    </button>
                </div>

                <div class="call-edit-grid">

                    <div class="call-edit-field">
                        <label>Call ID</label>
                        <input
                            type="text"
                            id="editCallId"
                            value="${escapeHtml(call.callId || "")}"
                            readonly
                        >
                    </div>

                    <div class="call-edit-field">
                        <label>Call Date</label>
                        <input
                            type="text"
                            id="editCallDate"
                            value="${escapeHtml(call.date || "")}"
                        >
                    </div>

                    <div class="call-edit-field">
                        <label>Call Time</label>
                        <input
                            type="text"
                            id="editCallTime"
                            value="${escapeHtml(call.time || "")}"
                        >
                    </div>

                    <div class="call-edit-field">
                        <label>Client Name</label>
                        <input
                            type="text"
                            id="editCallerName"
                            value="${escapeHtml(call.callerName || "")}"
                        >
                    </div>

                    <div class="call-edit-field">
                        <label>Mobile Number</label>
                        <input
                            type="text"
                            id="editMobileNumber"
                            maxlength="10"
                            value="${escapeHtml(call.mobileNumber || "")}"
                        >
                    </div>

                    <div class="call-edit-field">
                        <label>Purpose</label>
                        <input
                            type="text"
                            id="editPurpose"
                            value="${escapeHtml(
                                call.otherPurpose ||
                                call.purpose ||
                                ""
                            )}"
                        >
                    </div>

                    <div class="call-edit-field">
                        <label>Status</label>
                        <select id="editStatus">
                            <option value="Open">Open</option>
                            <option value="Process">Process</option>
                            <option value="Pending">Pending</option>
                            <option value="Hold">Hold</option>
                            <option value="Complete">Complete</option>
                            <option value="Cancel">Cancel</option>
                        </select>
                    </div>

                    <div class="call-edit-field call-edit-full">
                        <label>Reason</label>
                        <input
                            type="text"
                            id="editReason"
                            value="${escapeHtml(
                                call.pendingReason ||
                                call.holdReason ||
                                call.cancelReason ||
                                call.reason ||
                                ""
                            )}"
                        >
                    </div>

                </div>

                <div class="call-edit-actions">

                    <button
                        type="button"
                        id="cancelCallEdit"
                        class="call-edit-cancel"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        id="saveCallEdit"
                        class="call-edit-save"
                    >
                        💾 Save Changes
                    </button>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    /* Set current status */
    const statusBox =
        document.getElementById("editStatus");

    statusBox.value =
        call.status || "Open";

    /* Mobile only digits */
    document
        .getElementById("editMobileNumber")
        .addEventListener("input", function () {
            this.value = this.value
                .replace(/\D/g, "")
                .slice(0, 10);
        });

    /* Close */
    document
        .getElementById("closeCallEdit")
        .onclick = function () {
            modal.remove();
        };

    document
        .getElementById("cancelCallEdit")
        .onclick = function () {
            modal.remove();
        };

    /* Save */
    document
        .getElementById("saveCallEdit")
        .onclick = async function () {

            const mobile =
                document
                    .getElementById("editMobileNumber")
                    .value
                    .trim();

            if (!/^[6-9]\d{9}$/.test(mobile)) {
                alert(
                    "Mobile Number must be exactly 10 digits."
                );
                return;
            }

            const updatedData = {

                callId:
                    document
                        .getElementById("editCallId")
                        .value
                        .trim(),

                date:
                    document
                        .getElementById("editCallDate")
                        .value
                        .trim(),

                time:
                    document
                        .getElementById("editCallTime")
                        .value
                        .trim(),

                callerName:
                    document
                        .getElementById("editCallerName")
                        .value
                        .trim(),

                mobileNumber:
                    mobile,

                purpose:
                    document
                        .getElementById("editPurpose")
                        .value
                        .trim(),

                otherPurpose:
                    document
                        .getElementById("editPurpose")
                        .value
                        .trim(),

                status:
                    document
                        .getElementById("editStatus")
                        .value,

                reason:
                    document
                        .getElementById("editReason")
                        .value
                        .trim(),

                updatedAt:
                    new Date().toISOString()
            };

            /* Keep reason fields consistent */
            updatedData.pendingReason =
                updatedData.status === "Pending"
                    ? updatedData.reason
                    : "";

            updatedData.holdReason =
                updatedData.status === "Hold"
                    ? updatedData.reason
                    : "";

            updatedData.cancelReason =
                updatedData.status === "Cancel"
                    ? updatedData.reason
                    : "";

            try {

                if (window.firebaseDbReady) {
                    await window.firebaseDbReady;
                }

                const {
                    doc,
                    updateDoc
                } = await import(
                    "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
                );

                await updateDoc(
                    doc(
                        window.firebaseDb,
                        "callRegister",
                        firestoreId
                    ),
                    updatedData
                );

                alert(
                    "Call History updated successfully."
                );

                modal.remove();

                await loadCallHistory();

            } catch (error) {

                console.error(
                    "Call History Edit Error:",
                    error
                );

                alert(
                    "Unable to update Call History."
                );
            }
        };
}


async function deleteCallHistory(firestoreId) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this Call History record?"
    );

    if (!confirmDelete) return;

    try {
        if (window.firebaseDbReady) {
            await window.firebaseDbReady;
        }

        const { doc, deleteDoc } =
            await import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
            );

        await deleteDoc(
            doc(
                window.firebaseDb,
                "callRegister",
                firestoreId
            )
        );

        alert("Call History deleted successfully.");

        await loadCallHistory();

    } catch (error) {
        console.error("Call History Delete Error:", error);
        alert("Unable to delete Call History.");
    }
}
window.deleteCallHistory = deleteCallHistory;
window.editCallHistory = editCallHistory;
        });

    }



    /* =====================================================
       SEARCH
       ===================================================== */

    if (searchBox) {

        searchBox.addEventListener(
            "input",
            function () {

                const search =
                    this.value
                        .trim()
                        .toLowerCase();


                if (!search) {

                    renderCallHistory(
                        allCallHistory
                    );

                    return;

                }


                const filtered =
                    allCallHistory.filter(
                        function (call) {

                            return (

                                String(
                                    call.callId || ""
                                )
                                .toLowerCase()
                                .includes(search)

                                ||

                                String(
                                    call.callerName || ""
                                )
                                .toLowerCase()
                                .includes(search)

                                ||

                                String(
                                    call.mobileNumber || ""
                                )
                                .toLowerCase()
                                .includes(search)

                                ||

                                String(
                                    call.purpose || ""
                                )
                                .toLowerCase()
                                .includes(search)

                                ||

                                String(
                                    call.status || ""
                                )
                                .toLowerCase()
                                .includes(search)

                            );

                        }
                    );


                renderCallHistory(
                    filtered
                );

            }
        );

    }


    /* =====================================================
       HTML SAFE
       ===================================================== */

    function escapeHtml(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =====================================================
       START
       ===================================================== */

    loadCallHistory();

});