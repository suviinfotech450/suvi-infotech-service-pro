/* =========================================================
   SUVI INFOTECH - CASH BILLING
   Final Cash Bill Module
   ========================================================= */

const BILLING_KEY = "suviInfotechBilling";
const CASH_SEQUENCE_KEY = "suviInfotechCashBillSequence";
const CLIENT_SEQUENCE_KEY = "suviInfotechClientCodeSequence";

let billingType = "CASH";

const $ = (id) => document.getElementById(id);


/* =========================================================
   INIT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function(){

    document.title =
    "Cash Bill | " +
    (
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM")
        || "SUVI INFOTECH"
    ).trim();
    
    setToday();

    setBillingType("CASH");

    generateClientCode();

    addItem();

    updateTotals();

    loadHistory();

    $("discount").addEventListener(
        "input",
        updateTotals
    );

    $("billingForm").addEventListener(
        "submit",
        saveBill
    );

    $("mobile").addEventListener(
        "input",
        function(){
            this.value =
                this.value
                    .replace(/\D/g,"")
                    .slice(0,10);
        }
    );
});


/* =========================================================
   DATE
   ========================================================= */

function setToday(){

    const now = new Date();

    const day =
        String(now.getDate())
            .padStart(2,"0");

    const months = [
        "Jan","Feb","Mar","Apr","May","Jun",
        "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    $("billDate").textContent =
        `${day}-${months[now.getMonth()]}-${now.getFullYear()}`;
}


/* =========================================================
   CASH BILL NUMBER
   ========================================================= */

function setBillingType(type){

    billingType = "CASH";

    $("billNumber").textContent =
        getNextCashBillNumber();
}


function getNextCashBillNumber(){

    const current =
        Number(
            localStorage.getItem(
                CASH_SEQUENCE_KEY
            ) || 0
        );

    return "CBNO" +
        String(current + 1)
            .padStart(2,"0");
}


function commitBillSequence(){

    const current =
        Number(
            localStorage.getItem(
                CASH_SEQUENCE_KEY
            ) || 0
        );

    localStorage.setItem(
        CASH_SEQUENCE_KEY,
        String(current + 1)
    );
}


/* =========================================================
   AUTO CLIENT CODE
   ========================================================= */

function generateClientCode(){

    const currentCode =
        localStorage.getItem(
            "suviInfotechCurrentClientCode"
        );

    if(currentCode){

        const input = $("clientCode");

        if(input){
            input.value = currentCode;
        }

        return currentCode;
    }

    const storedNumber =
        Number(
            localStorage.getItem(
                CLIENT_SEQUENCE_KEY
            ) || 0
        );

    const nextNumber =
        storedNumber + 1;

    const clientCode =
        "CLI" +
        String(nextNumber).padStart(3,"0");

    localStorage.setItem(
        "suviInfotechCurrentClientCode",
        clientCode
    );

    const input = $("clientCode");

    if(input){
        input.value = clientCode;
    }

    return clientCode;
}


function commitClientCode(){

    const code =
        localStorage.getItem(
            "suviInfotechCurrentClientCode"
        );

    if(!code){
        return;
    }

    const match =
        String(code).match(/^CLI(\d+)$/i);

    if(match){

        localStorage.setItem(
            CLIENT_SEQUENCE_KEY,
            String(Number(match[1]))
        );
    }

    localStorage.removeItem(
        "suviInfotechCurrentClientCode"
    );
}


/* =========================================================
   ITEMS
   ========================================================= */

function addItem(
    name="",
    qty=1,
    price=0,
    rate=0
){

    const body = $("itemsBody");

    const row = document.createElement("tr");

    row.innerHTML = `

        <td class="sl-number"></td>

        <td>
            <div class="item-select-wrap">
                <select class="item-select">
                    <option value="">Select Item / Particular</option>
                    <option value="__MANUAL__">✍ Manual Entry</option>
                </select>

                <input
                    class="item-manual-input"
                    type="text"
                    placeholder="Enter Item / Particular"
                    value="${escapeHtml(name)}"
                    style="display:none;">
            </div>
        </td>

        <td>
            <input
                class="qty-input"
                type="number"
                min="1"
                step="1"
                value="${qty || 1}">
        </td>

        <td>
            <input
                class="price-input"
                type="number"
                min="0"
                step="0.01"
                value="${price || 0}"
                readonly>
        </td>

        <td>
            <input
                class="rate-input"
                type="number"
                min="0"
                step="0.01"
                value="${rate || price || 0}"
                readonly>
        </td>

        <td class="line-amount">
            ₹0.00
        </td>

        <td>
            <button
                type="button"
                class="remove-item">
                ×
            </button>
        </td>
    `;

    body.appendChild(row);

    const select =
        row.querySelector(".item-select");

    const manualInput =
        row.querySelector(".item-manual-input");

    populateItemOptions(select, name);

    select.addEventListener(
        "change",
        function(){

            if(this.value === "__MANUAL__"){

                manualInput.style.display = "block";
                manualInput.focus();

                row.querySelector(
                    ".price-input"
                ).readOnly = false;

                row.querySelector(
                    ".rate-input"
                ).readOnly = false;

                if(!manualInput.value){
                    manualInput.value = "";
                }

            }else{

                manualInput.style.display = "none";

                const item =
                    getItemMaster()
                        .find(function(item){

                            return String(
                                item.name
                            ) === String(
                                select.value
                            );
                        });

                if(item){

                    const itemPrice =
                        Number(
                            item.pricePerUnit ??
                            item.price ??
                            item.rate ??
                            0
                        ) || 0;

                    row.querySelector(
                        ".price-input"
                    ).value =
                        itemPrice;

                    row.querySelector(
                        ".rate-input"
                    ).value =
                        itemPrice;
                }

                row.querySelector(
                    ".price-input"
                ).readOnly = false;

                row.querySelector(
                    ".rate-input"
                ).readOnly = false;
            }

            updateTotals();
        }
    );

    row.querySelector(
        ".qty-input"
    ).addEventListener(
        "input",
        updateTotals
    );

    row.querySelector(
        ".price-input"
    ).addEventListener(
        "input",
        function(){
            syncItemPrice(row);
            updateTotals();
        }
    );

    row.querySelector(
        ".rate-input"
    ).addEventListener(
        "input",
        updateTotals
    );

    manualInput.addEventListener(
        "input",
        updateTotals
    );

    row.querySelector(
        ".remove-item"
    ).addEventListener(
        "click",
        function(){

            row.remove();

            updateItemNumbers();
            updateTotals();
        }
    );

    updateItemNumbers();
    updateTotals();
}


function getItemMaster(){

    const defaultItems = [

        { name:"AC Service", pricePerUnit:850 },
        { name:"AC Repair", pricePerUnit:500 },
        { name:"AC Installation", pricePerUnit:2500 },
        { name:"AC Gas Charging", pricePerUnit:1800 },
        { name:"Laptop Service", pricePerUnit:500 },
        { name:"Laptop Repair", pricePerUnit:800 },
        { name:"Desktop Service", pricePerUnit:450 },
        { name:"Desktop Repair", pricePerUnit:750 },
        { name:"Printer Service", pricePerUnit:450 },
        { name:"Printer Repair", pricePerUnit:700 },
        { name:"CCTV Installation", pricePerUnit:1200 },
        { name:"CCTV Service", pricePerUnit:500 },
        { name:"Networking Service", pricePerUnit:600 },
        { name:"Software Installation", pricePerUnit:300 },
        { name:"Windows Installation", pricePerUnit:500 },
        { name:"Driver Installation", pricePerUnit:200 },
        { name:"Data Backup", pricePerUnit:500 },
        { name:"Data Recovery", pricePerUnit:1500 },
        { name:"Annual Maintenance", pricePerUnit:2500 },
        { name:"Service Visit", pricePerUnit:300 }

    ];

    const possibleKeys = [

        "suviInfotechItems",
        "suviInfotechItemMaster",
        "suviInfotechServices",
        "suviInfotechServiceMaster"

    ];

    const masterItems = [];

    possibleKeys.forEach(function(key){

        const raw =
            localStorage.getItem(key);

        if(!raw){
            return;
        }

        try{

            const data =
                JSON.parse(raw);

            const records =
                Array.isArray(data)
                    ? data
                    : (
                        data &&
                        Array.isArray(data.records)
                            ? data.records
                            : []
                    );

            records.forEach(function(item){

                const name =
                    item.name ||
                    item.itemName ||
                    item.serviceName ||
                    item.particular ||
                    item.title ||
                    "";

                if(!name){
                    return;
                }

                const price =
                    Number(
                        item.pricePerUnit ??
                        item.price ??
                        item.rate ??
                        item.amount ??
                        0
                    ) || 0;

                masterItems.push({

                    name,
                    pricePerUnit:price

                });
            });

        }catch(error){

            console.warn(
                "Item master read error:",
                key,
                error
            );
        }
    });

    const combined = [
        ...masterItems,
        ...defaultItems
    ];

    const seen = new Set();

    return combined.filter(function(item){

        const key =
            String(item.name)
                .trim()
                .toLowerCase();

        if(!key || seen.has(key)){
            return false;
        }

        seen.add(key);

        return true;
    });
}


function populateItemOptions(select, selectedName=""){

    const items =
        getItemMaster();

    items.forEach(function(item){

        const option =
            document.createElement("option");

        option.value =
            item.name;

        option.textContent =
            item.name;

        select.appendChild(option);
    });

    if(selectedName){

        const matching =
            Array.from(
                select.options
            ).find(function(option){

                return option.value ===
                    selectedName;
            });

        if(matching){

            select.value =
                selectedName;

            return;
        }

        select.value =
            "__MANUAL__";

        const row =
            select.closest("tr");

        if(row){

            const manual =
                row.querySelector(
                    ".item-manual-input"
                );

            if(manual){

                manual.style.display =
                    "block";
            }
        }
    }
}


function updateItemNumbers(){

    document
        .querySelectorAll(
            "#itemsBody tr"
        )
        .forEach(
            function(row,index){

                const cell =
                    row.querySelector(
                        ".sl-number"
                    );

                if(cell){
                    cell.textContent =
                        index + 1;
                }
            }
        );
}


function collectItems(){

    const items = [];

    document
        .querySelectorAll("#itemsBody tr")
        .forEach(function(row){

            const select =
                row.querySelector(
                    ".item-select"
                );

            const manualInput =
                row.querySelector(
                    ".item-manual-input"
                );

            const name =
                select &&
                select.value === "__MANUAL__"
                    ? (
                        manualInput
                            ? manualInput.value.trim()
                            : ""
                    )
                    : (
                        select
                            ? select.value.trim()
                            : ""
                    );

            const qty =
                Number(
                    row.querySelector(
                        ".qty-input"
                    ).value
                ) || 0;

            const price =
                Number(
                    row.querySelector(
                        ".price-input"
                    ).value
                ) || 0;

            const rate =
                Number(
                    row.querySelector(
                        ".rate-input"
                    ).value
                ) || price;

            const amount =
                qty * rate;

            if(name || qty || price || rate){

                items.push({

                    name,

                    qty,

                    pricePerUnit:
                        roundMoney(price),

                    rate:
                        roundMoney(rate),

                    amount:
                        roundMoney(amount)
                });
            }
        });

    return items;
}


/* =========================================================
   ITEM PRICE AUTO CALCULATION
   ========================================================= */

function syncItemPrice(row){

    if(!row){
        return;
    }

    const priceInput =
        row.querySelector(".price-input");

    const rateInput =
        row.querySelector(".rate-input");

    if(priceInput && rateInput){

        if(!priceInput.readOnly){

            rateInput.value =
                priceInput.value || 0;
        }
    }
}


/* =========================================================
   TOTALS
   ========================================================= */

function updateTotals(){

    let subtotal = 0;

    document
        .querySelectorAll(
            "#itemsBody tr"
        )
        .forEach(function(row){

            const qty =
                Number(
                    row.querySelector(
                        ".qty-input"
                    ).value
                ) || 0;

            const rate =
                Number(
                    row.querySelector(
                        ".rate-input"
                    ).value
                ) ||
                Number(
                    row.querySelector(
                        ".price-input"
                    ).value
                ) ||
                0;

            const amount =
                qty * rate;

            subtotal += amount;

            row.querySelector(
                ".line-amount"
            ).textContent =
                money(amount);
        });

    const discount =
        Math.max(
            0,
            Number(
                $("discount").value
            ) || 0
        );

    const total =
        Math.max(
            0,
            subtotal - discount
        );

    $("subtotal").textContent =
        money(subtotal);

    $("grandTotal").textContent =
        money(total);

    return {

        subtotal:
            roundMoney(subtotal),

        discount:
            roundMoney(discount),

        total:
            roundMoney(total)
    };
}


/* =========================================================
   SAVE BILL + CLIENT MASTER
   ========================================================= */

function saveBill(event){

    event.preventDefault();

    const clientName =
        $("clientName").value.trim();

    const mobile =
        $("mobile").value
            .replace(/\D/g,"");

    const address =
        $("address").value.trim();

    let clientCode =
        $("clientCode").value.trim();

    const items =
        collectItems();

    if(!clientName){

        alert(
            "Please enter Client Name."
        );

        $("clientName").focus();

        return;
    }

    if(
        mobile &&
        mobile.length !== 10
    ){

        alert(
            "Mobile Number must be 10 digits."
        );

        $("mobile").focus();

        return;
    }

    if(!items.length){

        alert(
            "Please add at least one Item / Particular."
        );

        return;
    }

    /*
       If Client Code is empty,
       generate automatically.
       If user typed a code, keep it.
    */

    if(!clientCode){

        clientCode =
            generateClientCode();

        $("clientCode").value =
            clientCode;
    }

    const totals =
        updateTotals();

    const today =
        $("billDate").textContent;

    const billNumber =
        $("billNumber").textContent;


    /* -----------------------------------------
       SAVE CASH BILL ONLY FOR THIS PAGE
       ----------------------------------------- */



    const bill = {

        id:
            Date.now(),

        billNumber,

        billType:
            "Cash Billing",

        date:
            today,

        clientCode,

        clientName,

        mobile,

        address,

        items,

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        total:
            totals.total,

        paymentMode:
            $("paymentMode").value,

        remarks:
            $("remarks").value.trim(),

        createdAt:
            new Date().toISOString()
    };


    const bills =
        getBills();

    bills.push(bill);


    localStorage.setItem(
        BILLING_KEY,
        JSON.stringify(bills)
    );


    commitBillSequence();

    commitClientCode();


    alert(
        `Cash Bill ${billNumber} saved successfully.`
    );


    loadHistory();

    clearBill();

}


/* =========================================================
   BILL HISTORY
   ========================================================= */

function getBills(){

    const raw =
        localStorage.getItem(
            BILLING_KEY
        );

    if(!raw){
        return [];
    }

    try{

        const data =
            JSON.parse(raw);

        return Array.isArray(data)
            ? data
            : [];

    }catch(error){

        return [];
    }
}


function loadHistory(){

    const bills =
        getBills()
            .slice()
            .reverse();

    $("billCount").textContent =
        `${bills.length} Bill${
            bills.length === 1
                ? ""
                : "s"
        }`;

    const body =
        $("historyBody");

    body.innerHTML = "";

    if(!bills.length){

        body.innerHTML = `
            <tr>
                <td colspan="8"
                    style="
                        text-align:center;
                        color:#94a3b8;
                        padding:24px
                    ">
                    No cash bill records found.
                </td>
            </tr>
        `;

        return;
    }

    bills.forEach(function(bill){

        const row =
            document.createElement("tr");

        row.innerHTML = `

            <td>
                ${escapeHtml(
                    bill.date || ""
                )}
            </td>

            <td>
                <strong>
                    ${escapeHtml(
                        bill.billNumber || ""
                    )}
                </strong>
            </td>

            <td>
                ${escapeHtml(
                    bill.clientCode || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    bill.clientName || ""
                )}
            </td>

            <td>
                ${escapeHtml(
                    bill.mobile || ""
                )}
            </td>

            <td>
                ${money(
                    bill.total || 0
                )}
            </td>

            <td>
                ${escapeHtml(
                    bill.paymentMode || ""
                )}
            </td>

            <td>
                <button
                    type="button"
                    class="history-action"
                    onclick="printSavedBill(
                        ${Number(bill.id)}
                    )">
                    Print
                </button>
            </td>
        `;

        body.appendChild(row);
    });
}


/* =========================================================
   CLEAR / NEW BILL
   ========================================================= */

function clearBill(){

    $("billingForm").reset();

    $("itemsBody").innerHTML = "";

    setToday();

    setBillingType("CASH");

    generateClientCode();

    addItem();
}


/* =========================================================
   PRINT
   ========================================================= */

function printCurrentBill(){

    const items =
        collectItems();

    const totals =
        updateTotals();

    openPrintWindow({

        billNumber:
            $("billNumber").textContent,

        date:
            $("billDate").textContent,

        clientCode:
            $("clientCode").value.trim(),

        clientName:
            $("clientName").value.trim(),

        mobile:
            $("mobile").value.trim(),

        address:
            $("address").value.trim(),

        items,

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        total:
            totals.total,

        paymentMode:
            $("paymentMode").value,

        remarks:
            $("remarks").value.trim()
    });
}


function printSavedBill(id){

    const bill =
        getBills().find(
            function(item){

                return Number(item.id) ===
                    Number(id);
            }
        );

    if(bill){
        openPrintWindow(bill);
    }
}


function openPrintWindow(bill){

    const rows =
        (bill.items || [])
            .map(function(item,index){

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td class="item-name">
                            ${escapeHtml(
                                item.name || ""
                            )}
                        </td>
                        <td>
                            ${item.qty || 0}
                        </td>
                        <td>
                            ${money(
                                item.pricePerUnit || 0
                            )}
                        </td>
                        <td>
                            ${money(
                                item.rate || 0
                            )}
                        </td>
                        <td>
                            ${money(
                                item.amount || 0
                            )}
                        </td>
                    </tr>
                `;
            })
            .join("");


    const win =
        window.open(
            "",
            "_blank",
            "width=900,height=950"
        );


    if(!win){

        alert(
            "Please allow pop-ups to print the bill."
        );

        return;
    }


    win.document.write(`

<!DOCTYPE html>
<html lang="en">

<head>

<meta charset="UTF-8">

<title>
    Cash Bill - ${escapeHtml(
        bill.billNumber || ""
    )}
</title>

<style>
@page{
    size:A4;
    margin:10mm;
}

*{
    box-sizing:border-box;
}

html,
body{
    margin:0;
    padding:0;
}

body{
    background:#eef4f8;
    color:#172033;
    font-family:"Segoe UI",Arial,Helvetica,sans-serif;
    font-size:13px;
}

.print-page{
    width:100%;
    max-width:190mm;
    margin:0 auto;
    background:#fff;
    padding:10mm;
}

/* ================= HEADER ================= */

.top-header{
    display:grid;
    grid-template-columns:1.3fr 1fr 1.3fr;
    align-items:center;
    gap:12px;
    padding:12px 14px;
    border-radius:8px;
    background:linear-gradient(135deg,#063b7a,#0876d1);
    color:#fff;
}

.company{
    text-align:left;
}

.company h1{
    margin:0;
    font-size:27px;
    line-height:1.1;
    font-weight:900;
    letter-spacing:.7px;
    color:#fff;
}

.company p{
    margin:4px 0 0;
    font-size:11px;
    font-weight:600;
    color:#dbeafe;
}

.cash-title{
    text-align:center;
    font-size:22px;
    font-weight:900;
    letter-spacing:1px;
    color:#fff;
}

.bill-meta{
    text-align:right;
    font-size:12px;
    line-height:1.8;
    color:#fff;
}

.bill-meta strong{
    color:#dbeafe;
}

/* ================= CLIENT ================= */

.client-section{
    margin-top:14px;
}

.section-head{
    padding:7px 10px;
    margin-bottom:6px;
    border-left:4px solid #0876d1;
    border-radius:5px;
    background:#eef6ff;
    color:#0752a5;
    font-size:13px;
    font-weight:900;
    letter-spacing:.3px;
    text-transform:uppercase;
}

.client-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:0;
    border:1px solid #d6e2ee;
    border-radius:6px;
    overflow:hidden;
    background:#fff;
}

.client-row{
    min-height:34px;
    padding:8px 10px;
    border-right:1px solid #d6e2ee;
    border-bottom:1px solid #d6e2ee;
    font-size:13px;
    line-height:1.4;
}

.client-row:nth-child(2n){
    border-right:0;
}

.client-row:nth-last-child(-n+2){
    border-bottom:0;
}

.client-row b{
    color:#475569;
    margin-right:6px;
    font-weight:800;
}

/* ================= ITEMS ================= */

.items-section{
    margin-top:14px;
}

.items-table{
    width:100%;
    border-collapse:collapse;
    table-layout:fixed;
}

.items-table th{
    padding:9px 6px;
    background:#063b7a;
    color:#fff;
    border:1px solid #174e8e;
    font-size:11px;
    font-weight:900;
    text-align:center;
}

.items-table td{
    padding:8px 6px;
    border:1px solid #d6e2ee;
    background:#fff;
    font-size:12px;
    font-weight:600;
    text-align:center;
    vertical-align:middle;
}

.items-table .item-name{
    text-align:left;
    font-weight:700;
}

.items-table th:nth-child(1){
    width:7%;
}

.items-table th:nth-child(2){
    width:34%;
}

.items-table th:nth-child(3){
    width:10%;
}

.items-table th:nth-child(4){
    width:17%;
}

.items-table th:nth-child(5){
    width:14%;
}

.items-table th:nth-child(6){
    width:18%;
}

/* ================= TOTALS ================= */

.totals-area{
    display:flex;
    justify-content:flex-end;
    margin-top:12px;
}

.totals{
    width:78mm;
    border:1px solid #d6e2ee;
    border-radius:6px;
    overflow:hidden;
}

.total-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:8px 10px;
    border-bottom:1px solid #e2e8f0;
    background:#fff;
    font-size:13px;
    font-weight:700;
}

.total-row strong{
    font-weight:900;
}

.grand{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:10px;
    background:#fff3c4;
    border-top:2px solid #d8bd49;
    font-size:17px;
    font-weight:900;
}

.grand strong{
    color:#087a62;
    font-size:19px;
}

/* ================= PAYMENT ================= */

.payment-row{
    margin-top:12px;
    padding:9px 10px;
    border:1px solid #d6e2ee;
    border-radius:6px;
    background:#f8fbff;
    font-size:12px;
    line-height:1.6;
}

.payment-row strong{
    color:#0752a5;
    font-weight:900;
}

/* ================= SIGNATURE ================= */

.signature{
    width:220px;
    margin-left:auto;
    margin-top:30px;
    text-align:center;
}

.signature-space{
    height:32px;
}

.signature-line{
    border-top:1px solid #172033;
}

.signature-label{
    margin-top:6px;
    font-size:12px;
    font-weight:900;
}

/* ================= FOOTER ================= */

.footer{
    margin-top:20px;
    padding-top:8px;
    border-top:1px solid #dce5ed;
    text-align:center;
    font-size:10px;
    color:#64748b;
    font-weight:600;
}

/* ================= PRINT ================= */

@media print{

    html,
    body{
        background:#fff !important;
    }

    .print-page{
        width:100%;
        max-width:none;
        margin:0;
        padding:0;
    }

    .top-header{
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
    }

    .items-table th{
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
    }

    .grand{
        -webkit-print-color-adjust:exact;
        print-color-adjust:exact;
    }

    .items-table tr{
        page-break-inside:avoid;
    }

    .client-grid,
    .totals,
    .payment-row,
    .signature{
        page-break-inside:avoid;
    }
}
 /* =========================================
   PRINT PREVIEW - A4 FIT & BIG
   ========================================= */

@page{
    size:A4 portrait;
    margin:8mm;
}

.print-page{
    width:100% !important;
    max-width:none !important;
    margin:0 !important;
    padding:0 !important;
}

/* HEADER */
.top-header{
    padding:16px 18px !important;
    min-height:62px !important;
}

.company h1{
    font-size:30px !important;
}

.company p{
    font-size:12px !important;
}

.cash-title{
    font-size:24px !important;
}

.bill-meta{
    font-size:13px !important;
}

/* SECTION */
.section-head{
    margin-top:14px !important;
    margin-bottom:7px !important;
    padding:9px 11px !important;
    font-size:14px !important;
}

/* CLIENT */
.client-row{
    min-height:40px !important;
    padding:10px 11px !important;
    font-size:14px !important;
}

/* ITEMS */
.items-table th{
    padding:10px 7px !important;
    font-size:12px !important;
}

.items-table td{
    padding:10px 7px !important;
    font-size:13px !important;
}

/* TOTAL */
.totals-area{
    margin-top:14px !important;
}

.totals{
    width:82mm !important;
}

.total-row{
    padding:10px 12px !important;
    font-size:14px !important;
}

.total-row strong{
    font-size:14px !important;
}

.grand{
    padding:12px !important;
    font-size:18px !important;
}

.grand strong{
    font-size:21px !important;
}

/* PAYMENT */
.payment-row{
    margin-top:14px !important;
    padding:11px 12px !important;
    font-size:13px !important;
}

/* SIGNATURE */
.signature{
    margin-top:42px !important;
}

.signature-space{
    height:42px !important;
}

.signature-label{
    font-size:13px !important;
}

/* FOOTER */
.footer{
    margin-top:25px !important;
    padding-top:10px !important;
    font-size:11px !important;
}

/* PRINT */
@media print{

    html,
    body{
        width:100% !important;
        background:#fff !important;
    }

    .print-page{
        width:100% !important;
        max-width:none !important;
        padding:0 !important;
        margin:0 !important;
    }

    .top-header,
    .section-head,
    .items-table th,
    .grand{
        -webkit-print-color-adjust:exact !important;
        print-color-adjust:exact !important;
    }
}   
</style>

</head>

<body>

<div class="print-page">

    <div class="top-header">

        <div class="company">
            <h1>SUVI INFOTECH</h1>
            <p>Nothing Is Impossible</p>
        </div>

        <div class="cash-title">
            CASH BILL
        </div>

        <div class="bill-meta">
            <div>
                <strong>Bill No:</strong>
                ${escapeHtml(
                    bill.billNumber || ""
                )}
            </div>

            <div>
                <strong>Date:</strong>
                ${escapeHtml(
                    bill.date || ""
                )}
            </div>
        </div>

    </div>


    <div class="client-section">

        <div class="section-head">
            Client Details
        </div>

        <div class="client-grid">

            <div class="client-row">
                <b>Client Code:</b>
                ${escapeHtml(
                    bill.clientCode || "-"
                )}
            </div>

            <div class="client-row">
                <b>Client Name:</b>
                ${escapeHtml(
                    bill.clientName || "-"
                )}
            </div>

            <div class="client-row">
                <b>Mobile:</b>
                ${escapeHtml(
                    bill.mobile || "-"
                )}
            </div>

            <div class="client-row">
                <b>Address:</b>
                ${escapeHtml(
                    bill.address || "-"
                )}
            </div>

        </div>

    </div>


    <div class="items-section">

        <div class="section-head">
            Items / Services
        </div>

        <table class="items-table">

            <thead>

                <tr>
                    <th>SL</th>
                    <th>Item / Particular</th>
                    <th>Qty</th>
                    <th>Price Per Unit</th>
                    <th>Rate</th>
                    <th>Total Amount</th>
                </tr>

            </thead>

            <tbody>
                ${rows}
            </tbody>

        </table>

    </div>


    <div class="totals-area">

        <div class="totals">

            <div class="total-row">
                <span>Subtotal</span>
                <strong>
                    ${money(
                        bill.subtotal || 0
                    )}
                </strong>
            </div>

            <div class="total-row">
                <span>Discount</span>
                <strong>
                    ${money(
                        bill.discount || 0
                    )}
                </strong>
            </div>

            <div class="grand">
                <span>Total Amount</span>
                <strong>
                    ${money(
                        bill.total || 0
                    )}
                </strong>
            </div>

        </div>

    </div>


    <div class="payment-row">

        <strong>Mode of Payment:</strong>

        ${escapeHtml(
            bill.paymentMode || "-"
        )}

        &nbsp;&nbsp;&nbsp;

        <strong>Remarks:</strong>

        ${escapeHtml(
            bill.remarks || "-"
        )}

    </div>


    <div class="signature">

        <div class="signature-space"></div>

        <div class="signature-line"></div>

        <div class="signature-label">
            Authorized Signature
        </div>

    </div>


    <div class="footer">
        Thank you for choosing SUVI INFOTECH
    </div>

</div>


<script>

window.onload=function(){

    setTimeout(
        function(){
            window.print();
        },
        300
    );

};

<\/script>

</body>

</html>

    `);

    win.document.close();
}


/* =========================================================
   HELPERS
   ========================================================= */

function money(value){

    return "₹" +
        Number(value || 0)
            .toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                }
            );
}


function roundMoney(value){

    return Math.round(
        Number(value || 0) * 100
    ) / 100;
}


function escapeHtml(value){

    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}


window.setBillingType =
    setBillingType;

window.addItem =
    addItem;

window.clearBill =
    clearBill;

window.printCurrentBill =
    printCurrentBill;

window.printSavedBill =
    printSavedBill;


window.saveBill = saveBill;
