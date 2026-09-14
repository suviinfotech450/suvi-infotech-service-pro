/* =========================================================
   SUVI INFOTECH INVENTORY - FINAL TABLE ALIGNMENT FIX
   Do NOT add/remove table columns.
   Existing inventory-bulk.js handles Select column.
   ========================================================= */

(function () {

    function fixInventoryTable() {

        const table = document.getElementById("itemTable");

        if (!table) return;

        /* -------------------------------------------------
           REMOVE DUPLICATE SELECT HEADER
           Keep only ONE bulk select header.
           ------------------------------------------------- */

        const headers = table.querySelectorAll("thead tr th");

        if (headers.length > 11) {

            const selectHeaders =
                Array.from(headers).filter(th =>
                    th.textContent.trim().toLowerCase() === "select"
                );

            /* Keep the first Select header only */
            selectHeaders.slice(1).forEach(th => th.remove());
        }


        /* -------------------------------------------------
           FIX ROWS
           Existing inventory-bulk.js already creates
           checkbox as first column.
           ------------------------------------------------- */

        const body = document.getElementById("itemBody");

        if (!body) return;


        /* -------------------------------------------------
           TABLE ALIGNMENT
           ------------------------------------------------- */

        let style =
            document.getElementById("finalInventoryTableCSS");

        if (!style) {

            style = document.createElement("style");
            style.id = "finalInventoryTableCSS";

            style.textContent = `

                #itemTable {
                    width:100%;
                    min-width:1450px;
                    border-collapse:collapse;
                    table-layout:fixed;
                }

                #itemTable th,
                #itemTable td {
                    height:52px;
                    padding:12px 10px;
                    vertical-align:middle;
                    box-sizing:border-box;
                    white-space:nowrap;
                    overflow:hidden;
                    text-overflow:ellipsis;
                }

                #itemTable th {
                    background:#eef6ff;
                    font-weight:800;
                    text-align:center;
                }

                /* 1 - Select */
                #itemTable th:nth-child(1),
                #itemTable td:nth-child(1) {
                    width:70px;
                    text-align:center;
                }

                /* 2 - Code */
                #itemTable th:nth-child(2),
                #itemTable td:nth-child(2) {
                    width:105px;
                    text-align:center;
                }

                /* 3 - Item Name */
                #itemTable th:nth-child(3),
                #itemTable td:nth-child(3) {
                    width:300px;
                    text-align:left;
                }

                /* 4 - HSN */
                #itemTable th:nth-child(4),
                #itemTable td:nth-child(4) {
                    width:100px;
                    text-align:center;
                }

                /* 5 - Unit */
                #itemTable th:nth-child(5),
                #itemTable td:nth-child(5) {
                    width:85px;
                    text-align:center;
                }

                /* 6 - Purchase Rate */
                #itemTable th:nth-child(6),
                #itemTable td:nth-child(6) {
                    width:135px;
                    text-align:right;
                }

                /* 7 - Sale Rate */
                #itemTable th:nth-child(7),
                #itemTable td:nth-child(7) {
                    width:125px;
                    text-align:right;
                }

                /* 8 - Qty / Stock */
                #itemTable th:nth-child(8),
                #itemTable td:nth-child(8) {
                    width:105px;
                    text-align:center;
                }

                /* 9 - Min */
                #itemTable th:nth-child(9),
                #itemTable td:nth-child(9) {
                    width:80px;
                    text-align:center;
                }

                /* 10 - Barcode */
                #itemTable th:nth-child(10),
                #itemTable td:nth-child(10) {
                    width:180px;
                    text-align:center;
                }

                /* 11 - Actions */
                #itemTable th:nth-child(11),
                #itemTable td:nth-child(11) {
                    width:200px;
                    text-align:center;
                }

                /* Checkbox */
                #itemTable input[type="checkbox"] {
                    width:18px;
                    height:18px;
                    margin:0 auto;
                    vertical-align:middle;
                }

                /* Item name */
                #itemTable td:nth-child(3) {
                    font-weight:600;
                }

                /* Mobile */
                @media(max-width:900px) {

                    #itemTable {
                        min-width:1450px;
                    }

                    #itemTable th,
                    #itemTable td {
                        height:50px;
                        padding:11px 9px;
                    }
                }

            `;

            document.head.appendChild(style);
        }

    }


    function startFix() {

        fixInventoryTable();

        /* inventory-bulk.js may add its Select
           column after page load */
        setTimeout(fixInventoryTable, 300);
        setTimeout(fixInventoryTable, 800);
        setTimeout(fixInventoryTable, 1500);
        setTimeout(fixInventoryTable, 2500);

    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            startFix
        );

    } else {

        startFix();

    }

})();