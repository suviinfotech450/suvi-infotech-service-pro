/* =========================================================
   SUVI INFOTECH
   INVENTORY BULK MANAGEMENT
   ========================================================= */

(function () {

    const ITEMS_KEY = "SUVI_FRESH_ITEMS";

    let selectedItems = new Set();


    /* =====================================================
       LOCAL STORAGE
       ===================================================== */

    function getItems() {

        try {
            return JSON.parse(
                localStorage.getItem(ITEMS_KEY)
            ) || [];
        } catch (e) {
            return [];
        }

    }


    function saveItems(list) {

        localStorage.setItem(
            ITEMS_KEY,
            JSON.stringify(list)
        );

    }


    /* =====================================================
       FIREBASE
       ===================================================== */

    async function getFirebase() {

        const {
            initializeApp,
            getApps
        } =
            await import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"
            );

        const {
            getFirestore,
            doc,
            writeBatch,
            setDoc,
            deleteDoc
        } =
            await import(
                "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
            );


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


        const app =
            getApps().length
                ? getApps()[0]
                : initializeApp(firebaseConfig);


        const db =
            getFirestore(app);


        return {
            db,
            doc,
            writeBatch,
            setDoc,
            deleteDoc
        };

    }


    function safeId(value) {

        return String(value || "")
            .trim()
            .replace(/[^a-zA-Z0-9_-]/g, "_")
            .substring(0, 120);

    }


    /* =====================================================
       FIREBASE UPDATE
       ===================================================== */

    async function firebaseUpdate(items) {

        if (!items.length)
            return;


        try {

            const {
                db,
                doc,
                writeBatch
            } =
                await getFirebase();


            for (
                let start = 0;
                start < items.length;
                start += 450
            ) {

                const batch =
                    writeBatch(db);


                const part =
                    items.slice(
                        start,
                        start + 450
                    );


                part.forEach(item => {

                    const firestoreId =
                        safeId(
                            item.code ||
                            item.id
                        );


                    const ref =
                        doc(
                            db,
                            "items",
                            firestoreId
                        );


                    batch.set(
                        ref,
                        item,
                        {
                            merge: true
                        }
                    );

                });


                await batch.commit();

            }

        } catch (error) {

            console.error(
                "Firebase bulk update error:",
                error
            );

            throw error;

        }

    }


    /* =====================================================
       FIREBASE DELETE
       ===================================================== */

    async function firebaseDelete(items) {

        if (!items.length)
            return;


        try {

            const {
                db,
                doc,
                writeBatch
            } =
                await getFirebase();


            for (
                let start = 0;
                start < items.length;
                start += 450
            ) {

                const batch =
                    writeBatch(db);


                const part =
                    items.slice(
                        start,
                        start + 450
                    );


                part.forEach(item => {

                    const firestoreId =
                        safeId(
                            item.code ||
                            item.id
                        );


                    batch.delete(
                        doc(
                            db,
                            "items",
                            firestoreId
                        )
                    );

                });


                await batch.commit();

            }

        } catch (error) {

            console.error(
                "Firebase bulk delete error:",
                error
            );

            throw error;

        }

    }


    /* =====================================================
       ADD BULK TOOLBAR
       ===================================================== */

    function addToolbar() {

        if (
            document.getElementById(
                "inventoryBulkToolbar"
            )
        )
            return;


        const table =
            document.getElementById(
                "itemTable"
            );


        if (!table)
            return;


        const toolbar =
            document.createElement(
                "div"
            );


        toolbar.id =
            "inventoryBulkToolbar";


        toolbar.style.cssText = `
            display:flex;
            gap:10px;
            flex-wrap:wrap;
            align-items:center;
            margin:12px 0;
            padding:10px;
            background:#f4f8fc;
            border-radius:10px;
        `;


        toolbar.innerHTML = `

            <label style="
                display:flex;
                align-items:center;
                gap:6px;
                font-weight:700;
            ">

                <input
                    type="checkbox"
                    id="bulkSelectAll"
                >

                Select All

            </label>


            <button
                type="button"
                id="bulkUpdateBtn"
                class="action-btn"
            >
                ✏️ Bulk Update
            </button>


            <button
                type="button"
                id="bulkDeleteBtn"
                class="action-btn danger-btn"
            >
                🗑 Bulk Delete
            </button>


            <span
                id="bulkSelectedCount"
                style="
                    font-weight:700;
                    margin-left:5px;
                "
            >
                0 selected
            </span>

        `;


        table.parentElement.insertBefore(
            toolbar,
            table
        );


        document
            .getElementById("bulkSelectAll")
            .addEventListener(
                "change",
                function () {

                    const boxes =
                        document.querySelectorAll(
                            ".bulk-item-check"
                        );


                    boxes.forEach(box => {

                        box.checked =
                            this.checked;

                        if (this.checked)
                            selectedItems.add(
                                box.dataset.id
                            );
                        else
                            selectedItems.delete(
                                box.dataset.id
                            );

                    });


                    updateSelectedCount();

                }
            );


        document
            .getElementById("bulkUpdateBtn")
            .addEventListener(
                "click",
                openBulkUpdate
            );


        document
            .getElementById("bulkDeleteBtn")
            .addEventListener(
                "click",
                bulkDelete
            );

    }


    /* =====================================================
       CHECKBOXES
       ===================================================== */

    function addCheckboxes() {

        const table =
            document.getElementById(
                "itemTable"
            );


        if (!table)
            return;


        const head =
            table.querySelector(
                "thead tr"
            );


        if (head) {

            if (
                !head.querySelector(
                    ".bulk-select-head"
                )
            ) {

                const th =
                    document.createElement(
                        "th"
                    );


                th.className =
                    "bulk-select-head";


                th.textContent =
                    "Select";


                head.insertBefore(
                    th,
                    head.firstElementChild
                );

            }

        }


        const body =
            document.getElementById(
                "itemBody"
            );


        if (!body)
            return;


        body.querySelectorAll(
            "tr"
        ).forEach(row => {

            if (
                row.querySelector(
                    ".bulk-item-check"
                )
            )
                return;


            const cells =
                row.querySelectorAll(
                    "td"
                );


            if (!cells.length)
                return;


            const code =
    cells[0]?.textContent
        ?.trim();


            if (!code)
                return;


            const items =
                getItems();


            const item =
                items.find(
                    x =>
                        String(x.code)
                            .trim() ===
                        code
                );


            if (!item)
                return;


            const td =
                document.createElement(
                    "td"
                );


            td.innerHTML = `

                <input
                    type="checkbox"
                    class="bulk-item-check"
                    data-id="${item.id}"
                >

            `;


            row.insertBefore(
                td,
                row.firstElementChild
            );


            const checkbox =
                td.querySelector(
                    ".bulk-item-check"
                );


            checkbox.checked =
                selectedItems.has(
                    String(item.id)
                );


            checkbox.addEventListener(
                "change",
                function () {

                    const id =
                        String(
                            this.dataset.id
                        );


                    if (this.checked)
                        selectedItems.add(id);
                    else
                        selectedItems.delete(id);


                    updateSelectedCount();

                }
            );

        });


        updateSelectedCount();

    }


    /* =====================================================
       SELECTED COUNT
       ===================================================== */

    function updateSelectedCount() {

        const el =
            document.getElementById(
                "bulkSelectedCount"
            );


        if (el) {

            el.textContent =
                selectedItems.size +
                " selected";

        }

    }


    /* =====================================================
       BULK UPDATE
       ===================================================== */

    function openBulkUpdate() {

        if (!selectedItems.size) {

            alert(
                "Please select at least one item."
            );

            return;

        }


        if (
            document.getElementById(
                "bulkUpdateModal"
            )
        )
            return;


        const modal =
            document.createElement(
                "div"
            );


        modal.id =
            "bulkUpdateModal";


        modal.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,.55);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:99999;
            padding:20px;
        `;


        modal.innerHTML = `

            <div style="
                width:min(500px,100%);
                background:white;
                border-radius:16px;
                padding:22px;
                box-shadow:0 20px 60px rgba(0,0,0,.3);
            ">

                <h2 style="margin-top:0">
                    Bulk Update Items
                </h2>

                <p>
                    ${selectedItems.size}
                    item(s) selected.
                </p>


                <div style="
                    display:grid;
                    gap:12px;
                ">

                    <input
                        id="bulkHSN"
                        placeholder="HSN (leave blank = unchanged)"
                    >

                    <input
                        id="bulkUnit"
                        placeholder="Unit (leave blank = unchanged)"
                    >

                    <input
                        id="bulkPurchaseRate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Purchase Rate (blank = unchanged)"
                    >

                    <input
                        id="bulkSaleRate"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Sale Rate (blank = unchanged)"
                    >

                    <input
                        id="bulkStock"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Stock (blank = unchanged)"
                    >

                    <input
                        id="bulkMinStock"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Minimum Stock (blank = unchanged)"
                    >

                </div>


                <div style="
                    display:flex;
                    gap:10px;
                    justify-content:flex-end;
                    margin-top:18px;
                ">

                    <button
                        type="button"
                        id="bulkCancelBtn"
                        class="action-btn"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        id="bulkSaveBtn"
                        class="action-btn"
                    >
                        💾 Update
                    </button>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );


        document
            .getElementById(
                "bulkCancelBtn"
            )
            .onclick =
                () => modal.remove();


        document
            .getElementById(
                "bulkSaveBtn"
            )
            .onclick =
                saveBulkUpdate;

    }


    /* =====================================================
       SAVE BULK UPDATE
       ===================================================== */

    async function saveBulkUpdate() {

        const list =
            getItems();


        const hsn =
            document.getElementById(
                "bulkHSN"
            ).value.trim();


        const unit =
            document.getElementById(
                "bulkUnit"
            ).value.trim();


        const purchase =
            document.getElementById(
                "bulkPurchaseRate"
            ).value;


        const sale =
            document.getElementById(
                "bulkSaleRate"
            ).value;


        const stock =
            document.getElementById(
                "bulkStock"
            ).value;


        const minStock =
            document.getElementById(
                "bulkMinStock"
            ).value;


        const changed =
            [];


        list.forEach(item => {

            if (
                !selectedItems.has(
                    String(item.id)
                )
            )
                return;


            if (hsn !== "")
                item.hsn = hsn;


            if (unit !== "")
                item.unit = unit;


            if (purchase !== "")
                item.purchaseRate =
                    Number(purchase);


            if (sale !== "")
                item.saleRate =
                    Number(sale);


            if (stock !== "")
                item.stock =
                    Number(stock);


            if (minStock !== "")
                item.minStock =
                    Number(minStock);


            changed.push(item);

        });


        if (!changed.length) {

            alert(
                "No items selected."
            );

            return;

        }


        const saveBtn =
            document.getElementById(
                "bulkSaveBtn"
            );


        saveBtn.disabled = true;


        try {

            /* Local save first */

            saveItems(list);


            /* Firebase */

            await firebaseUpdate(
                changed
            );


            selectedItems.clear();


            document
                .getElementById(
                    "bulkUpdateModal"
                )
                ?.remove();


            if (
                typeof window.renderAll ===
                "function"
            )
                window.renderAll();
            else if (
                typeof window.renderItems ===
                "function"
            )
                window.renderItems();


            alert(
                "Bulk update completed successfully.\n\n" +
                "Updated: " +
                changed.length
            );


        } catch (error) {

            console.error(error);


            alert(
                "Local update saved, but Firebase update failed.\n\n" +
                error.message
            );


        } finally {

            saveBtn.disabled = false;

        }

    }


    /* =====================================================
       BULK DELETE
       ===================================================== */

    async function bulkDelete() {

        if (!selectedItems.size) {

            alert(
                "Please select at least one item."
            );

            return;

        }


        const list =
            getItems();


        const selected =
            list.filter(
                item =>
                    selectedItems.has(
                        String(item.id)
                    )
            );


        if (!selected.length)
            return;


        const ok =
            confirm(
                "Delete " +
                selected.length +
                " selected item(s)?\n\n" +
                "This will remove them from Item Master and Firebase."
            );


        if (!ok)
            return;


        try {

            /* Local delete */

            const remaining =
                list.filter(
                    item =>
                        !selectedItems.has(
                            String(item.id)
                        )
                );


            saveItems(
                remaining
            );


            /* Firebase delete */

            await firebaseDelete(
                selected
            );


            selectedItems.clear();


            if (
                typeof window.renderAll ===
                "function"
            )
                window.renderAll();
            else if (
                typeof window.renderItems ===
                "function"
            )
                window.renderItems();


            updateSelectedCount();


            alert(
                "Bulk delete completed successfully.\n\n" +
                "Deleted: " +
                selected.length
            );


        } catch (error) {

            console.error(error);


            alert(
                "Local items were deleted, but Firebase delete failed.\n\n" +
                error.message
            );

        }

    }


    /* =====================================================
       HOOK EXISTING renderItems()
       ===================================================== */

    function hookRenderItems() {

        if (
            typeof window.renderItems !==
            "function"
        )
            return false;


        if (
            window.renderItems.__bulkHooked
        )
            return true;


        const originalRender =
            window.renderItems;


        function wrappedRender() {

            originalRender();


            setTimeout(
                function () {

                    addCheckboxes();

                },
                0
            );

        }


        wrappedRender.__bulkHooked =
            true;


        window.renderItems =
            wrappedRender;


        return true;

    }


    /* =====================================================
       INIT
       ===================================================== */

    function initBulk() {

        addToolbar();

        hookRenderItems();

        setTimeout(
            function () {

                addCheckboxes();

            },
            100
        );

    }


    document.addEventListener(
        "DOMContentLoaded",
        initBulk
    );


})();