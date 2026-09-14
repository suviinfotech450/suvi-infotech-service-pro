import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import {
    getAuth,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

/* =========================================================
   FIREBASE
   ========================================================= */
const firebaseConfig = {
    apiKey: "AIzaSyBSdggDY9RAhWQTfeUiYu-HRxdHPm7SvwA",
    authDomain: "suvi-infotech-service-pro.firebaseapp.com",
    projectId: "suvi-infotech-service-pro",
    storageBucket: "suvi-infotech-service-pro.firebasestorage.app",
    messagingSenderId: "181967409829",
    appId: "1:181967409829:web:4f17903a0a6dc8479fb34c",
    measurementId: "G-70W7B08X2X"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

signInAnonymously(auth).catch(error => {
    console.error("Firebase Anonymous Authentication Error:", error);
});

const FIRESTORE_COLLECTION = "quotations";
const KEY = "suviInfotechQuotations";
const QUOTE_SEQ_KEY = "suviInfotechQuotationSequence";
const CLIENT_SEQ_KEY = "suviInfotechClientSequence";
const CURRENT_QUOTE_KEY = "suviInfotechCurrentQuoteNo";
const CURRENT_CLIENT_KEY = "suviInfotechCurrentClientCode";
const DESIGN_KEY = "suviInfotechQuotationDesign";

/* =========================================================
   DEFAULT TERMS
   ========================================================= */
const DEFAULT_TERMS =
`1. Quotation is valid for the period mentioned above.
2. Prices are subject to change without prior notice.
3. Payment terms as agreed with the customer.
4. Warranty / AMC terms are as per manufacturer policy.
5. Additional work or materials will be charged separately.`;

/* =========================================================
   START
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {



    /* =====================================================
   DYNAMIC QUOTATION COMPANY NAME
   ===================================================== */

const quotationCompanyName =
    document.getElementById("quotationCompanyName");

if (quotationCompanyName) {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (selectedFirm) {
        quotationCompanyName.textContent =
            selectedFirm.trim();
    }
}  
    
    /* =====================================================
       DYNAMIC FIRM NAME
       ===================================================== */

    const quotationFirmName =
        document.getElementById("quotationFirmName");
const quotationSignature =
    document.getElementById("quotationSignature");

if (quotationSignature) {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (selectedFirm) {
        quotationSignature.textContent =
            "For " + selectedFirm.trim();
    }
}
    if (quotationFirmName) {

        const selectedFirm =
            localStorage.getItem(
                "SUVI_INFOTECH_SELECTED_FIRM"
            );

        if (selectedFirm) {
            quotationFirmName.textContent =
                selectedFirm.trim();
        }
    }
    /* =====================================================
   DYNAMIC QUOTATION COMPANY DETAILS
   ===================================================== */

const selectedFirmName =
    localStorage.getItem(
        "SUVI_INFOTECH_SELECTED_FIRM"
    );

if (selectedFirmName) {

    const firms =
        JSON.parse(
            localStorage.getItem("suviInfotechFirms") || "[]"
        );

    const firm =
        firms.find(
            f =>
                String(f.firmName || "").trim().toLowerCase() ===
                selectedFirmName.trim().toLowerCase()
        );

    if (firm) {

        const address =
            document.getElementById("quotationAddress");

        const location =
            document.getElementById("quotationLocation");

        const mobile =
            document.getElementById("quotationMobile");

        const landline =
            document.getElementById("quotationLandline");

        const email =
            document.getElementById("quotationEmail");

        const gst =
            document.getElementById("quotationGST");

        const signature =
            document.getElementById("quotationSignature");

        if (address) {
            address.textContent =
                firm.address || "";
        }

        if (location) {
            location.textContent =
                `${firm.city || ""}${firm.city && firm.state ? ", " : ""}${firm.state || ""}${firm.pincode ? " - " + firm.pincode : ""}`;
        }

        if (mobile) {
            mobile.textContent =
                firm.mobile || "";
        }

        if (landline) {
            landline.textContent =
                firm.landline || "";
        }

        if (email) {
            email.textContent =
                firm.email || "";
        }

        if (gst) {
            gst.textContent =
                firm.gstNumber || "";
        }

        if (signature) {
            signature.textContent =
                "For " + (firm.firmName || "");
        }
    }
}
    
    initDesignSelector();
    newQuotation();
    addRow();
    loadHistory();

    document.getElementById("quotationForm")
        .addEventListener("submit", saveQuotation);

    document.getElementById("discount")
        .addEventListener("input", updateTotals);

    document.getElementById("gstApplicable")
        .addEventListener("change", updateTotals);

    document.getElementById("gstType")
        .addEventListener("change", updateTotals);

    document.getElementById("gstRate")
        .addEventListener("change", updateTotals);

    const remarks = document.getElementById("remarks");
    if(remarks && !remarks.value.trim()){
        remarks.value = DEFAULT_TERMS;
    }

    updateTotals();
});

/* =========================================================
   DESIGN SELECTOR
   ========================================================= */
function getSelectedDesign(){
    return localStorage.getItem(DESIGN_KEY) || "1";
}

