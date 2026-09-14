"use strict";

const SALES_KEY = "suviInfotechSalesBills";
const PURCHASE_KEY = "suviInfotechPurchaseBills";
const SETTINGS_KEY = "suviInfotechGSTSettings";

let salesData = [];
let purchaseData = [];

let filteredSales = [];
let filteredPurchases = [];


/* =========================
   BASIC HELPERS
========================= */

function readArray(key) {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(key) || "[]"
            );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.error(
            "GST data read error:",
            key,
            error
        );

        return [];

    }

}


function money(value) {

    return "₹" +
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}

function formatDate(value) {

    if (!value) return "";

    const text = String(value).trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
        return text;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return text.slice(0, 10);
    }

    return `${date.getFullYear()}-${String(
        date.getMonth() + 1
    ).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, function(char) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            }[char];

        });

}


/* =========================
   SETTINGS
========================= */

function loadGSTSettings() {

    let settings = {};

    try {

        settings =
            JSON.parse(
                localStorage.getItem(
                    SETTINGS_KEY
                ) || "{}"
            );

    } catch (error) {

        settings = {};

    }

const selectedFirm =
    localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM")
    || "SUVI INFOTECH";

document.getElementById("businessName").value =
    selectedFirm.trim();
    if (settings.gstin) {

        document.getElementById(
            "gstin"
        ).value = settings.gstin;

    }

    if (settings.businessState) {

        document.getElementById(
            "businessState"
        ).value = settings.businessState;

    }

    if (settings.defaultSaleType) {

        document.getElementById(
            "defaultSaleType"
        ).value =
            settings.defaultSaleType;

    }

}


function saveGSTSettings() {

    const settings = {

        businessName:
            document.getElementById(
                "businessName"
            ).value.trim(),

        gstin:
            document.getElementById(
                "gstin"
            ).value.trim().toUpperCase(),

        businessState:
            document.getElementById(
                "businessState"
            ).value,

        defaultSaleType:
            document.getElementById(
                "defaultSaleType"
            ).value

    };

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

    alert("GST Settings saved successfully.");

}


/* =========================
   GST SPLIT
========================= */

function getSaleType() {

    let settings = {};

    try {

        settings =
            JSON.parse(
                localStorage.getItem(
                    SETTINGS_KEY
                ) || "{}"
            );

    } catch (error) {}

    return settings.defaultSaleType || "intra";

}


function calculateGST(record) {

    const taxable =
        Number(
            record.taxableAmount ||
            record.subTotal ||
            record.taxable ||
            0
        );

    const gst =
        Number(
            record.gstAmount ||
            record.taxAmount ||
            record.gst ||
            0
        );

    const type = getSaleType();

    if (type === "inter") {

        return {

            taxable: taxable,
            gst: gst,
            igst: gst,
            cgst: 0,
            sgst: 0

        };

    }

    return {

        taxable: taxable,
        gst: gst,
        igst: 0,
        cgst: gst / 2,
        sgst: gst / 2

    };

}


/* =========================
   PERIOD
========================= */

function setDefaultDates() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    document.getElementById(
        "fromDate"
    ).value =
        `${year}-${month}-01`;

    document.getElementById(
        "toDate"
    ).value =
        formatDate(now);

}


function applyPeriod() {

    const type =
        document.getElementById("periodType").value;

    const selected =
        document.getElementById("fromDate").value;

    // User selected date ಇದ್ದರೆ ಅದನ್ನೇ base date ಆಗಿ use ಮಾಡುತ್ತದೆ
    // ಇಲ್ಲದಿದ್ದರೆ today's date
    const base = selected
        ? new Date(selected + "T00:00:00")
        : new Date();

    let from;
    let to;

    if (type === "month") {

        // Selected month
        from = new Date(
            base.getFullYear(),
            base.getMonth(),
            1
        );

        to = new Date(
            base.getFullYear(),
            base.getMonth() + 1,
            0
        );

    }

    else if (type === "quarter") {

        // Selected date's quarter
        const quarter =
            Math.floor(base.getMonth() / 3);

        from = new Date(
            base.getFullYear(),
            quarter * 3,
            1
        );

        to = new Date(
            base.getFullYear(),
            quarter * 3 + 3,
            0
        );

    }

    else {

        // Financial Year: April to March
        if (base.getMonth() >= 3) {

            from = new Date(
                base.getFullYear(),
                3,
                1
            );

            to = new Date(
                base.getFullYear() + 1,
                2,
                31
            );

        } else {

            from = new Date(
                base.getFullYear() - 1,
                3,
                1
            );

            to = new Date(
                base.getFullYear(),
                2,
                31
            );
        }
    }

    function localDate(d) {

        return `${d.getFullYear()}-${String(
            d.getMonth() + 1
        ).padStart(2, "0")}-${String(
            d.getDate()
        ).padStart(2, "0")}`;
    }

    document.getElementById("fromDate").value =
        localDate(from);

    document.getElementById("toDate").value =
        localDate(to);

    loadPeriodData();
}
function changeReturnPage(type){

    const tabMap = {
        gstr1: "gstr1Tab",
        gstr3b: "gstr3bTab",
        gstr9: "gstr9Tab",
        reports: "reportsTab"
    };

    const tabId = tabMap[type];

    if(!tabId) return;

    document.querySelectorAll(".tab-content")
        .forEach(tab=>{
            tab.classList.toggle(
                "active",
                tab.id === tabId
            );
        });

    const tabs = document.querySelectorAll(".tab");

    tabs.forEach(tab=>{
        tab.classList.remove("active");
    });

    const tabNames = {
        gstr1: "GSTR-1",
        gstr3b: "GSTR-3B",
        gstr9: "GSTR-9",
        reports: "Reports / Export"
    };

    tabs.forEach(tab=>{
        if(tab.textContent.trim() === tabNames[type]){
            tab.classList.add("active");
        }
    });
}

function loadPeriodData() {

    const from =
        document.getElementById(
            "fromDate"
        ).value;

    const to =
        document.getElementById(
            "toDate"
        ).value;

    salesData =
        readArray(SALES_KEY);

    purchaseData =
        readArray(PURCHASE_KEY);

    filteredSales =
        salesData.filter(function(record) {

            const date =
                formatDate(
                    record.invoiceDate ||
                    record.date ||
                    record.createdAt
                );

            if (from && date < from)
                return false;

            if (to && date > to)
                return false;

            return true;

        });

    filteredPurchases =
        purchaseData.filter(function(record) {

            const date =
                formatDate(
                    record.invoiceDate ||
                    record.date ||
                    record.createdAt
                );

            if (from && date < from)
                return false;

            if (to && date > to)
                return false;

            return true;

        });

    renderAll();

}


/* =========================
   SUMMARY
========================= */

function renderSummary() {

    let taxable = 0;
    let gst = 0;
    let purchaseGST = 0;

    filteredSales.forEach(function(record) {

        const x =
            calculateGST(record);

        taxable += x.taxable;
        gst += x.gst;

    });

    filteredPurchases.forEach(function(record) {

        purchaseGST +=
            Number(
                record.gstAmount ||
                record.taxAmount ||
                record.gst ||
                0
            );

    });

    document.getElementById(
        "salesBills"
    ).textContent =
        filteredSales.length;

    document.getElementById(
        "purchaseBills"
    ).textContent =
        filteredPurchases.length;

    document.getElementById(
        "taxableSales"
    ).textContent =
        money(taxable);

    document.getElementById(
        "outputGST"
    ).textContent =
        money(gst);

    document.getElementById(
        "purchaseGST"
    ).textContent =
        money(purchaseGST);

    document.getElementById(
        "reportOutputGST"
    ).textContent =
        money(gst);

    document.getElementById(
        "reportPurchaseGST"
    ).textContent =
        money(purchaseGST);

    document.getElementById(
        "reportNetGST"
    ).textContent =
        money(gst - purchaseGST);

}


/* =========================
   GSTR-1
========================= */

function renderGSTR1(){

    const body =
        document.getElementById("gstr1Body");

    if(!body) return;

    if(!filteredSales.length){

        body.innerHTML =
            `<tr>
                <td colspan="12">
                    No GST sales found.
                </td>
            </tr>`;

        removeGSTR1Details();
        return;
    }

    /* =========================
       MAIN INVOICE TABLE
    ========================= */

    body.innerHTML =
        filteredSales.map(
            function(record,index){

                const x =
                    calculateGST(record);

                const total =
                    Number(
                        record.grandTotalAmount ||
                        record.totalAmount ||
                        record.grandTotal ||
                        x.taxable + x.gst
                    );

                const gstin =
                    record.customerGSTIN ||
                    record.customerGST ||
                    record.gstin ||
                    "";

                const type =
                    gstin
                    ? "B2B"
                    : "B2C";

                return `
                <tr>

                    <td>${index+1}</td>

                    <td>
                        ${escapeHTML(
                            formatDate(
                                record.invoiceDate ||
                                record.date ||
                                record.createdAt
                            )
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.invoiceNo || ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            record.customerName ||
                            record.customer ||
                            ""
                        )}
                    </td>

                    <td>
                        ${escapeHTML(gstin || "-")}
                    </td>

                    <td>
                        ${type}<br>
                        <small>
                            ${
                                x.igst > 0
                                ? "IGST"
                                : "CGST + SGST"
                            }
                        </small>
                    </td>

                    <td>${money(x.taxable)}</td>

                    <td>${money(x.igst)}</td>

                    <td>${money(x.cgst)}</td>

                    <td>${money(x.sgst)}</td>

                    <td>${money(x.gst)}</td>

                    <td>${money(total)}</td>

                </tr>
                `;
            }
        ).join("");

    renderGSTR1Details();
}


/* =========================
   GSTR-1 DETAILED REPORT
========================= */

function renderGSTR1Details(){

    removeGSTR1Details();

    const section =
        document.getElementById("gstr1Tab");

    if(!section) return;

    const box =
        document.createElement("div");

    box.id = "gstr1Details";

    box.style.marginTop = "20px";

    /* =========================
       B2B / B2C SUMMARY
    ========================= */

    let b2bTaxable = 0;
    let b2bGST = 0;

    let b2cTaxable = 0;
    let b2cGST = 0;

    filteredSales.forEach(function(record){

        const x =
            calculateGST(record);

        const gstin =
            record.customerGSTIN ||
            record.customerGST ||
            record.gstin ||
            "";

        if(gstin){

            b2bTaxable += x.taxable;
            b2bGST += x.gst;

        }else{

            b2cTaxable += x.taxable;
            b2cGST += x.gst;

        }

    });


    /* =========================
       HSN SUMMARY
    ========================= */

    const hsnMap = {};

    filteredSales.forEach(function(record){

        const lines =
            Array.isArray(record.lines)
            ? record.lines
            : Array.isArray(record.items)
            ? record.items
            : [];

        lines.forEach(function(line){

            const hsn =
                line.hsn ||
                line.hsnCode ||
                "NA";

            const name =
                line.name ||
                line.itemName ||
                line.description ||
                "Item";

            const qty =
                Number(line.qty || line.quantity || 0);

            const rate =
                Number(line.rate || line.saleRate || 0);

            const taxable =
                qty * rate;

            if(!hsnMap[hsn]){

                hsnMap[hsn] = {
                    hsn,
                    name,
                    qty:0,
                    taxable:0,
                    igst:0,
                    cgst:0,
                    sgst:0,
                    gst:0,
                    total:0
                };

            }

            hsnMap[hsn].qty += qty;
            hsnMap[hsn].taxable += taxable;

            const gst =
                taxable * 0.18;

            if(
                getSaleType() === "inter"
            ){

                hsnMap[hsn].igst += gst;

            }else{

                hsnMap[hsn].cgst +=
                    taxable * 0.09;

                hsnMap[hsn].sgst +=
                    taxable * 0.09;

            }

            hsnMap[hsn].gst += gst;
            hsnMap[hsn].total +=
                taxable + gst;

        });

    });


    const hsnRows =
        Object.values(hsnMap)
        .map(function(x,index){

            return `
            <tr>

                <td>${index+1}</td>

                <td>
                    ${escapeHTML(x.hsn)}
                </td>

                <td>
                    ${escapeHTML(x.name)}
                </td>

                <td>${x.qty}</td>

                <td>${money(x.taxable)}</td>

                <td>${money(x.igst)}</td>

                <td>${money(x.cgst)}</td>

                <td>${money(x.sgst)}</td>

                <td>${money(x.gst)}</td>

                <td>${money(x.total)}</td>

            </tr>
            `;

        }).join("");


    box.innerHTML = `

        <div class="notice">
            <strong>GSTR-1 Detailed Summary</strong>
        </div>


        <div class="summary-grid">

            <div class="summary-card">
                <span>B2B Taxable</span>
                <strong>
                    ${money(b2bTaxable)}
                </strong>
            </div>

            <div class="summary-card">
                <span>B2B GST</span>
                <strong>
                    ${money(b2bGST)}
                </strong>
            </div>

            <div class="summary-card">
                <span>B2C Taxable</span>
                <strong>
                    ${money(b2cTaxable)}
                </strong>
            </div>

            <div class="summary-card">
                <span>B2C GST</span>
                <strong>
                    ${money(b2cGST)}
                </strong>
            </div>

        </div>


        <div class="notice">
            <strong>HSN-wise Outward Supply Summary</strong>
        </div>


        <div class="table-container">

            <table>

                <thead>

                    <tr>
                        <th>SL</th>
                        <th>HSN</th>
                        <th>Item Description</th>
                        <th>Qty</th>
                        <th>Taxable</th>
                        <th>IGST</th>
                        <th>CGST</th>
                        <th>SGST</th>
                        <th>GST</th>
                        <th>Total</th>
                    </tr>

                </thead>

                <tbody>

                    ${
                        hsnRows ||
                        `<tr>
                            <td colspan="10">
                                No HSN item details found.
                            </td>
                        </tr>`
                    }

                </tbody>

            </table>

        </div>

    `;

    section.appendChild(box);
}


/* =========================
   REMOVE OLD DETAIL BOX
========================= */

function removeGSTR1Details(){

    const old =
        document.getElementById(
            "gstr1Details"
        );

    if(old)
        old.remove();
}

/* =========================
   GSTR-3B
========================= */

function renderGSTR3B() {

    const body =
        document.getElementById("gstr3bBody");

    if (!body) return;

    let taxable = 0;
    let igst = 0;
    let cgst = 0;
    let sgst = 0;

    // =========================
    // OUTPUT GST - SALES
    // =========================
    filteredSales.forEach(function(record) {

        const x = calculateGST(record);

        taxable += Number(x.taxable) || 0;
        igst += Number(x.igst) || 0;
        cgst += Number(x.cgst) || 0;
        sgst += Number(x.sgst) || 0;

    });

    const outputGST =
        igst + cgst + sgst;


    // =========================
    // INPUT GST / ITC - PURCHASE
    // =========================
    let purchaseTaxable = 0;
    let purchaseIGST = 0;
    let purchaseCGST = 0;
    let purchaseSGST = 0;

    const purchaseData =
        Array.isArray(window.filteredPurchases)
            ? window.filteredPurchases
            : (Array.isArray(window.purchases)
                ? window.purchases
                : []);

    purchaseData.forEach(function(record) {

        const value =
            Number(
                record.taxableAmount ||
                record.taxable ||
                record.subtotal ||
                0
            );

        const pIGST =
            Number(
                record.igst ||
                record.purchaseIGST ||
                0
            );

        const pCGST =
            Number(
                record.cgst ||
                record.purchaseCGST ||
                0
            );

        const pSGST =
            Number(
                record.sgst ||
                record.purchaseSGST ||
                0
            );

        purchaseTaxable += value;
        purchaseIGST += pIGST;
        purchaseCGST += pCGST;
        purchaseSGST += pSGST;

    });

    const inputGST =
        purchaseIGST +
        purchaseCGST +
        purchaseSGST;


    // =========================
    // NET GST PAYABLE
    // =========================
    const netIGST =
        Math.max(0, igst - purchaseIGST);

    const netCGST =
        Math.max(0, cgst - purchaseCGST);

    const netSGST =
        Math.max(0, sgst - purchaseSGST);

    const netGST =
        netIGST +
        netCGST +
        netSGST;


    // =========================
    // GSTR-3B ROWS
    // =========================
    const rows = [

        [
            "3.1(a)",
            "Outward taxable supplies",
            taxable,
            igst,
            cgst,
            sgst,
            0
        ],

        [
            "3.1(b)",
            "Outward taxable supplies - zero rated",
            0,
            0,
            0,
            0,
            0
        ],

        [
            "3.1(c)",
            "Other outward supplies - nil rated / exempt",
            0,
            0,
            0,
            0,
            0
        ],

        [
            "3.1(d)",
            "Inward supplies liable to reverse charge",
            0,
            0,
            0,
            0,
            0
        ],

        [
            "3.1(e)",
            "Non-GST outward supplies",
            0,
            0,
            0,
            0,
            0
        ],

        [
            "4",
            "Eligible ITC - Purchase GST",
            purchaseTaxable,
            purchaseIGST,
            purchaseCGST,
            purchaseSGST,
            0
        ],

        [
            "5",
            "Net GST Payable",
            0,
            netIGST,
            netCGST,
            netSGST,
            0
        ]

    ];


    // =========================
    // RENDER TABLE
    // =========================
    body.innerHTML =
        rows.map(function(row) {

            return `
            <tr>

                <td>${row[0]}</td>

                <td>${row[1]}</td>

                <td>${money(row[2])}</td>

                <td>${money(row[3])}</td>

                <td>${money(row[4])}</td>

                <td>${money(row[5])}</td>

                <td>${money(row[6])}</td>

            </tr>
            `;

        }).join("");


    // =========================
    // REPORT CARDS
    // =========================
    const output =
        document.getElementById("reportOutputGST");

    const purchase =
        document.getElementById("reportPurchaseGST");

    const net =
        document.getElementById("reportNetGST");

    if (output)
        output.textContent = money(outputGST);

    if (purchase)
        purchase.textContent = money(inputGST);

    if (net)
        net.textContent = money(netGST);

}


/* =========================
   GSTR-9
========================= */

function renderGSTR9() {

    const body =
        document.getElementById("gstr9Body");

    if (!body) return;

    let taxable = 0;
    let igst = 0;
    let cgst = 0;
    let sgst = 0;

    // =========================
    // SALES
    // =========================
    filteredSales.forEach(function(record) {

        const x = calculateGST(record);

        taxable += Number(x.taxable) || 0;
        igst += Number(x.igst) || 0;
        cgst += Number(x.cgst) || 0;
        sgst += Number(x.sgst) || 0;

    });

    const outputGST =
        igst + cgst + sgst;


    // =========================
    // PURCHASE / ITC
    // =========================
    let purchaseTaxable = 0;
    let purchaseIGST = 0;
    let purchaseCGST = 0;
    let purchaseSGST = 0;

    const purchaseData =
        Array.isArray(window.filteredPurchases)
            ? window.filteredPurchases
            : (
                Array.isArray(window.purchases)
                    ? window.purchases
                    : []
              );

    purchaseData.forEach(function(record) {

        purchaseTaxable +=
            Number(
                record.taxableAmount ||
                record.taxable ||
                record.subtotal ||
                0
            );

        purchaseIGST +=
            Number(
                record.igst ||
                record.purchaseIGST ||
                0
            );

        purchaseCGST +=
            Number(
                record.cgst ||
                record.purchaseCGST ||
                0
            );

        purchaseSGST +=
            Number(
                record.sgst ||
                record.purchaseSGST ||
                0
            );

    });

    const inputGST =
        purchaseIGST +
        purchaseCGST +
        purchaseSGST;


    // =========================
    // HSN OUTWARD
    // =========================
    const outwardHSN = {};

    filteredSales.forEach(function(record) {

        const lines =
            Array.isArray(record.lines)
                ? record.lines
                : (
                    Array.isArray(record.items)
                        ? record.items
                        : []
                  );

        lines.forEach(function(line) {

            const hsn =
                line.hsn ||
                line.hsnCode ||
                "NA";

            const name =
                line.name ||
                line.itemName ||
                line.description ||
                "Item";

            const qty =
                Number(
                    line.qty ||
                    line.quantity ||
                    0
                );

            const rate =
                Number(
                    line.rate ||
                    line.saleRate ||
                    0
                );

            const value = qty * rate;

            if (!outwardHSN[hsn]) {

                outwardHSN[hsn] = {
                    hsn: hsn,
                    name: name,
                    qty: 0,
                    taxable: 0,
                    igst: 0,
                    cgst: 0,
                    sgst: 0
                };

            }

            outwardHSN[hsn].qty += qty;
            outwardHSN[hsn].taxable += value;

            const gst =
                value * 0.18;

            if (
                typeof getSaleType === "function" &&
                getSaleType() === "inter"
            ) {
                outwardHSN[hsn].igst += gst;
            } else {
                outwardHSN[hsn].cgst += value * 0.09;
                outwardHSN[hsn].sgst += value * 0.09;
            }

        });

    });


    // =========================
    // HSN INWARD
    // =========================
    const inwardHSN = {};

    purchaseData.forEach(function(record) {

        const lines =
            Array.isArray(record.lines)
                ? record.lines
                : (
                    Array.isArray(record.items)
                        ? record.items
                        : []
                  );

        lines.forEach(function(line) {

            const hsn =
                line.hsn ||
                line.hsnCode ||
                "NA";

            const name =
                line.name ||
                line.itemName ||
                line.description ||
                "Item";

            const qty =
                Number(
                    line.qty ||
                    line.quantity ||
                    0
                );

            const rate =
                Number(
                    line.rate ||
                    line.purchaseRate ||
                    0
                );

            const value = qty * rate;

            if (!inwardHSN[hsn]) {

                inwardHSN[hsn] = {
                    hsn: hsn,
                    name: name,
                    qty: 0,
                    taxable: 0
                };

            }

            inwardHSN[hsn].qty += qty;
            inwardHSN[hsn].taxable += value;

        });

    });


    // =========================
    // HSN TOTAL COUNTS
    // =========================
    const outwardHSNCount =
        Object.keys(outwardHSN).length;

    const inwardHSNCount =
        Object.keys(inwardHSN).length;


    // =========================
    // GSTR-9 ROWS
    // =========================
    const rows = [

        [
            "4",
            "Taxable outward supplies",
            taxable,
            igst,
            cgst,
            sgst,
            0
        ],

        [
            "5",
            "Outward supplies not taxable",
            0, 0, 0, 0, 0
        ],

        [
            "6",
            "ITC availed - Purchase GST",
            purchaseTaxable,
            purchaseIGST,
            purchaseCGST,
            purchaseSGST,
            0
        ],

        [
            "7",
            "ITC reversed / ineligible",
            0, 0, 0, 0, 0
        ],

        [
            "8",
            "Other ITC information",
            purchaseTaxable,
            purchaseIGST,
            purchaseCGST,
            purchaseSGST,
            0
        ],

        [
            "9",
            "Tax paid working",
            taxable,
            igst,
            cgst,
            sgst,
            0
        ],

        [
            "10",
            "Supplies declared through amendments",
            0, 0, 0, 0, 0
        ],

        [
            "14",
            "Differential tax",
            0, 0, 0, 0, 0
        ],

        [
            "17",
            "HSN-wise outward summary",
            outwardHSNCount + " HSN item(s)",
            "",
            "",
            "",
            ""
        ],

        [
            "18",
            "HSN-wise inward summary",
            inwardHSNCount + " HSN item(s)",
            "",
            "",
            "",
            ""
        ]

    ];


    // =========================
    // RENDER
    // =========================
    body.innerHTML =
        rows.map(function(row) {

            return `
            <tr>

                <td>${row[0]}</td>

                <td>${row[1]}</td>

                <td>
                    ${
                        typeof row[2] === "number"
                            ? money(row[2])
                            : row[2]
                    }
                </td>

                <td>
                    ${
                        typeof row[3] === "number"
                            ? money(row[3])
                            : row[3]
                    }
                </td>

                <td>
                    ${
                        typeof row[4] === "number"
                            ? money(row[4])
                            : row[4]
                    }
                </td>

                <td>
                    ${
                        typeof row[5] === "number"
                            ? money(row[5])
                            : row[5]
                    }
                </td>

                <td>
                    ${
                        typeof row[6] === "number"
                            ? money(row[6])
                            : row[6]
                    }
                </td>

            </tr>
            `;

        }).join("");


    // =========================
    // REPORT TOTALS
    // =========================
    const output =
        document.getElementById("reportOutputGST");

    const purchase =
        document.getElementById("reportPurchaseGST");

    const net =
        document.getElementById("reportNetGST");

    if (output)
        output.textContent = money(outputGST);

    if (purchase)
        purchase.textContent = money(inputGST);

    if (net)
        net.textContent =
            money(Math.max(0, outputGST - inputGST));

}

/* =========================
   REPORTS
========================= */

function renderReports() {

    const body =
        document.getElementById("reportsBody");

    if (!body) return;

    const rows = [];

    // =========================
    // GST SALES
    // =========================
    filteredSales.forEach(function(record) {

        const taxable =
            Number(
                record.subtotal ||
                record.taxableAmount ||
                record.subTotal ||
                record.taxable ||
                0
            );

        const cgst =
            Number(record.cgst) || 0;

        const sgst =
            Number(record.sgst) || 0;

        const gst =
            Number(record.gstAmount) ||
            Number(record.gst) ||
            (cgst + sgst);

        const total =
            Number(
                record.grandTotal ||
                record.grandTotalAmount ||
                record.totalAmount ||
                taxable + gst
            );

        rows.push({
            date: formatDate(
                record.date ||
                record.invoiceDate ||
                record.createdAt
            ),

            document:
                record.invoiceNo || "",

            party:
                record.customerName ||
                record.customer ||
                "",

            source: "GST Sales",

            taxable,
            gst,
            total
        });

    });


    // =========================
    // GST PURCHASE
    // =========================
    filteredPurchases.forEach(function(record) {

        const taxable =
            Number(
                record.subtotal ||
                record.taxableAmount ||
                record.subTotal ||
                record.taxable ||
                0
            );

        const cgst =
            Number(record.cgst) || 0;

        const sgst =
            Number(record.sgst) || 0;

        const gst =
            Number(record.gstAmount) ||
            Number(record.gst) ||
            (cgst + sgst);

        const total =
            Number(
                record.grandTotal ||
                record.grandTotalAmount ||
                record.totalAmount ||
                taxable + gst
            );

        rows.push({
            date: formatDate(
                record.date ||
                record.invoiceDate ||
                record.createdAt
            ),

            document:
                record.vendorInvoiceNo ||
                record.billNo ||
                "",

            party:
                record.vendor ||
                record.vendorName ||
                record.supplier ||
                "",

            source: "GST Purchase",

            taxable,
            gst,
            total
        });

    });


    // =========================
    // SORT
    // =========================
    rows.sort(function(a, b) {

        return String(b.date)
            .localeCompare(String(a.date));

    });


    // =========================
    // EMPTY
    // =========================
    if (!rows.length) {

        body.innerHTML =
            `<tr>
                <td colspan="7">
                    No GST records found.
                </td>
            </tr>`;

        return;
    }


    // =========================
    // RENDER
    // =========================
    body.innerHTML =
        rows.map(function(row) {

            return `
            <tr>

                <td>${escapeHTML(row.date)}</td>

                <td>${escapeHTML(row.document)}</td>

                <td>${escapeHTML(row.party)}</td>

                <td>${escapeHTML(row.source)}</td>

                <td>${money(row.taxable)}</td>

                <td>${money(row.gst)}</td>

                <td>${money(row.total)}</td>

            </tr>
            `;

        }).join("");
}

/* =========================
   TAB
========================= */

function showTab(tabId, button) {

    document
        .querySelectorAll(".tab-content")
        .forEach(function(tab) {

            tab.classList.remove(
                "active"
            );

        });

    document
        .querySelectorAll(".tab")
        .forEach(function(tab) {

            tab.classList.remove(
                "active"
            );

        });

    document
        .getElementById(tabId)
        .classList.add("active");

    button.classList.add("active");

}
function changeReturnPage(type){

    const tabMap = {
        gstr1: "gstr1Tab",
        gstr3b: "gstr3bTab",
        gstr9: "gstr9Tab",
        reports: "reportsTab"
    };

    const tabId = tabMap[type];

    if(!tabId) return;

    const buttons = document.querySelectorAll(".tab");

    let activeButton = null;

    buttons.forEach(function(button){

        button.classList.remove("active");

        const text =
            button.textContent
                .trim()
                .replace(/\s+/g," ");

        if(
            (type === "gstr1" && text === "GSTR-1") ||
            (type === "gstr3b" && text === "GSTR-3B") ||
            (type === "gstr9" && text === "GSTR-9") ||
            (type === "reports" && text === "Reports / Export")
        ){
            activeButton = button;
        }
    });

    document.querySelectorAll(".tab-content")
        .forEach(function(tab){
            tab.classList.remove("active");
        });

    const content =
        document.getElementById(tabId);

    if(content)
        content.classList.add("active");

    if(activeButton)
        activeButton.classList.add("active");
}

/* =========================
   CSV
========================= */

function csvValue(value) {

    return `"${String(
        value ?? ""
    ).replace(/"/g, '""')}"`;

}


function downloadCSV(filename, rows) {

    const csv =
        rows
            .map(function(row) {

                return row
                    .map(csvValue)
                    .join(",");

            })
            .join("\r\n");

    const blob =
        new Blob(
            ["\ufeff" + csv],
            {
                type:
                    "text/csv;charset=utf-8"
            }
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        filename;

    link.click();

    setTimeout(function() {

        URL.revokeObjectURL(
            link.href
        );

    }, 1000);

}


function exportGSTR1() {

    const rows = [

        [
            "SL",
            "Date",
            "Invoice No",
            "Customer",
            "GSTIN",
            "Type",
            "Taxable",
            "IGST",
            "CGST",
            "SGST",
            "GST",
            "Grand Total"
        ]

    ];

    filteredSales.forEach(
        function(record, index) {

            const x =
                calculateGST(record);

            rows.push([

                index + 1,

                formatDate(
                    record.invoiceDate ||
                    record.date ||
                    record.createdAt
                ),

                record.invoiceNo || "",

                record.customerName ||
                record.customer ||
                "",

                record.customerGST ||
                record.gstin ||
                "",

                x.igst > 0
                    ? "IGST"
                    : "CGST + SGST",

                x.taxable,

                x.igst,

                x.cgst,

                x.sgst,

                x.gst,

                record.grandTotalAmount || 0

            ]);

        }
    );

    downloadCSV(
        "GSTR-1.csv",
        rows
    );

}


function exportGSTR3B() {

    const rows = [

        [
            "Section",
            "Description",
            "Taxable",
            "IGST",
            "CGST",
            "SGST",
            "Cess"
        ]

    ];

    let taxable = 0;
    let igst = 0;
    let cgst = 0;
    let sgst = 0;

    filteredSales.forEach(function(record) {

        const x =
            calculateGST(record);

        taxable += x.taxable;
        igst += x.igst;
        cgst += x.cgst;
        sgst += x.sgst;

    });

    rows.push([
        "3.1(a)",
        "Outward taxable supplies",
        taxable,
        igst,
        cgst,
        sgst,
        0
    ]);

    downloadCSV(
        "GSTR-3B.csv",
        rows
    );

}


function exportGSTR9() {

    const rows = [

        [
            "Table",
            "Particulars",
            "Taxable",
            "IGST",
            "CGST",
            "SGST",
            "Cess"
        ]

    ];

    downloadCSV(
        "GSTR-9-Working-Summary.csv",
        rows
    );

}


function exportSales() {

    const rows = [

        [
            "Date",
            "Invoice No",
            "Customer",
            "GSTIN",
            "Taxable",
            "GST",
            "Grand Total"
        ]

    ];

    filteredSales.forEach(function(record) {

        rows.push([

            formatDate(
                record.invoiceDate ||
                record.date ||
                record.createdAt
            ),

            record.invoiceNo || "",

            record.customerName ||
            record.customer ||
            "",

            record.customerGST ||
            record.gstin ||
            "",

            record.taxableAmount || 0,

            record.gstAmount || 0,

            record.grandTotalAmount || 0

        ]);

    });

    downloadCSV(
        "GST-Sales.csv",
        rows
    );

}


function exportPurchases() {

    const rows = [

        [
            "Date",
            "Invoice No",
            "Supplier",
            "GSTIN",
            "Taxable",
            "GST",
            "Grand Total"
        ]

    ];

    filteredPurchases.forEach(function(record) {

        rows.push([

            formatDate(
                record.invoiceDate ||
                record.date ||
                record.createdAt
            ),

            record.invoiceNo || "",

            record.vendorName ||
            record.supplier ||
            "",

            record.vendorGSTIN || "",

            record.taxableAmount || 0,

            record.gstAmount || 0,

            record.grandTotalAmount || 0

        ]);

    });

    downloadCSV(
        "GST-Purchases.csv",
        rows
    );

}


/* =========================
   RENDER
========================= */

function renderAll() {

    renderSummary();

    renderGSTR1();

    renderGSTR3B();

    renderGSTR9();

    renderReports();

}


/* =========================
   DASHBOARD
========================= */

function goDashboard() {

    window.location.href =
        "../../dashboard.html";

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadGSTSettings();

        setDefaultDates();

        loadPeriodData();

    }
);