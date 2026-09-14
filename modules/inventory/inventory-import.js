// ============================================================
// SUVI INFOTECH SERVICE PRO
//  ITEM + PARTY IMPORT
// FIREBASE + LOCAL STORAGE SYNC
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    writeBatch
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

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


// ============================================================
// FIREBASE
// ============================================================

const app =
    initializeApp(firebaseConfig);

const auth =
    getAuth(app);

const db =
    getFirestore(app);


// ============================================================
// LOCAL STORAGE
// ============================================================

const ITEMS_KEY =
    "SUVI_FRESH_ITEMS";


// ============================================================
// HELPERS
// ============================================================

function clean(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value).trim();
}


function numberValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return 0;
    }

    const n =
        Number(
            String(value)
                .replace(/,/g, "")
                .replace(/[₹%]/g, "")
                .trim()
        );

    return Number.isFinite(n) ? n : 0;
}


function normalKey(value) {

    return clean(value)
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}


function capitalizeName(value) {

    return clean(value)
        .replace(/\s+/g, " ")
        .split(" ")
        .map(function(word) {

            if (!word) {
                return "";
            }

            return (
                word.charAt(0).toUpperCase() +
                word.slice(1).toLowerCase()
            );

        })
        .join(" ");
}


function safeId(value) {

    return clean(value)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 120);
}


function readLocalItems() {

    try {

        return JSON.parse(
            localStorage.getItem(ITEMS_KEY)
        ) || [];

    } catch (error) {

        return [];
    }
}


function saveLocalItems(items) {

    localStorage.setItem(
        ITEMS_KEY,
        JSON.stringify(items)
    );
}


// ============================================================
// ITEM CODE
// ============================================================

function getNextItemNumber(items) {

    let highest = 0;

    items.forEach(function(item) {

        const code =
            clean(item.code);

        const match =
            code.match(/INV(\d+)/i);

        if (match) {

            highest =
                Math.max(
                    highest,
                    Number(match[1]) || 0
                );
        }
    });

    return highest + 1;
}


// ============================================================
// BARCODE
// ============================================================

function generateBarcode(existing) {

    if (clean(existing)) {
        return clean(existing);
    }

    return (
        "890" +
        Date.now().toString().slice(-10)
    );
}


// ============================================================
// EXCEL HEADER
// ============================================================

function getColumn(row, names) {

    const keys =
        Object.keys(row);

    for (const name of names) {

        const found =
            keys.find(function(key) {

                return normalKey(key) ===
                    normalKey(name);
            });

        if (
            found !== undefined &&
            clean(row[found]) !== ""
        ) {

            return row[found];
        }
    }

    return "";
}


// ============================================================
// READ EXCEL
// ============================================================

async function readExcelFile(file) {

    if (!window.XLSX) {

        throw new Error(
            "Excel reader is not loaded. Reload the page and try again."
        );
    }

    const buffer =
        await file.arrayBuffer();

    const workbook =
        XLSX.read(
            buffer,
            {
                type: "array"
            }
        );

    const sheetName =
        workbook.SheetNames[0];

    const sheet =
        workbook.Sheets[sheetName];

    return XLSX.utils.sheet_to_json(
        sheet,
        {
            defval: ""
        }
    );
}


// ============================================================
// FIREBASE BATCH SAVE
// ============================================================

async function saveBatchCollection(
    collectionName,
    records
) {

    for (
        let start = 0;
        start < records.length;
        start += 450
    ) {

        const batch =
            writeBatch(db);

        const part =
            records.slice(
                start,
                start + 450
            );

        part.forEach(function(record) {

            const ref =
                doc(
                    db,
                    collectionName,
                    record.firestoreId
                );

            const data = {
                ...record
            };

            delete data.firestoreId;

            batch.set(
                ref,
                data,
                {
                    merge: true
                }
            );
        });

        await batch.commit();
    }
}


// ============================================================
// IMPORT ITEMS
// ============================================================