function applyQuotationDesign(design){
    design = String(design || "1");

    if(!["1","2","3","4"].includes(design)){
        design = "1";
    }

    document.body.classList.remove(
        "design-1",
        "design-2",
        "design-3",
        "design-4"
    );

    document.body.classList.add("design-" + design);

    document.querySelectorAll(".design-card").forEach(card => {
        card.classList.toggle(
            "selected",
            card.dataset.design === design
        );
    });

    const label = document.getElementById("selectedDesignLabel");
    if(label){
        label.textContent = "Design " + design + " Selected";
    }

    localStorage.setItem(DESIGN_KEY, design);
}

function initDesignSelector(){
    document.querySelectorAll(".design-card").forEach(card => {
        card.addEventListener("click", () => {
            applyQuotationDesign(card.dataset.design);
        });
    });

    applyQuotationDesign(getSelectedDesign());
}

/* =========================================================
   NUMBER GENERATORS
   ========================================================= */
function nextQuoteNo(){
    const n = Number(localStorage.getItem(QUOTE_SEQ_KEY) || 0) + 1;
    localStorage.setItem(QUOTE_SEQ_KEY, String(n));
    return "QT" + String(n).padStart(2,"0");
}

function nextClientCode(){
    const n = Number(localStorage.getItem(CLIENT_SEQ_KEY) || 0) + 1;
    localStorage.setItem(CLIENT_SEQ_KEY, String(n));
    return "CLI" + String(n).padStart(3,"0");
}

/* =========================================================
   DATE
   ========================================================= */
function today(){
    return new Date().toLocaleDateString("en-GB", {
        day:"2-digit",
        month:"short",
        year:"numeric"
    });
}

/* =========================================================
   NEW QUOTATION
   ========================================================= */
function newQuotation(){
    let quoteNo = localStorage.getItem(CURRENT_QUOTE_KEY);
    let clientCode = localStorage.getItem(CURRENT_CLIENT_KEY);

    if(!quoteNo){
        quoteNo = nextQuoteNo();
        localStorage.setItem(CURRENT_QUOTE_KEY, quoteNo);
    }

    if(!clientCode){
        clientCode = nextClientCode();
        localStorage.setItem(CURRENT_CLIENT_KEY, clientCode);
    }

    document.getElementById("quoteNo").value = quoteNo;
    document.getElementById("clientCode").value = clientCode;
    document.getElementById("quoteDate").value = today();

    const d = new Date();
    d.setDate(d.getDate() + 15);
    document.getElementById("validUntil").value =
        d.toISOString().slice(0,10);
}

/* =========================================================
   ITEM LIST
   ========================================================= */
const ITEM_OPTIONS = [
    "Keyboard",
"Mouse",
"Monitor",
"Desktop Computer",
"Laptop",
"RAM 4GB",
"RAM 8GB",
"RAM 16GB",
"SSD 256GB",
"SSD 512GB",
"SSD 1TB",
"HDD 1TB",
"HDD 2TB",
"SMPS",
"CPU Fan",
"CPU Cabinet",
"UPS",
"Power Cable",
"HDMI Cable",
"VGA Cable",
"LAN Cable",
"Network Switch",
"WiFi Router",
"WiFi Adapter",
"Printer",
"Printer Cartridge",
"Printer Toner",
"CCTV Camera",
"DVR / NVR",
"Solar Camera",

// Services
"Desktop Service",
"Laptop Service",
"Printer Service",
"Cartridge Refilling",
"CCTV Installation",
"CCTV Service",
"Solar Camera Installation",
"Networking Service",
"Network Installation",
"Software Installation",
"Software Upgrade",
"AMC Service",
"Computer Upgrade",
"Virus Removal",
"Data Recovery",
"Computer Accessories",
"Field Visit",
"Other"
];
const itemDatalist = document.createElement("datalist");
itemDatalist.id = "quotationItemSuggestions";

ITEM_OPTIONS.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    itemDatalist.appendChild(option);
});

document.body.appendChild(itemDatalist);
function addRow(){
    const tr = document.createElement("tr");

    const options = ITEM_OPTIONS.map(item =>
        `<option value="${esc(item)}">${esc(item)}</option>`
    ).join("");

    tr.innerHTML = `
        <td class="sl"></td>
        <td>
    <input
        type="text"
        class="item"
        list="quotationItemSuggestions"
        placeholder="Select or type item"
        autocomplete="off"
    >
</td>
        <td class="qty-cell">
            <input class="qty" type="number" min="0" step="1" value="1">
        </td>
        <td class="unit-cell">
            <select class="unit">
                <option>Nos</option><option>Set</option><option>Box</option><option>Mtr</option><option>Ft</option><option>Kg</option><option>Hrs</option><option>Day</option><option>Month</option><option>Year</option>
            </select>
        </td>
        <td class="price-cell">
            <input class="price" type="number" min="0" step="0.01" value="0">
        </td>
        <td class="amount-cell">₹0.00</td>
        <td class="action-cell">
            <button type="button" class="remove" title="Remove Item">×</button>
        </td>
    `;

    document.getElementById("items").appendChild(tr);

    tr.querySelector(".item").addEventListener("change", updateTotals);
    tr.querySelector(".qty").addEventListener("input", updateTotals);
    tr.querySelector(".qty").addEventListener("change", updateTotals);
    tr.querySelector(".price").addEventListener("input", updateTotals);
    tr.querySelector(".price").addEventListener("change", updateTotals);

    tr.querySelector(".remove").addEventListener("click", () => {
        tr.remove();

        if(document.querySelectorAll("#items tr").length === 0){
            addRow();
        }

        numberRows();
        updateTotals();
    });

    numberRows();
    updateTotals();
}

