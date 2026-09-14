/* =========================================================
   SUVI INFOTECH
   INVENTORY TABLE - SAFE ALIGNMENT FIX
   ---------------------------------------------------------
   Select | Code | Item Name | HSN | Unit |
   Purchase Rate | Sale Rate | Qty / Stock | Min |
   Barcode | Actions

   - Correct column alignment
   - Item Name wider
   - Horizontal slide/scroll
   - F5 refresh ನಂತರವೂ same alignment
   - No MutationObserver
   - No Infinite Loop
   - No duplicate CSS override
   ========================================================= */

(function () {
    "use strict";

    function fixInventoryTable() {

        const table = document.getElementById("itemTable");

        if (!table) return;

        /* =================================================
           TABLE
           ================================================= */

        table.style.width = "100%";

        /* Total column width is more than 1180px.
           Keep horizontal scrolling available. */
        table.style.minWidth = "1265px";

        table.style.tableLayout = "fixed";
        table.style.borderCollapse = "collapse";


        /* =================================================
           COLUMN WIDTHS

           1  Select
           2  Code
           3  Item Name
           4  HSN
           5  Unit
           6  Purchase Rate
           7  Sale Rate
           8  Qty / Stock
           9  Min
           10 Barcode
           11 Actions
           ================================================= */

        const widths = [
            "60px",    // Select
            "90px",    // Code
            "300px",   // Item Name
            "80px",    // HSN
            "75px",    // Unit
            "120px",   // Purchase Rate
            "110px",   // Sale Rate
            "100px",   // Qty / Stock
            "70px",    // Min
            "160px",   // Barcode
            "100px"    // Actions
        ];


        /* =================================================
           ROW / CELL ALIGNMENT
           ================================================= */

        table.querySelectorAll("tr").forEach(row => {

            const cells = row.children;

            for (let i = 0; i < cells.length; i++) {

                const cell = cells[i];

                cell.style.boxSizing = "border-box";

                cell.style.padding = "9px 8px";

                cell.style.height = "50px";

                cell.style.verticalAlign = "middle";

                cell.style.overflow = "hidden";

                cell.style.textOverflow = "ellipsis";


                /* =========================================
                   ITEM NAME
                   ========================================= */

                if (i === 2) {

                    cell.style.whiteSpace = "normal";

                    cell.style.textAlign = "left";

                    cell.style.wordBreak = "break-word";

                    cell.style.overflowWrap = "break-word";

                    cell.style.fontWeight = "600";

                } else {

                    cell.style.whiteSpace = "nowrap";
                }


                /* =========================================
                   WIDTH
                   ========================================= */

                if (widths[i]) {

                    cell.style.width = widths[i];

                    cell.style.minWidth = widths[i];

                }


                /* =========================================
                   SELECT
                   ========================================= */

                if (i === 0) {

                    cell.style.textAlign = "center";
                }


                /* =========================================
                   CODE
                   ========================================= */

                if (i === 1) {

                    cell.style.textAlign = "center";
                }


                /* =========================================
                   ITEM NAME
                   ========================================= */

                if (i === 2) {

                    cell.style.textAlign = "left";
                }


                /* =========================================
                   HSN
                   ========================================= */

                if (i === 3) {

                    cell.style.textAlign = "center";
                }


                /* =========================================
                   UNIT
                   ========================================= */

                if (i === 4) {

                    cell.style.textAlign = "center";
                }


                /* =========================================
                   PURCHASE / SALE RATE
                   ========================================= */

                if (i === 5 || i === 6) {

                    cell.style.textAlign = "right";
                }


                /* =========================================
                   QTY / MIN
                   ========================================= */

                if (i === 7 || i === 8) {

                    cell.style.textAlign = "center";
                }


                /* =========================================
                   BARCODE
                   ========================================= */

                if (i === 9) {

                    cell.style.textAlign = "center";
                }


                /* =========================================
                   ACTIONS
                   ========================================= */

                if (i === 10) {

                    cell.style.textAlign = "center";
                }
            }
        });


        /* =================================================
           HEADER TEXT
           ================================================= */

        const headers = table.querySelectorAll("thead th");

        const names = [
            "Select",
            "Code",
            "Item Name",
            "HSN",
            "Unit",
            "Purchase Rate",
            "Sale Rate",
            "Qty / Stock",
            "Min",
            "Barcode",
            "Actions"
        ];


        headers.forEach((th, i) => {

            if (!names[i]) return;


            /* Keep correct header name */

            if (th.textContent.trim() !== names[i]) {

                th.textContent = names[i];
            }


            th.title = names[i];


            /* Header styling */

            th.style.height = "52px";

            th.style.padding = "10px 8px";

            th.style.whiteSpace = "nowrap";

            th.style.overflow = "hidden";

            th.style.textOverflow = "ellipsis";

            th.style.verticalAlign = "middle";

            th.style.textAlign = "center";

            th.style.fontSize = "15px";

            th.style.fontWeight = "700";

            th.style.boxSizing = "border-box";


            /* Same width as body */

            if (widths[i]) {

                th.style.width = widths[i];

                th.style.minWidth = widths[i];
            }
        });


        /* =================================================
           CHECKBOX
           ================================================= */

        table.querySelectorAll(
            'input[type="checkbox"]'
        ).forEach(box => {

            box.style.width = "18px";

            box.style.height = "18px";

            box.style.margin = "0 auto";

            box.style.display = "block";
        });


        /* =================================================
           TABLE WRAPPER
           ================================================= */

        const wrapper =
            table.closest(".table-wrapper") ||
            table.closest(".table-container");


        if (wrapper) {

            wrapper.style.width = "100%";

            wrapper.style.maxWidth = "100%";

            /* Horizontal slide */

            wrapper.style.overflowX = "auto";

            /* Normal page vertical scroll */

            wrapper.style.overflowY = "visible";

            /* Smooth horizontal scrolling */

            wrapper.style.scrollBehavior = "smooth";

            /* Prevent wrapper from shrinking */

            wrapper.style.boxSizing = "border-box";
        }
    }


    /* =====================================================
       RUN ONCE AFTER PAGE LOAD
       ===================================================== */

    function startFix() {

        fixInventoryTable();
    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            startFix,
            { once: true }
        );

    } else {

        startFix();
    }

})();