async function importItems(file) {

    const rows =
        await readExcelFile(file);

    if (!rows.length) {

        throw new Error(
            "Item Excel file is empty."
        );
    }


    const localItems =
        readLocalItems();

    const importedItems = [];

    let nextNumber =
        getNextItemNumber(localItems);


    rows.forEach(function(row) {

        const name =
            capitalizeName(
                getColumn(
                    row,
                    [
                        "Item name*",
                        "Item name",
                        "Item Name",
                        "Stock Item",
                        "Stock Item Name"
                    ]
                )
            );

        if (!name) {
            return;
        }


        let code =
            clean(
                getColumn(
                    row,
                    [
                        "Item code",
                        "Item Code",
                        "Code"
                    ]
                )
            );


        if (!code) {

            code =
                "INV" +
                String(nextNumber)
                    .padStart(2, "0");

            nextNumber++;
        }


        const hsn =
            clean(
                getColumn(
                    row,
                    [
                        "HSN",
                        "HSN Code",
                        "HSN/SAC"
                    ]
                )
            );


        const unit =
            clean(
                getColumn(
                    row,
                    [
                        "Base Unit",
                        "Unit",
                        "Primary Unit"
                    ]
                )
            ) || "Nos";


        const purchaseRate =
            numberValue(
                getColumn(
                    row,
                    [
                        "Purchase price",
                        "Purchase Price",
                        "Purchase Rate",
                        "Purchase rate"
                    ]
                )
            );


        const saleRate =
            numberValue(
                getColumn(
                    row,
                    [
                        "Sale price",
                        "Sale Price",
                        "Sale Rate",
                        "Selling Price"
                    ]
                )
            );


        const stock =
            numberValue(
                getColumn(
                    row,
                    [
                        "Current stock quantity",
                        "Current Stock Quantity",
                        "Opening Stock",
                        "Stock"
                    ]
                )
            );


        const minStock =
            numberValue(
                getColumn(
                    row,
                    [
                        "Minimum stock quantity",
                        "Minimum Stock Quantity",
                        "Minimum Stock"
                    ]
                )
            );


        const description =
            clean(
                getColumn(
                    row,
                    [
                        "Description"
                    ]
                )
            );


        const category =
            clean(
                getColumn(
                    row,
                    [
                        "Category"
                    ]
                )
            );


        const taxRate =
            numberValue(
                getColumn(
                    row,
                    [
                        "Tax Rate",
                        "Tax rate",
                        "GST Rate"
                    ]
                )
            );


        const inclusiveTax =
            clean(
                getColumn(
                    row,
                    [
                        "Inclusive Of Tax",
                        "Inclusive of Tax"
                    ]
                )
            );


        const secondaryUnit =
            clean(
                getColumn(
                    row,
                    [
                        "Secondary Unit"
                    ]
                )
            );


        const conversionRate =
            numberValue(
                getColumn(
                    row,
                    [
                        "Conversion Rate"
                    ]
                )
            );


        const existing =
            localItems.find(function(item) {

                return (
                    normalKey(item.code) ===
                        normalKey(code)
                    ||
                    normalKey(item.name) ===
                        normalKey(name)
                );

            });


        const item = {

            id:
                existing?.id ||
                (
                    "IMP_" +
                    Date.now() +
                    "_" +
                    importedItems.length
                ),

            code:
                code,

            name:
                name,

            description:
                description,

            category:
                category,

            hsn:
                hsn,

            unit:
                unit,

            purchaseRate:
                purchaseRate,

            saleRate:
                saleRate,

            stock:
                stock,

            minStock:
                minStock,

            barcode:
                generateBarcode(
                    existing?.barcode
                ),

            taxRate:
                taxRate,

            inclusiveTax:
                inclusiveTax,

            secondaryUnit:
                secondaryUnit,

            conversionRate:
                conversionRate,

            source:
                " Import",

            importedAt:
                new Date().toISOString()
        };


        if (existing) {

            const index =
                localItems.indexOf(
                    existing
                );

            localItems[index] =
                {
                    ...existing,
                    ...item,
                    id:
                        existing.id
                };

        } else {

            localItems.push(item);
        }


        importedItems.push({

            ...item,

            firestoreId:
                safeId(
                    item.code ||
                    item.id
                )
        });

    });


    saveLocalItems(
        localItems
    );


    await saveBatchCollection(
        "items",
        importedItems
    );


    return {
        total: rows.length,
        imported: importedItems.length
    };
}