function numberRows(){
    document.querySelectorAll("#items tr").forEach((row,index) => {
        const sl = row.querySelector(".sl");
        if(sl) sl.textContent = index + 1;
    });
}

/* =========================================================
   MONEY
   ========================================================= */
function money(n){
    return "₹" + Number(n || 0).toLocaleString("en-IN", {
        minimumFractionDigits:2,
        maximumFractionDigits:2
    });
}

/* =========================================================
   ROW DATA
   ========================================================= */
function getRows(){
    return [...document.querySelectorAll("#items tr")]
        .map(row => {
            const name = row.querySelector(".item")?.value.trim() || "";
            const qty = Math.max(
                0,
                Number(row.querySelector(".qty")?.value) || 0
            );
            const price = Math.max(
                0,
                Number(row.querySelector(".price")?.value) || 0
            );
            const unit = row.querySelector(".unit")?.value || "Nos";

            return {
                name,
                qty,
                unit,
                price,
                amount: qty * price
            };
        })
        .filter(item => item.name || item.qty > 0 || item.price > 0);
}

/* =========================================================
   GST
   ========================================================= */
function calculateGST(taxableAmount){
    const applicable =
        document.getElementById("gstApplicable").value;

    const type =
        document.getElementById("gstType").value;

    const rate =
        Number(document.getElementById("gstRate").value) || 0;

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if(applicable === "yes" && rate > 0){
        const totalGST = taxableAmount * rate / 100;

        if(type === "cgst_sgst"){
            cgst = totalGST / 2;
            sgst = totalGST / 2;
        }else{
            igst = totalGST;
        }
    }

    return {
        applicable,
        type,
        rate,
        cgst,
        sgst,
        igst,
        totalGST: cgst + sgst + igst
    };
}

/* =========================================================
   TOTALS
   ========================================================= */
function updateTotals(){

    const allRows = [...document.querySelectorAll("#items tr")];
    let subtotal = 0;

    allRows.forEach(row => {
        const qty = Math.max(
            0,
            Number(row.querySelector(".qty")?.value) || 0
        );

        const price = Math.max(
            0,
            Number(row.querySelector(".price")?.value) || 0
        );

        const amount = qty * price;
        subtotal += amount;

        const amountCell = row.querySelector(".amount-cell");
        if(amountCell){
            amountCell.textContent = money(amount);
        }
    });

    const discount =
        Math.max(
            0,
            Number(document.getElementById("discount").value) || 0
        );

    const taxableAmount = Math.max(0, subtotal - discount);
    const gst = calculateGST(taxableAmount);
    const grandTotal = taxableAmount + gst.totalGST;

    document.getElementById("subtotal").textContent = money(subtotal);
    document.getElementById("taxableAmount").textContent = money(taxableAmount);
    document.getElementById("cgstAmount").textContent = money(gst.cgst);
    document.getElementById("sgstAmount").textContent = money(gst.sgst);
    document.getElementById("igstAmount").textContent = money(gst.igst);
    document.getElementById("grandTotal").textContent = money(grandTotal);

    const halfRate = gst.rate / 2;

    document.getElementById("cgstLabel").textContent =
        `CGST (${halfRate}%)`;

    document.getElementById("sgstLabel").textContent =
        `SGST (${halfRate}%)`;

    document.getElementById("igstLabel").textContent =
        `IGST (${gst.rate}%)`;

    document.getElementById("amountInWords").textContent =
        getAmountInWords(grandTotal);

    toggleGSTRows(gst);
}

function toggleGSTRows(gst){
    const cgst = document.getElementById("cgstRow");
    const sgst = document.getElementById("sgstRow");
    const igst = document.getElementById("igstRow");

    if(gst.applicable !== "yes" || gst.rate <= 0){
        cgst.classList.add("hidden");
        sgst.classList.add("hidden");
        igst.classList.add("hidden");
        return;
    }

    if(gst.type === "cgst_sgst"){
        cgst.classList.remove("hidden");
        sgst.classList.remove("hidden");
        igst.classList.add("hidden");
    }else{
        cgst.classList.add("hidden");
        sgst.classList.add("hidden");
        igst.classList.remove("hidden");
    }
}

/* =========================================================
   AMOUNT IN WORDS
   ========================================================= */
