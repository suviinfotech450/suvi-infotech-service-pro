/* =========================================================
   SUVI INFOTECH
   COMMON SERVICE MODULES
   INVENTORY STOCK OUT SYNC
   ========================================================= */

const SERVICE_INVENTORY_KEY =
    "suviInfotechInventory";


/* =========================================================
   GET INVENTORY
   ========================================================= */

function getServiceInventory() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    SERVICE_INVENTORY_KEY
                ) || "[]"
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Service Inventory Read Error:",
            error
        );

        return [];
    }
}


/* =========================================================
   SAVE INVENTORY
   ========================================================= */

function saveServiceInventory(items) {

    localStorage.setItem(
        SERVICE_INVENTORY_KEY,
        JSON.stringify(items)
    );

}


/* =========================================================
   INVENTORY STOCK OUT
   ========================================================= */

function serviceStockOut(options = {}) {

    const partName =
        String(
            options.partName || ""
        ).trim();

    const quantity =
        Number(
            options.quantity || 1
        );


    /* -----------------------------------------------------
       No Part Selected
       ----------------------------------------------------- */

    if (!partName) {

        return {

            success: true,

            skipped: true,

            message:
                "No part selected."

        };

    }


    /* -----------------------------------------------------
       Invalid Quantity
       ----------------------------------------------------- */

    if (quantity <= 0) {

        return {

            success: false,

            message:
                "Invalid quantity."

        };

    }


    const inventory =
        getServiceInventory();


    const searchName =
        partName.toLowerCase();


    /* -----------------------------------------------------
       Find Inventory Item
       ----------------------------------------------------- */

    const item =
        inventory.find(
            function (record) {

                const itemName =
                    String(
                        record.itemName || ""
                    )
                    .trim()
                    .toLowerCase();


                const partNumber =
                    String(
                        record.partNumber || ""
                    )
                    .trim()
                    .toLowerCase();


                const requestedPartNumber =
                    String(
                        options.partNumber || ""
                    )
                    .trim()
                    .toLowerCase();


                if (
                    requestedPartNumber &&
                    partNumber
                ) {

                    return (
                        requestedPartNumber ===
                        partNumber
                    );

                }


                return (
                    searchName ===
                    itemName
                );

            }
        );


    /* -----------------------------------------------------
       Item Not Found
       ----------------------------------------------------- */

    if (!item) {

        return {

            success: false,

            message:
                `"${partName}" Inventoryನಲ್ಲಿ ಸಿಗಲಿಲ್ಲ.`

        };

    }


    /* -----------------------------------------------------
       CURRENT STOCK
       ----------------------------------------------------- */

    const currentStock =
        Math.max(

            0,

            Number(
                item.openingStock || 0
            ) +

            Number(
                item.stockIn || 0
            ) -

            Number(
                item.stockOut || 0
            )

        );


    /* -----------------------------------------------------
       STOCK CHECK
       ----------------------------------------------------- */

    if (
        quantity >
        currentStock
    ) {

        return {

            success: false,

            insufficientStock: true,

            message:
                `${item.itemName} ಗೆ ${currentStock} ಮಾತ್ರ stock ಇದೆ. ${quantity} issue ಮಾಡಲು ಸಾಧ್ಯವಿಲ್ಲ.`

        };

    }


    /* -----------------------------------------------------
       UPDATE STOCK OUT
       ----------------------------------------------------- */

    item.stockOut =
        Number(
            item.stockOut || 0
        ) +
        quantity;


    item.updatedAt =
        new Date().toISOString();


    /* -----------------------------------------------------
       SAVE
       ----------------------------------------------------- */

    saveServiceInventory(
        inventory
    );


    return {

        success: true,

        itemName:
            item.itemName,

        quantity:
            quantity,

        currentStock:
            currentStock - quantity,

        message:
            `${item.itemName} - ${quantity} Stock Out successfully.`

    };

}


/* =========================================================
   MAKE AVAILABLE TO ALL SERVICE PAGES
   ========================================================= */

window.serviceStockOut =
    serviceStockOut;


window.getServiceInventory =
    getServiceInventory;
    /* =========================================================
   SERVICE MODULES
   QUICK ADD INVENTORY ITEM
   ========================================================= */

function enableServiceInventoryQuickAdd() {

    const selects = document.querySelectorAll(
        "#partsName, #itemName"
    );

    selects.forEach(function(select) {

        /* Already added */
        if (
            select.dataset.inventoryQuickAdd === "true"
        ) {
            return;
        }

        select.dataset.inventoryQuickAdd = "true";


        /* Add option */
        const addOption =
            document.createElement("option");

        addOption.value =
            "__ADD_NEW_INVENTORY_ITEM__";

        addOption.textContent =
            "＋ Add New Item";

        select.appendChild(addOption);


        /* Change event */
        select.addEventListener(
            "change",
            function() {

                if (
                    select.value !==
                    "__ADD_NEW_INVENTORY_ITEM__"
                ) {
                    return;
                }


                /* Reset dropdown */
                select.value = "";


                openServiceInventoryAddModal(
                    select
                );

            }
        );

    });

}


/* =========================================================
   OPEN ADD ITEM MODAL
   ========================================================= */