// ============================================================
// CLIENT ID
// ============================================================

async function getNextClientNumber() {

    const snapshot =
        await getDocs(
            collection(
                db,
                "clients"
            )
        );

    let highest = 0;

    snapshot.forEach(function(docSnap) {

        const data =
            docSnap.data() || {};

        const id =
            clean(
                data.clientId ||
                docSnap.id
            );

        const match =
            id.match(
                /(?:CLI[-_]?)(\d+)/i
            );

        if (match) {

            highest =
                Math.max(
                    highest,
                    Number(match[1]) || 0
                );
        }
    });

    return highest + 1;
}


// ============================================================
// IMPORT CLIENTS / PARTIES
// ============================================================

async function importClients(file) {

    const rows =
        await readExcelFile(file);

    if (!rows.length) {

        throw new Error(
            "Client/Party Excel file is empty."
        );
    }


    let nextNumber =
        await getNextClientNumber();


    const existingSnapshot =
        await getDocs(
            collection(
                db,
                "clients"
            )
        );


    const existingClients =
        [];


    existingSnapshot.forEach(function(docSnap) {

        existingClients.push({

            firestoreId:
                docSnap.id,

            ...docSnap.data()

        });

    });


    const importedClients =
        [];


    rows.forEach(function(row, index) {

        const name =
            capitalizeName(
                getColumn(
                    row,
                    [
                        "Name*",
                        "Name",
                        "Party Name",
                        "Customer Name"
                    ]
                )
            );


        if (!name) {
            return;
        }


        const mobile =
            clean(
                getColumn(
                    row,
                    [
                        "Contact No.",
                        "Contact No",
                        "Mobile",
                        "Mobile No",
                        "Phone"
                    ]
                )
            ).replace(
                /\D/g,
                ""
            );


        const email =
            clean(
                getColumn(
                    row,
                    [
                        "Email ID",
                        "Email",
                        "Email Id"
                    ]
                )
            );


        const address =
            capitalizeName(
                getColumn(
                    row,
                    [
                        "Address",
                        "Billing Address"
                    ]
                )
            );


        const gst =
            clean(
                getColumn(
                    row,
                    [
                        "GSTIN No.",
                        "GSTIN",
                        "GSTIN No"
                    ]
                )
            ).toUpperCase();


        const openingBalance =
            numberValue(
                getColumn(
                    row,
                    [
                        "Opening Balance",
                        "Opening balance"
                    ]
                )
            );


        const openingDate =
            clean(
                getColumn(
                    row,
                    [
                        "Opening Date"
                    ]
                )
            );


        const groupName =
            clean(
                getColumn(
                    row,
                    [
                        "Group Name",
                        "Group"
                    ]
                )
            );


        const shippingAddress =
            capitalizeName(
                getColumn(
                    row,
                    [
                        "Shipping Address"
                    ]
                )
            );


        const existing =
            existingClients.find(
                function(client) {

                    const sameMobile =
                        mobile &&
                        clean(client.mobile) ===
                            mobile;

                    const sameName =
                        normalKey(
                            client.company
                        ) ===
                        normalKey(name);

                    return (
                        sameMobile ||
                        sameName
                    );
                }
            );


        const clientId =
            existing
                ? clean(
                    existing.clientId ||
                    existing.firestoreId
                )
                : (
                    "CLI-" +
                    String(nextNumber++)
                        .padStart(3, "0")
                );


        importedClients.push({

            firestoreId:
                safeId(clientId),

            clientId:
                clientId,

            date:
                existing?.date ||
                new Date()
                    .toLocaleDateString(
                        "en-GB"
                    ),

            company:
                name,

            contact:
                existing?.contact ||
                name,

            mobile:
                mobile ||
                existing?.mobile ||
                "",

            email:
                email ||
                existing?.email ||
                "",

            gst:
                gst ||
                existing?.gst ||
                "",

            address:
                address ||
                existing?.address ||
                "",

            city:
                existing?.city ||
                "",

            state:
                existing?.state ||
                "",

            pincode:
                existing?.pincode ||
                "",

            openingBalance:
                openingBalance,

            openingDate:
                openingDate,

            groupName:
                groupName,

            shippingAddress:
                shippingAddress,

            serviceHistory:
                existing?.serviceHistory ||
                [],

            source:
                " Import",

            updatedAt:
                new Date().toISOString()
        });

    });


    await saveBatchCollection(
        "clients",
        importedClients
    );


    return {

        total:
            rows.length,

        imported:
            importedClients.length

    };
}


