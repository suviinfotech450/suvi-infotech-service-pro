/* =====================================================
   INVENTORY TABLE LEFT / RIGHT SCROLL BUTTONS
   ===================================================== */

(function () {

    function setupTableScrollButtons() {

        const table = document.getElementById("itemTable");
        if (!table) return;

        const wrapper = table.closest(".table-wrapper");
        if (!wrapper) return;

        // Already added
        if (document.getElementById("inventoryLeftScrollBtn")) return;

        /* Scroll buttons */
        const leftBtn = document.createElement("button");
        leftBtn.id = "inventoryLeftScrollBtn";
        leftBtn.type = "button";
        leftBtn.innerHTML = "‹";

        const rightBtn = document.createElement("button");
        rightBtn.id = "inventoryRightScrollBtn";
        rightBtn.type = "button";
        rightBtn.innerHTML = "›";

        /* Button styling */
        const style = document.createElement("style");

        style.textContent = `
            #inventoryLeftScrollBtn,
            #inventoryRightScrollBtn {
                width: 42px;
                height: 38px;
                border: none;
                border-radius: 8px;
                font-size: 28px;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-left: 8px;
                line-height: 1;
            }

            #inventoryLeftScrollBtn {
                background: #e8f1ff;
                color: #1264a3;
            }

            #inventoryRightScrollBtn {
                background: #e8f1ff;
                color: #1264a3;
            }

            #inventoryLeftScrollBtn:hover,
            #inventoryRightScrollBtn:hover {
                transform: scale(1.05);
            }

            .inventory-scroll-controls {
                display: inline-flex;
                align-items: center;
                margin-left: 12px;
            }
        `;

        document.head.appendChild(style);

        /* Controls container */
        const controls = document.createElement("div");
        controls.className = "inventory-scroll-controls";

        controls.appendChild(leftBtn);
        controls.appendChild(rightBtn);

        /*
           Put buttons in the bulk-action row.
           Find the row just before the table.
        */
        let bulkRow = null;

        const possibleRows = wrapper.parentElement.querySelectorAll(
            "div"
        );

        for (const el of possibleRows) {

            const text = (el.innerText || "").toLowerCase();

            if (
                text.includes("select all") &&
                text.includes("bulk update") &&
                text.includes("bulk delete")
            ) {
                bulkRow = el;
                break;
            }
        }

        if (bulkRow) {
            bulkRow.appendChild(controls);
        } else {
            /*
               Fallback:
               put controls immediately above table
            */
            wrapper.parentElement.insertBefore(
                controls,
                wrapper
            );
        }

        /* LEFT */
        leftBtn.addEventListener("click", function () {

            wrapper.scrollBy({
                left: -500,
                behavior: "smooth"
            });

        });

        /* RIGHT */
        rightBtn.addEventListener("click", function () {

            wrapper.scrollBy({
                left: 500,
                behavior: "smooth"
            });

        });

    }

    /*
       Wait because Bulk row is created
       by another inventory JS file.
    */
    document.addEventListener("DOMContentLoaded", function () {

        setupTableScrollButtons();

        setTimeout(setupTableScrollButtons, 500);
        setTimeout(setupTableScrollButtons, 1500);
        setTimeout(setupTableScrollButtons, 3000);

    });

})();