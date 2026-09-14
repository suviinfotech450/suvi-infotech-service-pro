/* SUVI INFOTECH - Inventory Display Fix */

(function () {

    function fixItemTable() {

        const table = document.getElementById("itemTable");
        const body = document.getElementById("itemBody");

        if (!table || !body) return;

        const items =
            JSON.parse(
                localStorage.getItem("SUVI_FRESH_ITEMS")
            ) || [];

        const search =
            (document.getElementById("itemSearch")?.value || "")
                .trim()
                .toLowerCase();

        const list = items
            .filter(item =>
                [
                    item.code,
                    item.name,
                    item.hsn,
                    item.barcode
                ]
                .join(" ")
                .toLowerCase()
                .includes(search)
            )
            .sort((a, b) =>
                String(a.code || "")
                    .localeCompare(
                        String(b.code || ""),
                        undefined,
                        { numeric: true }
                    )
            );

        table.querySelector("thead tr").innerHTML = `
            <th>Select</th>
            <th>Code</th>
            <th>Item Name</th>
            <th>HSN</th>
            <th>Unit</th>
            <th>Purchase Rate</th>
            <th>Sale Rate</th>
            <th>Qty / Stock</th>
            <th>Min</th>
            <th>Barcode</th>
            <th>Actions</th>
        `;

        body.innerHTML = list.map(item => `
            <tr>

                <td>
                    <input
                        type="checkbox"
                        class="bulk-item-check"
                        data-id="${item.id}"
                    >
                </td>

                <td>${esc(item.code || "-")}</td>

                <td>
                    <b>${esc(item.name || "-")}</b>
                </td>

                <td>${esc(item.hsn || item.hsnCode || "-")}</td>

                <td>${esc(item.unit || "Nos")}</td>

                <td>${money(item.purchaseRate)}</td>

                <td>${money(item.saleRate)}</td>

                <td>${Number(item.stock) || 0}</td>

                <td>${Number(item.minStock) || 0}</td>

                <td>${esc(item.barcode || "-")}</td>

                <td>
                    <button
                        class="action-btn"
                        onclick='printBarcode(${JSON.stringify(item.id)})'>
                        Barcode
                    </button>

                    <button
                        class="action-btn"
                        onclick='editItem(${JSON.stringify(item.id)})'>
                        Edit
                    </button>

                    <button
                        class="action-btn danger-btn"
                        onclick='deleteItem(${JSON.stringify(item.id)})'>
                        Delete
                    </button>
                </td>

            </tr>
        `).join("");

        if (!list.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="11" class="empty">
                        No items found.
                    </td>
                </tr>
            `;
        }

        document
            .querySelectorAll(".bulk-item-check")
            .forEach(box => {

                box.addEventListener("change", function () {

                    if (
                        typeof selectedItems !== "undefined"
                    ) {
                        if (this.checked)
                            selectedItems.add(
                                String(this.dataset.id)
                            );
                        else
                            selectedItems.delete(
                                String(this.dataset.id)
                            );
                    }

                });

            });

    }


    window.refreshInventoryItemDisplay =
        fixItemTable;


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                fixItemTable,
                300
            );

        }
    );

})();