function openServiceInventoryAddModal(
    targetSelect
) {

    let modal =
        document.getElementById(
            "serviceInventoryAddModal"
        );


    if (!modal) {

        modal =
            document.createElement("div");

        modal.id =
            "serviceInventoryAddModal";

        modal.innerHTML = `

            <div
                style="
                    position:fixed;
                    inset:0;
                    background:rgba(15,23,42,.65);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    z-index:99999;
                    padding:20px;
                "
            >

                <div
                    style="
                        width:min(430px,100%);
                        background:#fff;
                        border-radius:18px;
                        padding:24px;
                        box-shadow:0 25px 70px rgba(0,0,0,.25);
                    "
                >

                    <h2
                        style="
                            margin:0 0 5px;
                            color:#0f172a;
                            font-size:22px;
                        "
                    >
                        Add Inventory Item
                    </h2>

                    <p
                        style="
                            margin:0 0 20px;
                            color:#64748b;
                            font-size:13px;
                        "
                    >
                        Add a new part/item directly from service.
                    </p>


                    <label
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:700;
                            color:#334155;
                        "
                    >
                        Item / Part Name *
                    </label>

                    <input
                        id="quickInventoryItemName"
                        type="text"
                        placeholder="Enter item / part name"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:12px;
                            border:1px solid #cbd5e1;
                            border-radius:9px;
                            margin-bottom:15px;
                        "
                    >


                    <label
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:700;
                            color:#334155;
                        "
                    >
                        Available Quantity *
                    </label>

                    <input
                        id="quickInventoryQty"
                        type="number"
                        min="0"
                        step="1"
                        value="0"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:12px;
                            border:1px solid #cbd5e1;
                            border-radius:9px;
                            margin-bottom:15px;
                        "
                    >


                    <label
                        style="
                            display:block;
                            margin-bottom:6px;
                            font-weight:700;
                            color:#334155;
                        "
                    >
                        Purchase Rate
                    </label>

                    <input
                        id="quickInventoryPurchaseRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value="0"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:12px;
                            border:1px solid #cbd5e1;
                            border-radius:9px;
                            margin-bottom:20px;
                        "
                    >


                    <div
                        style="
                            display:flex;
                            justify-content:flex-end;
                            gap:10px;
                        "
                    >

                        <button
                            type="button"
                            id="quickInventoryCancel"
                            style="
                                padding:10px 16px;
                                border:1px solid #cbd5e1;
                                background:#fff;
                                border-radius:9px;
                                cursor:pointer;
                            "
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            id="quickInventorySave"
                            style="
                                padding:10px 18px;
                                border:0;
                                background:#2563eb;
                                color:#fff;
                                border-radius:9px;
                                font-weight:700;
                                cursor:pointer;
                            "
                        >
                            Add Item
                        </button>

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(modal);


        /* Cancel */

        document
            .getElementById(
                "quickInventoryCancel"
            )
            .addEventListener(
                "click",
                function() {

                    modal.remove();

                }
            );


        /* Save */

        document
            .getElementById(
                "quickInventorySave"
            )
            .addEventListener(
                "click",
                function() {

                    saveQuickInventoryItem(
                        targetSelect,
                        modal
                    );

                }
            );

    }

}


/* =========================================================
   SAVE QUICK INVENTORY ITEM
   ========================================================= */

function saveQuickInventoryItem(
    targetSelect,
    modal
) {

    const itemName =
        document
            .getElementById(
                "quickInventoryItemName"
            )
            .value
            .trim();


    const quantity =
        Number(
            document
                .getElementById(
                    "quickInventoryQty"
                )
                .value || 0
        );


    const purchaseRate =
        Number(
            document
                .getElementById(
                    "quickInventoryPurchaseRate"
                )
                .value || 0
        );


    if (!itemName) {

        alert(
            "Please enter Item / Part Name."
        );

        return;

    }


    if (quantity < 0) {

        alert(
            "Quantity cannot be negative."
        );

        return;

    }


    const inventory =
        getServiceInventory();


    /* Check existing item */

    const existing =
        inventory.find(
            function(item) {

                return String(
                    item.itemName || ""
                )
                .trim()
                .toLowerCase()
                ===
                itemName.toLowerCase();

            }
        );


    if (existing) {

        alert(
            `"${itemName}" already exists in Inventory.`
        );

        return;

    }


    /* Create new inventory item */

    const newItem = {

        id:
            "INV" +
            Date.now(),

        itemName:
            itemName,

        category:
            "Spare Parts",

        brand:
            "",

        model:
            "",

        partNumber:
            "",

        hsnCode:
            "",

        serialNumber:
            "",

        openingStock:
            quantity,

        stockIn:
            0,

        stockOut:
            0,

        purchaseRate:
            purchaseRate,

        sellingRate:
            0,

        supplier:
            "Service Module",

        minStock:
            0,

        remarks:
            "Added from Service Module",

        updatedAt:
            new Date().toISOString()

    };


    inventory.push(
        newItem
    );


    saveServiceInventory(
        inventory
    );


    /* Add to current dropdown */

    const option =
        document.createElement(
            "option"
        );

    option.value =
        itemName;

    option.textContent =
        itemName;


    /* Put before Add New Item */

    const addNewOption =
        targetSelect.querySelector(
            'option[value="__ADD_NEW_INVENTORY_ITEM__"]'
        );


    if (addNewOption) {

        targetSelect.insertBefore(
            option,
            addNewOption
        );

    } else {

        targetSelect.appendChild(
            option
        );

    }


    /* Select new item */

    targetSelect.value =
        itemName;


    modal.remove();


    alert(
        `"${itemName}" Inventoryಗೆ successfully added.`
    );

}


/* =========================================================
   AUTO ENABLE
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        enableServiceInventoryQuickAdd
    );

} else {

    enableServiceInventoryQuickAdd();

}