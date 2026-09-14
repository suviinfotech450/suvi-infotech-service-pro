/* =========================================================
   SUVI INFOTECH
   INVENTORY ITEM MASTER PAGINATION
   50 / 100 ITEMS PER PAGE
   Horizontal scrollbar preserved
   Does NOT modify inventory.js
   ========================================================= */

(function () {
    "use strict";

    let currentPage = 1;
    let pageSize = 50;

    function getTable() {
        return document.getElementById("itemTable");
    }

    function getBody() {
        return document.getElementById("itemBody");
    }

    function getRows() {
        const body = getBody();

        if (!body) return [];

        return Array.from(body.querySelectorAll("tr"))
            .filter(row => !row.querySelector(".empty"));
    }

    function createControls() {

        const table = getTable();

        if (!table) return;

        let controls =
            document.getElementById("inventoryPagination");

        if (controls) return;

        controls = document.createElement("div");
        controls.id = "inventoryPagination";

        controls.innerHTML = `
            <div class="inv-page-left">
                <span>Items per page:</span>

                <select id="invPageSize">
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>

                <span id="invPageInfo">
                    Page 1
                </span>
            </div>

            <div class="inv-page-buttons">
                <button type="button" id="invPrev">
                    ← Previous
                </button>

                <button type="button" id="invNext">
                    Next →
                </button>
            </div>
        `;

        const parent = table.parentElement;

        if (parent) {
            parent.appendChild(controls);
        }

        document
            .getElementById("invPageSize")
            .addEventListener("change", function () {

                pageSize = Number(this.value);
                currentPage = 1;

                applyPagination();
            });

        document
            .getElementById("invPrev")
            .addEventListener("click", function () {

                if (currentPage > 1) {
                    currentPage--;
                    applyPagination();
                }
            });

        document
            .getElementById("invNext")
            .addEventListener("click", function () {

                const rows = getRows();

                const totalPages =
                    Math.max(1, Math.ceil(rows.length / pageSize));

                if (currentPage < totalPages) {
                    currentPage++;
                    applyPagination();
                }
            });
    }

    function applyPagination() {

        const rows = getRows();

        createControls();

        const totalItems = rows.length;

        const totalPages =
            Math.max(1, Math.ceil(totalItems / pageSize));

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const start =
            (currentPage - 1) * pageSize;

        const end =
            start + pageSize;

        rows.forEach((row, index) => {

            row.style.display =
                index >= start && index < end
                    ? ""
                    : "none";
        });

        const info =
            document.getElementById("invPageInfo");

        if (info) {

            if (totalItems === 0) {
                info.textContent = "No items";
            } else {

                const showingStart = start + 1;

                const showingEnd =
                    Math.min(end, totalItems);

                info.textContent =
                    `Showing ${showingStart}-${showingEnd} of ${totalItems} | Page ${currentPage} of ${totalPages}`;
            }
        }

        const prev =
            document.getElementById("invPrev");

        const next =
            document.getElementById("invNext");

        if (prev) {
            prev.disabled =
                currentPage <= 1;
        }

        if (next) {
            next.disabled =
                currentPage >= totalPages;
        }
    }

    function addStyles() {

        if (document.getElementById("inventory-pagination-style")) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "inventory-pagination-style";

        style.textContent = `

            #inventoryPagination {
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                padding:14px 16px;
                margin-top:10px;
                background:#f5f9ff;
                border:1px solid #d8e4f2;
                border-radius:10px;
                box-sizing:border-box;
                width:100%;
                flex-wrap:wrap;
            }

            .inv-page-left {
                display:flex;
                align-items:center;
                gap:10px;
                font-size:14px;
                font-weight:600;
                white-space:nowrap;
            }

            #invPageSize {
                height:36px;
                min-width:70px;
                padding:4px 8px;
                border:1px solid #c7d7e8;
                border-radius:7px;
                background:#fff;
                font-size:14px;
                cursor:pointer;
            }

            #invPageInfo {
                margin-left:8px;
                font-weight:600;
            }

            .inv-page-buttons {
                display:flex;
                gap:8px;
            }

            .inv-page-buttons button {
                min-width:105px;
                height:36px;
                padding:0 14px;
                border:1px solid #c7d7e8;
                border-radius:7px;
                background:#fff;
                font-weight:600;
                cursor:pointer;
            }

            .inv-page-buttons button:hover:not(:disabled) {
                background:#eaf3ff;
            }

            .inv-page-buttons button:disabled {
                opacity:.45;
                cursor:not-allowed;
            }

            /* KEEP HORIZONTAL SLIDE */
            #itemMasterTab .table-wrapper,
            #itemMasterTab .table-container {
                width:100%;
                max-width:100%;
                overflow-x:auto !important;
                overflow-y:visible !important;
            }

            #itemMasterTab #itemTable {
                min-width:1180px;
            }

            @media(max-width:700px) {

                #inventoryPagination {
                    align-items:flex-start;
                    flex-direction:column;
                }

                .inv-page-buttons {
                    width:100%;
                }

                .inv-page-buttons button {
                    flex:1;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function setup() {

        addStyles();

        createControls();

        applyPagination();
    }

    function hookRenderItems() {

        if (
            typeof window.renderItems !== "function" ||
            window.renderItems.__paginationFixed
        ) {
            return;
        }

        const originalRender =
            window.renderItems;

        function paginatedRender() {

            originalRender();

            currentPage = 1;

            requestAnimationFrame(function () {
                applyPagination();
            });
        }

        paginatedRender.__paginationFixed = true;

        window.renderItems =
            paginatedRender;
    }

    function start() {

        hookRenderItems();

        setTimeout(function () {
            hookRenderItems();
            setup();
        }, 200);

        setTimeout(function () {
            hookRenderItems();
            applyPagination();
        }, 500);
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            start,
            { once:true }
        );

    } else {

        start();
    }

})();