// ============================================================
// FILE BUTTON HANDLERS
// ============================================================

window.importItems =
    function() {

        const input =
            document.getElementById(
                "ItemFile"
            );

        if (input) {
            input.click();
        }
    };

window.importItems =
    function() {

        const input =
            document.getElementById(
                "ItemFile"
            );

        if (input) {
            input.click();
        } else {
            alert("Item file input not found.");
        }
    };
window.importClients =
    function() {

        const input =
            document.getElementById(
                "ClientFile"
            );

        if (input) {
            input.click();
              } else {
        alert("Client file input not found.");
        }
    };
window.importItems = function () {

    const input =
        document.getElementById("ItemFile");

    if (input) {
        input.click();
    } else {
        alert("Item file input not found.");
    }

};

// ============================================================
// ITEM FILE CHANGE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const itemInput =
            document.getElementById(
                "ItemFile"
            );


        if (itemInput) {

            itemInput.addEventListener(
                "change",
                async function() {

                    const file =
                        this.files?.[0];

                    if (!file) {
                        return;
                    }


                    try {

                        if (
                            !auth.currentUser
                        ) {

                            throw new Error(
                                "Firebase login required. Please login first."
                            );
                        }


                        const result =
                            await importItems(
                                file
                            );


                        alert(
                            "Item Import Successful!\n\n" +
                            "Excel Rows: " +
                            result.total +
                            "\nImported/Updated: " +
                            result.imported +
                            "\n\nFirebase + Item Master synced."
                        );


                        location.reload();

                    }
                    catch (error) {

                        console.error(
                            "Item Import Error:",
                            error
                        );

                        alert(
                            "Item Import Failed:\n" +
                            error.message
                        );

                    }


                    this.value = "";

                }
            );
        }


        const clientInput =
            document.getElementById(
                "ClientFile"
            );


        if (clientInput) {

            clientInput.addEventListener(
                "change",
                async function() {

                    const file =
                        this.files?.[0];

                    if (!file) {
                        return;
                    }


                    try {

                        if (
                            !auth.currentUser
                        ) {

                            throw new Error(
                                "Firebase login required. Please login first."
                            );
                        }


                        const result =
                            await importClients(
                                file
                            );


                        alert(
                            "Client Import Successful!\n\n" +
                            "Excel Rows: " +
                            result.total +
                            "\nImported/Updated: " +
                            result.imported +
                            "\n\nFirebase Client Master synced."
                        );


                    }
                    catch (error) {

                        console.error(
                            "Client Import Error:",
                            error
                        );

                        alert(
                            "Client Import Failed:\n" +
                            error.message
                        );

                    }


                    this.value = "";

                }
            );
        }

    }
);


// ============================================================
// FIREBASE AUTH STATUS
// ============================================================

onAuthStateChanged(
    auth,
    function(user) {

        if (user) {

            console.log(
                "SUVI Importer: Firebase user authenticated."
            );

        } else {

            console.warn(
                "SUVI Importer: Firebase user not authenticated."
            );
        }

    }
);

