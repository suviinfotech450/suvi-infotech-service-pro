/* =========================================================
   SUVI INFOTECH
   COMMON RECYCLE BIN
========================================================= */

import {
    initializeApp
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    signInAnonymously
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    deleteDoc,
    writeBatch
} from
    "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyBSdggDY9RAhWQTfeUiYu-HRxdHPm7SvwA",

    authDomain:
        "suvi-infotech-service-pro.firebaseapp.com",

    projectId:
        "suvi-infotech-service-pro",

    storageBucket:
        "suvi-infotech-service-pro.firebasestorage.app",

    messagingSenderId:
        "181967409829",

    appId:
        "1:181967409829:web:4f17903a0a6dc8479fb34c"

};


/* =========================================================
   FIREBASE
========================================================= */

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


/* =========================================================
   VARIABLES
========================================================= */

let recycleRecords = [];


/* =========================================================
   AUTH
========================================================= */

async function ensureRecycleAuth() {

    if (!auth.currentUser) {

        await signInAnonymously(auth);

    }

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(value) {

    if (!value) {
        return "-";
    }

    let date;

    if (
        typeof value === "object" &&
        value.seconds
    ) {

        date =
            new Date(
                value.seconds * 1000
            );

    } else {

        date =
            new Date(value);

    }

    if (isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   AUTO DELETE DATE
   60 DAYS
========================================================= */

function getExpiryDate(value) {

    if (!value) {
        return null;
    }

    let date;

    if (
        typeof value === "object" &&
        value.seconds
    ) {

        date =
            new Date(
                value.seconds * 1000
            );

    } else {

        date =
            new Date(value);

    }

    if (isNaN(date.getTime())) {
        return null;
    }

    date.setDate(
        date.getDate() + 60
    );

    return date;

}


/* =========================================================
   LOAD RECYCLE BIN
========================================================= */

async function loadRecycleBin() {

    const table =
        document.getElementById(
            "recycleTable"
        );

    if (!table) {
        return;
    }

    try {

        await ensureRecycleAuth();


        const snapshot =
            await getDocs(
                collection(
                    db,
                    "recycleBin"
                )
            );


        recycleRecords = [];


        snapshot.forEach(
            function(item) {

                recycleRecords.push({

                    id:
                        item.id,

                    ...item.data()

                });

            }
        );


        /*
           Remove records older than 60 days
           when Recycle Bin is opened.
        */

        const now =
            new Date();


        const expiredRecords =
            recycleRecords.filter(
                function(record) {

                    const expiry =
                        getExpiryDate(
                            record.deletedAt
                        );

                    return (
                        expiry &&
                        expiry <= now
                    );

                }
            );


        for (
            const record
            of expiredRecords
        ) {

            await deleteDoc(
                doc(
                    db,
                    "recycleBin",
                    record.id
                )
            );

        }


        if (
            expiredRecords.length > 0
        ) {

            recycleRecords =
                recycleRecords.filter(
                    function(record) {

                        return !expiredRecords.some(
                            function(expired) {

                                return (
                                    expired.id ===
                                    record.id
                                );

                            }
                        );

                    }
                );

        }


        renderRecycleBin();


    } catch (error) {

        console.error(
            "Recycle Bin Load Error:",
            error
        );

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        color:#dc2626;
                        padding:20px;
                    "
                >
                    Unable to load Recycle Bin.
                </td>
            </tr>
        `;

    }

}


/* =========================================================
   RENDER
========================================================= */

function renderRecycleBin(
    searchValue = ""
) {

    const table =
        document.getElementById(
            "recycleTable"
        );

    if (!table) {
        return;
    }


    const search =
        String(
            searchValue || ""
        )
            .toLowerCase()
            .trim();


    const records =
        recycleRecords.filter(
            function(record) {

                const text = [

                    record.deletedFrom,
                    record.module,
                    record.clientId,
                    record.recordId,
                    record.company,
                    record.contact,
                    record.mobile

                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(search);

            }
        );


    if (records.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    style="
                        text-align:center;
                        padding:25px;
                        color:#64748b;
                    "
                >
                    No deleted records found.
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML = "";


    records.forEach(
        function(record) {

            const row =
                document.createElement(
                    "tr"
                );


            const module =
                record.deletedFrom ||
                record.module ||
                "Unknown";


            const recordId =
                record.recordId ||
                record.clientId ||
                record.id ||
                "-";


            const details =
                record.company ||
                record.name ||
                record.contact ||
                "-";


            const deletedOn =
                formatDate(
                    record.deletedAt
                );


            const expiry =
                getExpiryDate(
                    record.deletedAt
                );


            const autoDelete =
                expiry
                    ? formatDate(expiry)
                    : "-";


            row.innerHTML = `

                <td>
                    ${escapeHTML(module)}
                </td>

                <td>
                    ${escapeHTML(recordId)}
                </td>

                <td>
                    ${escapeHTML(details)}
                </td>

                <td>
                    ${deletedOn}
                </td>

                <td>
                    ${autoDelete}
                </td>

                <td>
<button
    class="restore-btn"
    data-id="${escapeHTML(record.id)}"
    title="Restore"
    aria-label="Restore"
>
    ↩️
</button>

<button
    class="permanent-delete-btn"
    data-id="${escapeHTML(record.id)}"
    title="Delete Permanently"
    aria-label="Delete Permanently"
>
    🗑️
</button>

                </td>

            `;


            table.appendChild(row);


            const restoreButton =
                row.querySelector(
                    ".restore-btn"
                );


            const deleteButton =
                row.querySelector(
                    ".permanent-delete-btn"
                );


            restoreButton.addEventListener(
                "click",
                function() {

                    restoreRecord(
                        record
                    );

                }
            );


            deleteButton.addEventListener(
                "click",
                function() {

                    permanentlyDeleteRecord(
                        record
                    );

                }
            );

        }
    );

}


/* =========================================================
   RESTORE
========================================================= */

async function restoreRecord(
    record
) {

    const recordId =
        record.recordId ||
        record.clientId ||
        record.id;


    const ok =
        confirm(
            "Restore this record?\n\n" +
            "Record ID: " +
            recordId
        );


    if (!ok) {
        return;
    }


    try {

        await ensureRecycleAuth();


        /*
           Current Client Master records
        */

        if (
            record.deletedFrom ===
            "Client Master"
        ) {

            const restoredClient = {
                ...record
            };


            delete restoredClient.id;
            delete restoredClient.firestoreId;
            delete restoredClient.deletedAt;
            delete restoredClient.deletedFrom;
            delete restoredClient.expireAt;


            const batch =
                writeBatch(db);


            batch.set(
                doc(
                    db,
                    "clients",
                    record.clientId
                ),
                restoredClient
            );


            batch.delete(
                doc(
                    db,
                    "recycleBin",
                    record.id
                )
            );

await batch.commit();


/* UPDATE CLIENT MASTER LOCAL STORAGE */

const clientStorageKey =
    "suviInfotechClients";

let localClients = [];

try {

    localClients =
        JSON.parse(
            localStorage.getItem(
                clientStorageKey
            )
        ) || [];

} catch (error) {

    localClients = [];

}


/* Remove duplicate if already exists */

localClients =
    localClients.filter(
        function(item) {

            return (
                item.clientId !==
                record.clientId
            );

        }
    );


/* Add restored client */

localClients.push(
    restoredClient
);


localStorage.setItem(
    clientStorageKey,
    JSON.stringify(localClients)
);


alert(
    "Client restored successfully."
);


await loadRecycleBin();


return;
            

        }


        /*
           Future modules:
           If originalCollection exists,
           restore automatically.
        */

        if (
            record.originalCollection &&
            record.originalId
        ) {

            const restoredData = {
                ...record
            };


            delete restoredData.id;
            delete restoredData.deletedAt;
            delete restoredData.deletedFrom;
            delete restoredData.originalCollection;
            delete restoredData.originalId;
            delete restoredData.expireAt;


            const batch =
                writeBatch(db);


            batch.set(
                doc(
                    db,
                    record.originalCollection,
                    record.originalId
                ),
                restoredData
            );


            batch.delete(
                doc(
                    db,
                    "recycleBin",
                    record.id
                )
            );


            await batch.commit();


            alert(
                "Record restored successfully."
            );


            await loadRecycleBin();

            return;

        }


        alert(
            "Restore information is not available for this record yet."
        );


    } catch (error) {

        console.error(
            "Restore Error:",
            error
        );

        alert(
            "Restore Error:\n" +
            error.message
        );

    }

}


/* =========================================================
   PERMANENT DELETE
========================================================= */

async function permanentlyDeleteRecord(
    record
) {

    const recordId =
        record.recordId ||
        record.clientId ||
        record.id;


    const ok =
        confirm(
            "FINAL WARNING!\n\n" +
            "Permanently delete this record?\n\n" +
            "Record ID: " +
            recordId +
            "\n\n" +
            "This action cannot be undone."
        );


    if (!ok) {
        return;
    }


    try {

        await ensureRecycleAuth();


        await deleteDoc(
            doc(
                db,
                "recycleBin",
                record.id
            )
        );


        alert(
            "Record permanently deleted."
        );


        await loadRecycleBin();


    } catch (error) {

        console.error(
            "Permanent Delete Error:",
            error
        );

        alert(
            "Permanent Delete Error:\n" +
            error.message
        );

    }

}


/* =========================================================
   SEARCH
========================================================= */

const searchBox =
    document.getElementById(
        "recycleSearch"
    );


if (searchBox) {

    searchBox.addEventListener(
        "input",
        function() {

            renderRecycleBin(
                this.value
            );

        }
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

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


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadRecycleBin();

    }
);