function numberToWordsIndian(num){
    num = Math.floor(Number(num) || 0);

    if(num === 0) return "Zero";

    const ones = [
        "","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
        "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
        "Seventeen","Eighteen","Nineteen"
    ];

    const tens = [
        "","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"
    ];

    function twoDigit(n){
        if(n < 20) return ones[n];
        return tens[Math.floor(n / 10)] +
            (n % 10 ? " " + ones[n % 10] : "");
    }

    function convert(n){
        let result = "";

        if(n >= 10000000){
            result += convert(Math.floor(n / 10000000)) + " Crore ";
            n %= 10000000;
        }

        if(n >= 100000){
            result += convert(Math.floor(n / 100000)) + " Lakh ";
            n %= 100000;
        }

        if(n >= 1000){
            result += convert(Math.floor(n / 1000)) + " Thousand ";
            n %= 1000;
        }

        if(n >= 100){
            result += ones[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }

        if(n > 0){
            result += twoDigit(n);
        }

        return result.trim();
    }

    return convert(num);
}

function getAmountInWords(amount){
    amount = Number(amount) || 0;

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    let text = "Rupees " + numberToWordsIndian(rupees);

    if(paise > 0){
        text += " and " + numberToWordsIndian(paise) + " Paise";
    }

    return text + " Only";
}

/* =========================================================
   SAVE
   ========================================================= */
async function saveQuotation(event){
    event.preventDefault();

    const clientName =
        document.getElementById("clientName").value.trim();

    if(!clientName){
        alert("Enter Client Name.");
        document.getElementById("clientName").focus();
        return;
    }

    const mobile =
        document.getElementById("mobile").value.trim();

    if(mobile && !/^\d{10}$/.test(mobile)){
        alert("Mobile number must contain exactly 10 digits.");
        document.getElementById("mobile").focus();
        return;
    }

    const rows = getRows();

    if(!rows.length){
        alert("Add at least one item/service.");
        return;
    }

    const subtotal =
        rows.reduce((sum,item) => sum + item.amount, 0);

    const discount =
        Math.max(
            0,
            Number(document.getElementById("discount").value) || 0
        );

    const taxableAmount = Math.max(0, subtotal - discount);
    const gst = calculateGST(taxableAmount);

    const q = {
        id: Date.now(),
        date: document.getElementById("quoteDate").value,
        quoteNo: document.getElementById("quoteNo").value,
        validUntil: document.getElementById("validUntil").value,
        clientCode: document.getElementById("clientCode").value.trim(),
        clientName,
        mobile,
        address: document.getElementById("address").value.trim(),
        gstin: document.getElementById("gstin")?.value.trim() || "",
        remarks: document.getElementById("remarks").value.trim() || DEFAULT_TERMS,
        items: rows,
        subtotal,
        discount,
        taxableAmount,
        gstApplicable: gst.applicable,
        gstType: gst.type,
        gstRate: gst.rate,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        gstTotal: gst.totalGST,
        total: taxableAmount + gst.totalGST,
        design: getSelectedDesign(),
        copies: document.getElementById("printThreeCopies").checked ? 3 : 1
    };

    const all =
        JSON.parse(localStorage.getItem(KEY) || "[]");

    all.unshift(q);
    localStorage.setItem(KEY, JSON.stringify(all));

    localStorage.removeItem(CURRENT_QUOTE_KEY);
    localStorage.removeItem(CURRENT_CLIENT_KEY);

    const firebaseSaved = await saveQuotationToFirebase(q);

    if(firebaseSaved){
        alert("Quotation saved successfully.\n\nLocalStorage ✓\nFirebase ✓");
    }else{
        alert("Quotation saved successfully in LocalStorage.\n\nFirebase save was not completed.");
    }

    loadHistory();
    clearQuotation();
}

async function saveQuotationToFirebase(q){
    try{
        await setDoc(
            doc(db, FIRESTORE_COLLECTION, String(q.id)),
            q
        );
        return true;
    }catch(error){
        console.error("Firebase quotation save error:", error);
        return false;
    }
}

/* =========================================================
   HISTORY
   ========================================================= */
function loadHistory(){
    const all =
        JSON.parse(localStorage.getItem(KEY) || "[]");

    const body = document.getElementById("history");

    if(!all.length){
        body.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:18px">
                    No quotations saved yet.
                </td>
            </tr>
        `;
    }else{
        body.innerHTML = all.map(q => `
            <tr>
                <td>${esc(q.date)}</td>
                <td>${esc(q.quoteNo)}</td>
                <td>${esc(q.clientName)}</td>
                <td>${esc(q.mobile || "-")}</td>
                <td>${esc(q.address || "-")}</td>
                <td>${money(q.total)}</td>
                <td>
                    <button type="button"
                        onclick="printSaved(${Number(q.id)})">
                        Print
                    </button>
                    <button type="button"
                        class="primary"
                        onclick="convertQuotationToSale(${Number(q.id)})">
                        Convert to Sale
                    </button>
                </td>
            </tr>
        `).join("");
    }

    document.getElementById("count").textContent =
        `${all.length} Quotations`;
}

/* =========================================================
   CLEAR
   ========================================================= */
function clearQuotation(){
    document.getElementById("clientName").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("address").value = "";
    document.getElementById("remarks").value = DEFAULT_TERMS;
    document.getElementById("discount").value = 0;
    document.getElementById("gstApplicable").value = "yes";
    document.getElementById("gstType").value = "cgst_sgst";
    document.getElementById("gstRate").value = "18";
    document.getElementById("printThreeCopies").checked = false;

    document.getElementById("items").innerHTML = "";

    localStorage.removeItem(CURRENT_QUOTE_KEY);
    localStorage.removeItem(CURRENT_CLIENT_KEY);

    newQuotation();
    addRow();
}

/* =========================================================
   PRINT
   ========================================================= */
function printQuotation(){
    const q = collectCurrentQuotationForPrint();

    if(!q){
        return;
    }

    printQuote(q);
}

function collectCurrentQuotationForPrint(){
    const clientName =
        document.getElementById("clientName").value.trim();

    if(!clientName){
        alert("Enter Client Name before printing.");
        return null;
    }

    const rows = getRows();

    if(!rows.length){
        alert("Add at least one item/service before printing.");
        return null;
    }

    const subtotal =
        rows.reduce((sum,item) => sum + item.amount, 0);

    const discount =
        Math.max(
            0,
            Number(document.getElementById("discount").value) || 0
        );

    const taxableAmount = Math.max(0, subtotal - discount);
    const gst = calculateGST(taxableAmount);

    return {
        date: document.getElementById("quoteDate").value,
        quoteNo: document.getElementById("quoteNo").value,
        validUntil: document.getElementById("validUntil").value,
        clientCode: document.getElementById("clientCode").value.trim(),
        clientName,
        mobile: document.getElementById("mobile").value.trim(),
        address: document.getElementById("address").value.trim(),
        gstin: document.getElementById("gstin")?.value.trim() || "",
        remarks: document.getElementById("remarks").value.trim() || DEFAULT_TERMS,
        items: rows,
        subtotal,
        discount,
        taxableAmount,
        gstApplicable: gst.applicable,
        gstType: gst.type,
        gstRate: gst.rate,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        gstTotal: gst.totalGST,
        total: taxableAmount + gst.totalGST,
        design: getSelectedDesign(),
        copies: document.getElementById("printThreeCopies").checked ? 3 : 1
    };
}

function printSaved(id){
    const q = getQuotationById(id);

    if(!q){
        alert("Quotation not found.");
        return;
    }

    printQuote(q);
}

function printQuote(q){
    const copies = Number(q.copies || 1);
    const design = ["1","2","3","4"].includes(String(q.design))
        ? String(q.design)
        : "1";

    const rows = (q.items || []).map((item,index) => `
        <tr>
            <td>${index + 1}</td>
            <td class="item-name">${esc(item.name || "")}</td>
            <td>${Number(item.qty || 0)}</td>
            <td>${money(item.price || 0)}</td>
            <td>${money(item.amount || 0)}</td>
        </tr>
    `).join("");

    const gstRows =
        q.gstApplicable === "yes" && Number(q.gstRate || 0) > 0
        ? (
            q.gstType === "cgst_sgst"
            ? `
                <div class="p-total-row">
                    <span>CGST (${Number(q.gstRate)/2}%)</span>
                    <strong>${money(q.cgst)}</strong>
                </div>
                <div class="p-total-row">
                    <span>SGST (${Number(q.gstRate)/2}%)</span>
                    <strong>${money(q.sgst)}</strong>
                </div>
              `
            : `
                <div class="p-total-row">
                    <span>IGST (${Number(q.gstRate)}%)</span>
                    <strong>${money(q.igst)}</strong>
                </div>
              `
        )
        : "";

    let pages = "";

    for(let i = 0; i < copies; i++){
        pages += `
        <div class="print-page design-${design}">

            <div class="p-header">
                <div>
                    <h1>SUVI INFOTECH</h1>
                    <p>COMPUTER &amp; IT SERVICE SOLUTIONS</p>
                </div>
                <div class="p-title">
                    <h2>ESTIMATION / QUOTATION</h2>
                    <strong>${esc(q.quoteNo)}</strong>
                </div>
            </div>

            <div class="p-accent"></div>

            <div class="p-meta">
                <div>
                    <span>Quotation Date</span>
                    <strong>${esc(q.date)}</strong>
                </div>
                <div>
                    <span>Valid Until</span>
                    <strong>${esc(q.validUntil || "-")}</strong>
                </div>
            </div>

            <section class="p-client">
                <div class="p-section-title">CLIENT DETAILS</div>
                <div class="p-client-grid">
                    <div>
                        <span>Client Code</span>
                        <strong>${esc(q.clientCode || "-")}</strong>
                    </div>
                    <div>
                        <span>Client Name</span>
                        <strong>${esc(q.clientName || "-")}</strong>
                    </div>
                    <div>
                        <span>Mobile Number</span>
                        <strong>${esc(q.mobile || "-")}</strong>
                    </div>
                    <div>
                        <span>Address</span>
                        <strong>${esc(q.address || "-")}</strong>
                    </div>
                </div>
            </section>

            <section class="p-items">
                <div class="p-section-title">ITEMS / SERVICES</div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:7%">SL</th>
                            <th>ITEM / PARTICULAR</th>
                            <th style="width:10%">QTY</th>
                            <th style="width:17%">PRICE / UNIT</th>
                            <th style="width:17%">AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </section>

            <div class="p-summary">
                <div class="p-terms">
                    <div class="p-section-title">TERMS &amp; CONDITIONS / REMARKS</div>
                    <div class="terms-text">${esc(q.remarks || DEFAULT_TERMS).replace(/\n/g,"<br>")}</div>
                </div>

                <div class="p-totals">
                    <div class="p-total-row">
                        <span>Subtotal</span>
                        <strong>${money(q.subtotal)}</strong>
                    </div>
                    <div class="p-total-row">
                        <span>Discount</span>
                        <strong>${money(q.discount)}</strong>
                    </div>
                    <div class="p-total-row">
                        <span>Taxable Amount</span>
                        <strong>${money(q.taxableAmount)}</strong>
                    </div>
                    ${gstRows}
                    <div class="p-grand">
                        <div>
                            <span>AMOUNT IN WORDS</span>
                            <strong>${esc(getAmountInWords(q.total))}</strong>
                        </div>
                        <div class="grand-number">
                            <span>GRAND TOTAL</span>
                            <strong>${money(q.total)}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-signatures">
                <div class="p-sign">
                    <div class="sign-space"></div>
                    <div class="sign-line"></div>
                    <strong>Customer Signature</strong>
                </div>
                <div class="p-sign">
                    <div class="sign-space"></div>
                    <div class="sign-line"></div>
                    <strong>Authorized Signature</strong>
                    <span>For SUVI INFOTECH</span>
                </div>
            </div>

            <div class="p-footer">
                Estimation / Quotation • ${esc(q.quoteNo)}
            </div>
        </div>`;
    }

    const w = window.open("", "_blank", "width=1000,height=800");

    if(!w){
        alert("Allow pop-ups to print quotation.");
        return;
    }

    w.document.write(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${esc(q.quoteNo)} - Estimation / Quotation</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#68717a;font-family:Arial,Helvetica,sans-serif;color:#182d40}
.print-page{
    width:210mm;
    min-height:297mm;
    margin:8mm auto;
    padding:12mm;
    background:#fff;
    position:relative;
    box-shadow:0 3px 18px rgba(0,0,0,.20);
    page-break-after:always;
}
.print-page:last-child{page-break-after:auto}
.p-header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}
.p-header h1{margin:0;font-size:25px;color:#082f53;letter-spacing:1px}
.p-header p{margin:4px 0 0;font-size:9px;font-weight:800;letter-spacing:1.4px;color:#506a7e}
.p-title{text-align:right}
.p-title h2{margin:0;font-size:18px;color:#082f53;letter-spacing:.5px}
.p-title strong{display:inline-block;margin-top:6px;padding:5px 16px;border:1px solid #d4e0e9;border-radius:4px;color:#0b68b2;font-size:12px}
.p-accent{height:3px;background:#d9a63a;margin:10px 0 11px}
.p-meta{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:10px}
.p-meta>div{border:1px solid #d5e0e8;border-left:3px solid #d9a63a;border-radius:4px;padding:6px 8px}
.p-meta span,.p-client span,.p-grand span{display:block;text-transform:uppercase;font-size:7px;font-weight:900;color:#65788a;margin-bottom:3px}
.p-meta strong{font-size:10px}
.p-client,.p-items{border:1px solid #d4dee6;border-radius:5px;overflow:hidden;margin-top:8px}
.p-section-title{padding:5px 8px;background:#f3f8fb;border-bottom:2px solid #d9a63a;color:#082f53;font-size:8px;font-weight:900;letter-spacing:.5px}
.p-client-grid{display:grid;grid-template-columns:1fr 1.5fr}
.p-client-grid>div{padding:6px 8px;border-bottom:1px solid #edf1f4}
.p-client-grid>div:nth-child(odd){border-right:1px solid #edf1f4}
.p-client-grid>div:last-child{grid-column:1/-1;border-right:0}
.p-client-grid strong{font-size:10px;font-weight:900}
.p-items table{width:100%;border-collapse:collapse;table-layout:fixed}
.p-items th{background:#082f53;color:#fff;padding:5px;font-size:7px;text-align:left}
.p-items td{padding:5px;border:1px solid #d7e1e8;font-size:9px;font-weight:700}
.p-items td:nth-child(1),.p-items td:nth-child(3){text-align:center}
.p-items td:nth-child(4),.p-items td:nth-child(5){text-align:right}
.p-summary{display:grid;grid-template-columns:minmax(0,1fr) 38%;gap:9px;margin-top:9px}
.p-terms{border:1px solid #d4dee6;border-radius:5px;overflow:hidden}
.terms-text{padding:7px 8px;font-size:8px;line-height:1.5;min-height:105px}
.p-totals{border:1px solid #d4dee6;border-radius:5px;padding:6px 8px}
.p-total-row{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid #edf1f4;font-size:8px}
.p-total-row strong{font-size:8px}
.p-grand{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:6px;padding:7px 8px;border-radius:4px;background:#082f53;color:#fff}
.p-grand span{color:#fff}
.p-grand>div:first-child{flex:1}
.p-grand>div:first-child strong{display:block;font-size:8px;line-height:1.35}
.grand-number{text-align:right}
.grand-number strong{display:block;font-size:14px;color:#fff}
.p-signatures{display:flex;justify-content:space-between;gap:30px;margin-top:22px}
.p-sign{width:170px;text-align:center}
.sign-space{height:28px}
.sign-line{border-top:1px solid #1d3347;margin-bottom:5px}
.p-sign strong{display:block;font-size:8px;text-transform:uppercase}
.p-sign span{display:block;margin-top:2px;font-size:7px;color:#64788a;font-weight:700}
.p-footer{position:absolute;left:12mm;right:12mm;bottom:6mm;border-top:1px solid #e1e6eb;padding-top:4px;text-align:center;font-size:7px;color:#8493a0}

/* Design 2 */
.print-page.design-2 .p-header{background:#08706e;padding:10px;border-radius:5px;color:#fff}
.print-page.design-2 .p-header h1,.print-page.design-2 .p-header p,.print-page.design-2 .p-title h2{color:#fff}
.print-page.design-2 .p-title strong{color:#fff;border-color:#a8d5d2}
.print-page.design-2 .p-accent{background:#d9a63a}
.print-page.design-2 .p-meta>div{border-left-color:#08706e}
.print-page.design-2 .p-section-title{background:#eaf7f6;color:#075e61;border-bottom-color:#08706e}
.print-page.design-2 .p-items th{background:#08706e}
.print-page.design-2 .p-grand{background:#08706e;border-radius:12px}

/* Design 3 */
.print-page.design-3{border:1px solid #222}
.print-page.design-3 .p-header{background:#222;padding:10px;border-radius:5px}
.print-page.design-3 .p-header h1,.print-page.design-3 .p-header p,.print-page.design-3 .p-title h2{color:#fff}
.print-page.design-3 .p-title strong{color:#222}
.print-page.design-3 .p-accent{background:#222}
.print-page.design-3 .p-meta>div{border-left-color:#222}
.print-page.design-3 .p-section-title{background:#f0f0f0;color:#222;border-bottom-color:#222}
.print-page.design-3 .p-items th{background:#222}
.print-page.design-3 .p-grand{background:#222}

/* Design 4 */
.print-page.design-4 .p-header{background:#176b4b;padding:10px;border-radius:5px}
.print-page.design-4 .p-header h1,.print-page.design-4 .p-header p,.print-page.design-4 .p-title h2{color:#fff}
.print-page.design-4 .p-title strong{color:#176b4b}
.print-page.design-4 .p-accent{background:#d9a63a}
.print-page.design-4 .p-meta>div{border-left-color:#2d8a5c}
.print-page.design-4 .p-section-title{background:#edf7f1;color:#176b4b;border-bottom-color:#2d8a5c}
.print-page.design-4 .p-items th{background:#176b4b}
.print-page.design-4 .p-grand{background:#176b4b}

@media print{
    @page{size:A4 portrait;margin:0}
    html,body{background:#fff}
    .print-page{margin:0;box-shadow:none}
}
</style>
</head>
<body>${pages}</body>
</html>
    `);

    w.document.close();

    setTimeout(() => {
        w.focus();
        w.print();
    }, 600);
}

/* =========================================================
   GET QUOTATION
   ========================================================= */
function getQuotationById(id){
    const all =
        JSON.parse(localStorage.getItem(KEY) || "[]");

    return all.find(q => String(q.id) === String(id));
}

/* =========================================================
   CONVERT QUOTATION → SALE
   ========================================================= */
function convertQuotationToSale(id){
    const q = getQuotationById(id);

    if(!q){
        alert("Quotation not found.");
        return;
    }

    if(!q.items || !q.items.length){
        alert("Quotation has no items.");
        return;
    }

    /*
     * Convert the quotation rows to the exact fields used by the
     * existing Inventory Sales Entry.  Be tolerant of old quotation
     * records which may use itemName/rate instead of name/price.
     */
    const saleData = {
        source: "QUOTATION",
        quotationNo: q.quoteNo || "",
        quotationId: q.id,
        customerName: q.clientName || "",
        clientCode: q.clientCode || "",
        mobile: q.mobile || "",
        address: q.address || "",
        customerGST: q.customerGST || q.gstin || "",
        gstApplicable: q.gstApplicable || "no",
        gstType: q.gstType || "",
        gstRate: Number(q.gstRate || 0),
        cgst: Number(q.cgst || 0),
        sgst: Number(q.sgst || 0),
        igst: Number(q.igst || 0),
        remarks: q.remarks || ("Converted from Quotation " + (q.quoteNo || "")),
        lines: q.items.map(item => ({
            itemName: String(
                item.name ??
                item.itemName ??
                item.partName ??
                item.item ??
                item.description ??
                ""
            ).trim(),
            qty: Number(item.qty ?? item.quantity ?? 1) || 1,
            unit: item.unit || "Nos",
            sellingRate: Number(
                item.price ??
                item.rate ??
                item.sellingRate ??
                item.unitPrice ??
                0
            ) || 0,
            gstRate: Number(item.gstRate ?? q.gstRate ?? 0) || 0
        })).filter(line => line.itemName)
    };

    if(!saleData.lines.length){
        alert("Quotation item names are empty. Please check the quotation items.");
        return;
    }

    localStorage.setItem(
        "suviInfotechQuotationToSale",
        JSON.stringify(saleData)
    );

    const inventoryUrl = new URL(
        "../inventory/inventory.html",
        window.location.href
    ).href;

    /* Inventory.js is NOT changed. */
    const inventoryWindow = window.open(
        inventoryUrl,
        "SUVI_INFOTECH_INVENTORY_SALES"
    );

    if(!inventoryWindow){
        alert(
            "Popup was blocked. Please allow popups for SUVI INFOTECH " +
            "and click Convert to Sale again."
        );
        return;
    }

    let attempts = 0;
    const maxAttempts = 100;

    const timer = setInterval(() => {
        attempts++;

        try{
            if(inventoryWindow.closed){
                clearInterval(timer);
                return;
            }

            const doc = inventoryWindow.document;
            const modal = doc.getElementById("salesEntryModal");

            if(
                doc.readyState === "complete" &&
                modal &&
                typeof inventoryWindow.openSalesEntryModal === "function" &&
                typeof inventoryWindow.addSalesEntryLine === "function" &&
                typeof inventoryWindow.updateSalesEntryLine === "function"
            ){
                clearInterval(timer);

                /* Open the EXISTING Inventory Sales Entry modal. */
                inventoryWindow.openSalesEntryModal();

                setTimeout(() => {
                    try{
                        const customer = doc.getElementById("salesCustomerName");
                        const mobile = doc.getElementById("salesCustomerMobile");
                        const gst = doc.getElementById("salesCustomerGST");
                        const address = doc.getElementById("salesCustomerAddress");
                        const notes = doc.getElementById("salesNotes");

                        if(customer) customer.value = saleData.customerName;
                        if(mobile) mobile.value = saleData.mobile;
                        if(gst) gst.value = saleData.customerGST;
                        if(address) address.value = saleData.address;
                        if(notes) notes.value = saleData.remarks;

                        /* Existing modal starts with one line. */
                        for(let i = 1; i < saleData.lines.length; i++){
                            inventoryWindow.addSalesEntryLine();
                        }

                        /*
                         * Set numeric fields first.  Set itemName last because
                         * Inventory's update function re-renders the rows.
                         */
                        saleData.lines.forEach((line, index) => {
                            inventoryWindow.updateSalesEntryLine(
                                index, "qty", line.qty
                            );
                            inventoryWindow.updateSalesEntryLine(
                                index, "sellingRate", line.sellingRate
                            );
                            inventoryWindow.updateSalesEntryLine(
                                index, "gstRate", line.gstRate
                            );
                            inventoryWindow.updateSalesEntryLine(
                                index, "itemName", line.itemName
                            );
                        });

                        /*
                         * Inventory normally shows only items already present in
                         * its item list. If a quotation item is not in that list,
                         * add a temporary option so the quotation item is still
                         * visibly selected in Sales Entry. Inventory.js remains
                         * untouched.
                         */
                        setTimeout(() => {
                            const selects = doc.querySelectorAll(
                                "#salesEntryLinesBody .sales-item-select"
                            );

                            saleData.lines.forEach((line, index) => {
                                const select = selects[index];
                                if(!select) return;

                                let option = [...select.options].find(
                                    opt => String(opt.value).trim().toLowerCase() ===
                                           line.itemName.trim().toLowerCase()
                                );

                                if(!option){
                                    option = doc.createElement("option");
                                    option.value = line.itemName;
                                    option.textContent = line.itemName;
                                    select.appendChild(option);
                                }

                                select.value = line.itemName;
                            });

                            if(customer) customer.value = saleData.customerName;
                            if(mobile) mobile.value = saleData.mobile;
                            if(gst) gst.value = saleData.customerGST;
                            if(address) address.value = saleData.address;
                            if(notes) notes.value = saleData.remarks;

                            inventoryWindow.focus();
                        }, 100);

                    }catch(error){
                        console.error(
                            "Quotation → Sales Entry fill error:",
                            error
                        );
                    }
                }, 150);

                return;
            }
        }catch(error){
            /* Keep trying while Inventory loads. */
        }

        if(attempts >= maxAttempts){
            clearInterval(timer);
            alert(
                "Inventory opened, but the existing Sales Entry modal could " +
                "not be controlled from quotation.js. Inventory.js was not changed."
            );
        }
    }, 100);
}

/* =========================================================
   ESCAPE
   ========================================================= */
function esc(value){
    return String(value ?? "")
        .replace(/[&<>"']/g, char => ({
            "&":"&amp;",
            "<":"&lt;",
            ">":"&gt;",
            '"':"&quot;",
            "'":"&#039;"
        }[char]));
}

/* =========================================================
   GLOBAL FUNCTIONS FOR HTML BUTTONS
   ========================================================= */
window.addRow = addRow;
window.printQuotation = printQuotation;
window.printSaved = printSaved;
window.clearQuotation = clearQuotation;
window.convertQuotationToSale = convertQuotationToSale;
window.getQuotationById = getQuotationById;
