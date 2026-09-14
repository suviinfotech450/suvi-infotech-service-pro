/* =========================================================
   SUVI INFOTECH
   CALL REGISTER - FINAL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const callForm =
        document.getElementById("callForm");

    const callDate =
        document.getElementById("callDate");

    const callTime =
     document.getElementById("callTime");    

    const callId =
        document.getElementById("callId");

    const callerName =
        document.getElementById("callerName");

    const mobileNumber =
        document.getElementById("mobileNumber");

    const emailId =
        document.getElementById("emailId");

    const gstNumber =
        document.getElementById("gstNumber");

    const address =
        document.getElementById("address");

    const purpose =
        document.getElementById("purpose");
     
        const otherPurposeGroup =
    document.getElementById("otherPurposeGroup");

const otherPurpose =
    document.getElementById("otherPurpose");   

    const status =
        document.getElementById("status");

    const pendingReasonBox =
        document.getElementById("pendingReasonBox");

    const pendingReason =
        document.getElementById("pendingReason");

    const holdReasonBox =
        document.getElementById("holdReasonBox");

    const holdReason =
        document.getElementById("holdReason");

    const cancelReasonBox =
        document.getElementById("cancelReasonBox");

    const cancelReason =
        document.getElementById("cancelReason");

    const saveCallButton =
        document.getElementById("saveCallButton");

    const backToDashboard =
        document.getElementById("backToDashboard");
    /* =====================================================
       DYNAMIC FIRM NAME
       ===================================================== */

    const callRegisterFirmName =
        document.getElementById("callRegisterFirmName");

    if (callRegisterFirmName) {

        const selectedFirm =
            localStorage.getItem(
                "SUVI_INFOTECH_SELECTED_FIRM"
            );

        if (selectedFirm) {
            callRegisterFirmName.textContent =
                selectedFirm.trim();
        }
    }

    /* =====================================================
       NEW 3 FIELDS
       HTML ADD MADIDRE AUTOMATICALLY WORK AGUTTE
       ===================================================== */

    const departmentName =
        document.getElementById("departmentName");

    const state =
        document.getElementById("state");

    const pincode =
        document.getElementById("pincode");


    /* =====================================================
       STORAGE
       ONLY CLIENT MASTER
       ===================================================== */

    const CLIENT_KEY =
        "suviInfotechClients";


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
            months[today.getMonth()] +
            "-" +
            today.getFullYear()
        );
    }


    /* =====================================================
       CAPITALIZE
       SPACE BAR WORKS NORMALLY
       CAPS ONLY TAB / BLUR
       ===================================================== */

    function capitalizeWords(value) {

        return String(value || "")
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
       LOAD CLIENT MASTER
       ===================================================== */

    function getClients() {

        try {

            const saved =
                localStorage.getItem(
                    CLIENT_KEY
                );

            if (!saved) {
                return [];
            }

            const data =
                JSON.parse(saved);

            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                "Client Master load error:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       SAVE CLIENT MASTER
       ===================================================== */

    function saveClients(
        clients
    ) {

        localStorage.setItem(
            CLIENT_KEY,
            JSON.stringify(
                clients
            )
        );
    }


    /* =====================================================
       GENERATE CLIENT ID
       CLI001
       ===================================================== */

    function generateClientId() {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (!selectedFirm) {
        return "CLI001";
    }

    const firmKey =
        selectedFirm
            .trim()
            .toUpperCase()
            .replace(
                /[^A-Z0-9]+/g,
                "_"
            );

    const sequenceKey =
        "SUVI_INFOTECH_CLIENT_SEQUENCE_" +
        firmKey;

    const lastNumber =
        parseInt(
            localStorage.getItem(
                sequenceKey
            ) || "0",
            10
        );

    return (
        "CLI" +
        String(
            lastNumber + 1
        ).padStart(
            3,
            "0"
        )
    );
}
function saveNextClientSequence() {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (!selectedFirm) return;

    const firmKey =
        selectedFirm
            .trim()
            .toUpperCase()
            .replace(
                /[^A-Z0-9]+/g,
                "_"
            );

    const sequenceKey =
        "SUVI_INFOTECH_CLIENT_SEQUENCE_" +
        firmKey;

    const lastNumber =
        parseInt(
            localStorage.getItem(
                sequenceKey
            ) || "0",
            10
        );

    localStorage.setItem(
        sequenceKey,
        String(lastNumber + 1)
    );
}

    /* =====================================================
       GENERATE CALL ID
       CLR001
       CLR002
       CLR003
       ===================================================== */

    function generateCallId() {

    const selectedFirm =
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM");

    if (!selectedFirm) {
        return "CLR001";
    }

    const firmKey =
        selectedFirm
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_");

    const sequenceKey =
        "SUVI_INFOTECH_CALL_SEQUENCE_" + firmKey;

    const lastNumber =
        parseInt(
            localStorage.getItem(sequenceKey) || "0",
            10
        );

    return (
        "CLR" +
        String(lastNumber + 1).padStart(3, "0")
    );
}
function saveNextCallSequence() {

    const selectedFirm =
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM");

    if (!selectedFirm) return;

    const firmKey =
        selectedFirm
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_");

    const sequenceKey =
        "SUVI_INFOTECH_CALL_SEQUENCE_" + firmKey;

    const lastNumber =
        parseInt(
            localStorage.getItem(sequenceKey) || "0",
            10
        );

    localStorage.setItem(
        sequenceKey,
        String(lastNumber + 1)
    );
}
function saveNextClientSequence() {

    const selectedFirm =
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM");

    if (!selectedFirm) return;

    const firmKey =
        selectedFirm
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "_");

    const sequenceKey =
        "SUVI_INFOTECH_CLIENT_SEQUENCE_" + firmKey;

    const lastNumber =
        parseInt(
            localStorage.getItem(sequenceKey) || "0",
            10
        );

    localStorage.setItem(
        sequenceKey,
        String(lastNumber + 1)
    );
}
    /* =====================================================
       SHOW / HIDE REASON
       ===================================================== */

    function updateReasonFields() {

        const selected =
            status.value;

        if (pendingReasonBox) {

            pendingReasonBox.hidden =
                selected !== "Pending";
        }

        if (holdReasonBox) {

            holdReasonBox.hidden =
                selected !== "Hold";
        }

        if (cancelReasonBox) {

            cancelReasonBox.hidden =
                selected !== "Cancel";
        }

        if (
            selected !== "Pending" &&
            pendingReason
        ) {

            pendingReason.value =
                "";
        }

        if (
            selected !== "Hold" &&
            holdReason
        ) {

            holdReason.value =
                "";
        }

        if (
            selected !== "Cancel" &&
            cancelReason
        ) {

            cancelReason.value =
                "";
        }
    }


    /* =====================================================
       PREPARE NEW CALL
       ===================================================== */

    function prepareCall() {

        callDate.value =
            getFormattedDate();
            if (callTime) {
    callTime.value =
        getFormattedTime();
}
            function getFormattedTime() {
    return new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

        callId.value =
            generateCallId();

        if (status) {

            status.value =
                "";
        }

        if (pendingReasonBox) {

            pendingReasonBox.hidden =
                true;
        }

        if (holdReasonBox) {

            holdReasonBox.hidden =
                true;
        }

        if (cancelReasonBox) {

            cancelReasonBox.hidden =
                true;
        }

        if (pendingReason) {

            pendingReason.value =
                "";
        }

        if (holdReason) {

            holdReason.value =
                "";
        }

        if (cancelReason) {

            cancelReason.value =
                "";
        }
    }

/* =====================================================
   OTHER PURPOSE
   ===================================================== */

function updateOtherPurpose() {

    if (!purpose || !otherPurposeGroup) {
        return;
    }

    if (purpose.value === "Other") {

        otherPurposeGroup.style.display =
            "block";

    } else {

        otherPurposeGroup.style.display =
            "none";

        if (otherPurpose) {
            otherPurpose.value = "";
        }
    }
}

if (purpose) {

    purpose.addEventListener(
        "change",
        updateOtherPurpose
    );
}
    /* =====================================================
       STATUS CHANGE
       ===================================================== */

    if (status) {

        status.addEventListener(
            "change",
            function () {

                updateReasonFields();

            }
        );
    }


    /* =====================================================
       NAME
       ===================================================== */

    if (callerName) {

        callerName.addEventListener(
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

        callerName.addEventListener(
            "blur",
            function () {

                this.value =
                    capitalizeWords(
                        this.value
                    );
            }
        );
    }


    /* =====================================================
       ADDRESS
       ===================================================== */

    if (address) {

        address.addEventListener(
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

        address.addEventListener(
            "blur",
            function () {

                this.value =
                    capitalizeWords(
                        this.value
                    );
            }
        );
    }


    /* =====================================================
       DEPARTMENT
       ===================================================== */

    if (departmentName) {

        departmentName.addEventListener(
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

        departmentName.addEventListener(
            "blur",
            function () {

                this.value =
                    capitalizeWords(
                        this.value
                    );
            }
        );
    }


    /* =====================================================
       MOBILE
       EXACT 10 DIGITS
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
       PINCODE
       EXACT 6 DIGITS
       ===================================================== */

    if (pincode) {

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
    }


    /* =====================================================
       GST
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
   FIREBASE CALL SYNC
   ===================================================== */

async function syncCallToFirebase(data) {

    try {

        if (window.firebaseDbReady) {
    await window.firebaseDbReady;
}
        if (!window.firebaseDb) {
            console.warn("Firebase database not available.");
            return;
        }

        const {
            collection,
            addDoc
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        await addDoc(
            collection(window.firebaseDb, "callRegister"),
            data
        );

        console.log("Call synced to Firebase successfully.");

    } catch (error) {

        console.error(
            "Firebase Call Sync Error:",
            error
        );

    }
}

/* =====================================================
   FIREBASE CLIENT MASTER SYNC
   ===================================================== */

async function syncClientToFirebase(client) {

    try {

        if (window.firebaseDbReady) {
            await window.firebaseDbReady;
        }

        if (!window.firebaseDb) {
            console.warn(
                "Firebase database not available."
            );
            return false;
        }

        const {
            doc,
            setDoc
        } = await import(
            "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        const companyId =
            localStorage.getItem(
                "SUVI_COMPANY_ID"
            );

        await setDoc(
            doc(
                window.firebaseDb,
                "clients",
                client.clientId
            ),
            {
                ...client,
                companyId: companyId
            }
        );

        console.log(
            "Client Master synced to Firebase successfully:",
            client.clientId
        );

        return true;

    } catch (error) {

        console.error(
            "Firebase Client Sync Error:",
            error
        );

        return false;
    }
}
    /* =====================================================
       SAVE CALL
       ===================================================== */
let isCallSaving = false;

callForm.addEventListener(
    "submit",
    async function (event) {

        if (isCallSaving) {
            return;
        }

        event.preventDefault();

        isCallSaving = true;
       /* ---------------------------------------------
               FINAL CAPITALIZATION
               --------------------------------------------- */

            callerName.value =
                capitalizeWords(
                    callerName.value
                );

            address.value =
                capitalizeWords(
                    address.value
                );

            if (departmentName) {

                departmentName.value =
                    capitalizeWords(
                        departmentName.value
                    );
            }


            /* ---------------------------------------------
               DATA
               --------------------------------------------- */

            const data = {

                date:
                    callDate.value.trim(),

                time:
                     callTime.value.trim(),
                    
                callId:
                    callId.value.trim(),

                companyId:
    localStorage.getItem("SUVI_COMPANY_ID"),

firmName:
    localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM")
    || "SUVI INFOTECH",

callerName:
    callerName.value.trim(),    

                mobileNumber:
                    mobileNumber.value.trim(),

                emailId:
                    emailId.value.trim(),

                gstNumber:
                    gstNumber.value
                        .trim()
                        .toUpperCase(),

                departmentName:
                    departmentName
                        ? departmentName.value.trim()
                        : "",

                state:
                    state
                        ? state.value
                        : "",

                pincode:
                    pincode
                        ? pincode.value.trim()
                        : "",

                address:
                    address.value.trim(),

                purpose:
                    purpose.value,
                 otherPurpose:
    otherPurpose
        ? otherPurpose.value.trim()
        : "",   

                status:
                    status.value,

                pendingReason:
                    pendingReason
                        ? pendingReason.value.trim()
                        : "",

                holdReason:
                    holdReason
                        ? holdReason.value.trim()
                        : "",

                cancelReason:
                    cancelReason
                        ? cancelReason.value.trim()
                        : "",

                createdAt:
                    new Date().toISOString()
            };


            /* ---------------------------------------------
               VALIDATION
               --------------------------------------------- */

            if (
                !data.callerName
            ) {

                alert(
                    "Please enter Caller Name."
                );

                callerName.focus();

                return;
            }


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

            if (
    data.emailId &&
    data.emailId !== "-" &&
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


            if (
                data.pincode &&
                !/^\d{6}$/.test(
                    data.pincode
                )
            ) {

                alert(
                    "Pincode must be exactly 6 digits."
                );

                if (pincode) {
                    pincode.focus();
                }

                return;
            }


            if (
                !data.purpose
            ) {

                alert(
                    "Please select Purpose of Calling."
                );

                purpose.focus();

                return;
            }


            if (
                !data.status
            ) {

                alert(
                    "Please select Status."
                );

                status.focus();

                return;
            }


            /* ---------------------------------------------
               PENDING REASON
               --------------------------------------------- */

            if (
                data.status === "Pending" &&
                !data.pendingReason
            ) {

                alert(
                    "Please enter Pending Reason."
                );

                if (pendingReason) {
                    pendingReason.focus();
                }

                return;
            }


            /* ---------------------------------------------
               HOLD REASON
               --------------------------------------------- */

            if (
                data.status === "Hold" &&
                !data.holdReason
            ) {

                alert(
                    "Please enter Hold Reason."
                );

                if (holdReason) {
                    holdReason.focus();
                }

                return;
            }


            /* ---------------------------------------------
               CANCEL REASON
               --------------------------------------------- */

            if (
                data.status === "Cancel" &&
                !data.cancelReason
            ) {

                alert(
                    "Please enter Cancel Reason."
                );

                if (cancelReason) {
                    cancelReason.focus();
                }

                return;
            }


            /* =================================================
               CLIENT MASTER
               ================================================= */

            const clients =
                getClients();


            /* ---------------------------------------------
               FIND CLIENT BY MOBILE
               --------------------------------------------- */

            const existingIndex =
                clients.findIndex(
                    function (client) {

                        return (
                            String(
                                client.mobileNumber || ""
                            ).trim() ===
                            data.mobileNumber
                        );
                    }
                );


            /* =================================================
               SERVICE HISTORY RECORD
               ================================================= */

            const serviceHistoryRecord = {

                date:
    data.date,

time:
    callTime
        ? callTime.value.trim()
        : "",

callId:
    data.callId,
                

                purpose:
                    data.purpose,

                service:
                    data.purpose,

                departmentName:
                    data.departmentName,

                state:
                    data.state,

                pincode:
                    data.pincode,

                address:
                    data.address,

                status:
                    data.status,

                pendingReason:
                    data.pendingReason,

                holdReason:
                    data.holdReason,

                cancelReason:
                    data.cancelReason,

                reason:
                    data.pendingReason ||
                    data.holdReason ||
                    data.cancelReason ||
                    "",

                createdAt:
                    data.createdAt
            };


            /* =================================================
               EXISTING CLIENT
               ================================================= */

            if (
                existingIndex !== -1
            ) {

                const client =
                    clients[
                        existingIndex
                    ];

                client.contactPerson =
                    data.callerName;

                client.mobileNumber =
                    data.mobileNumber;

                client.emailId =
                    data.emailId;

                client.gstNumber =
                    data.gstNumber;

                client.departmentName =
                    data.departmentName;

                client.state =
                    data.state;

                client.pincode =
                    data.pincode;

                client.address =
                    data.address;

                if (
                    !Array.isArray(
                        client.serviceHistory
                    )
                ) {

                    client.serviceHistory =
                        [];
                }

                client.serviceHistory.push(
                    serviceHistoryRecord
                );

                client.updatedAt =
                    new Date().toISOString();

                clients[
                    existingIndex
                ] = client;

                saveClients(
    clients
);

saveNextCallSequence();

await syncClientToFirebase(
    newClient
);

await syncCallToFirebase(
    data
);

                alert(
                    "Call saved successfully!\n\n" +
                    "Call ID: " +
                    data.callId +
                    "\n" +
                    "Existing Client: " +
                    client.clientId +
                    "\n\n" +
                    "Client Master synced successfully."
                );
            }


            /* =================================================
               NEW CLIENT
               ================================================= */

            else {

                    const newClient = {
    date:
        data.date,

    clientId:
        generateClientId(
            clients
        ),
    
    companyId:
    localStorage.getItem("SUVI_COMPANY_ID"),
   
    contactPerson:
        data.callerName,

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
                        "",

                    createdAt:
                        new Date().toISOString(),

                    updatedAt:
                        new Date().toISOString(),

                    serviceHistory: [
                        serviceHistoryRecord
                    ]
                };

                clients.push(
                    newClient
                );

                saveClients(
                    clients
                );
                saveNextCallSequence();
                saveNextClientSequence();
                syncCallToFirebase(data);
             

                alert(
                    "Call saved successfully!\n\n" +
                    "Call ID: " +
                    data.callId +
                    "\n" +
                    "New Client: " +
                    newClient.clientId +
                    "\n\n" +
                    "Client Master synced successfully."
                );
            }


            /* =================================================
               RESET
               ================================================= */

            callForm.reset();

            prepareCall();

        }
    );

    
    /* =====================================================
       BACK TO DASHBOARD
       ===================================================== */

    if (backToDashboard) {

        backToDashboard.addEventListener(
            "click",
            function () {

            window.top.location.href =
    "../../dashboard.html";
            }
        );

    }


    /* =====================================================
       INITIAL LOAD
       ===================================================== */
/* =====================================================
   LOAD CALL REGISTER FROM FIREBASE
   ===================================================== */

async function loadCallRegisterFromFirebase() {
    try {

        if (!window.firebaseDb) {
            console.warn("Firebase database not available.");
            return;
        }

        const {
            collection,
            getDocs
        } = await import(
           "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
        );

        const snapshot = await getDocs(
            collection(window.firebaseDb, "callRegister")
        );

        const firebaseCalls = [];

        snapshot.forEach((doc) => {
            firebaseCalls.push({
                id: doc.id,
                ...doc.data()
            });
        });

        console.log(
            "Firebase Call Register records:",
            firebaseCalls.length
        );

        /* Make records available to Desktop Call Register */
        window.firebaseCallRegisterData = firebaseCalls;

        /*
         * If your Call Register table has a display function,
         * call it here.
         */
        if (typeof renderCallRegister === "function") {
            renderCallRegister(firebaseCalls);
        }

    } catch (error) {

        console.error(
            "Firebase Call Register Load Error:",
            error
        );

    }
}
    prepareCall();

});
    