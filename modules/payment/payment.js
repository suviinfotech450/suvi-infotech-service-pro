"use strict";

const PAYMENT_STORAGE_KEY = "suviInfotechPayments";
const PAYMENT_FIRM_KEY = "SUVI_INFOTECH_SELECTED_FIRM";

function getSelectedFirm() {
    return (
        localStorage.getItem(PAYMENT_FIRM_KEY)
        || "SUVI INFOTECH"
    ).trim();
}
let editingPaymentId = null;


/* =========================
   BASIC HELPERS
========================= */

function getPayments() {
    try {
        const data = localStorage.getItem(PAYMENT_STORAGE_KEY);
        const parsed = data ? JSON.parse(data) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Payment data read error:", error);
        return [];
    }
}

function savePayments(data) {
    localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(data));
}

function money(value) {
    return "₹" + Number(value || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function formatDate(dateValue) {
    if (!dateValue) return "-";

    const date = new Date(dateValue + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function todayDate() {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   RECEIPT NUMBER
========================= */

function generateReceiptNo() {
    const payments = getPayments().filter(
    payment => payment.firmName === getSelectedFirm()
);
    let maxNumber = 0;

    payments.forEach(payment => {
        const match = String(payment.receiptNo || "")
            .match(/^PAY(\d+)$/i);

        if (match) {
            maxNumber = Math.max(
                maxNumber,
                Number(match[1]) || 0
            );
        }
    });

    return "PAY" + String(maxNumber + 1).padStart(3, "0");
}


/* =========================
   FORM
========================= */

function preparePaymentForm() {

    const receipt = document.getElementById("receiptNo");
    const date = document.getElementById("paymentDate");

    if (receipt) {
        receipt.value = generateReceiptNo();
    }

    if (date) {
        date.value = todayDate();
    }

    calculateBalance();
}

function calculateBalance() {

    const billAmount =
        Number(document.getElementById("billAmount")?.value) || 0;

    const previousPaid =
        Number(document.getElementById("previousPaid")?.value) || 0;

    const paidAmount =
        Number(document.getElementById("paidAmount")?.value) || 0;

    const balance =
        Math.max(0, billAmount - previousPaid - paidAmount);

    const balanceField =
        document.getElementById("balanceAmount");

    if (balanceField) {
        balanceField.value = balance.toFixed(2);
    }
}


/* =========================
   SAVE PAYMENT
========================= */

function savePayment(event) {

    if (event) {
        event.preventDefault();
    }

    const customerName =
        document.getElementById("customerName")?.value.trim() || "";

    const mobile =
        document.getElementById("mobile")?.value.trim() || "";

    const paymentDate =
        document.getElementById("paymentDate")?.value || "";

    const paymentMode =
        document.getElementById("paymentMode")?.value || "";

    const paidAmount =
        Number(document.getElementById("paidAmount")?.value) || 0;

    if (!customerName) {
        alert("Please enter Customer Name.");
        return;
    }

    if (!paymentDate) {
        alert("Please select Payment Date.");
        return;
    }

    if (!paymentMode) {
        alert("Please select Payment Mode.");
        return;
    }

    if (paidAmount <= 0) {
        alert("Please enter valid Paid Amount.");
        return;
    }

    if (mobile && !/^\d{10}$/.test(mobile)) {
        alert("Mobile Number must be 10 digits.");
        return;
    }

    calculateBalance();

    const billAmount =
        Number(document.getElementById("billAmount")?.value) || 0;

    const previousPaid =
        Number(document.getElementById("previousPaid")?.value) || 0;

    const balanceAmount =
        Math.max(0, billAmount - previousPaid - paidAmount);

   const record = {
    id: editingPaymentId || Date.now(),

    firmName: getSelectedFirm(),

    receiptNo:
            document.getElementById("receiptNo")?.value ||
            generateReceiptNo(),
        paymentDate,
        customerName,
        mobile,
        invoiceNo:
            document.getElementById("invoiceNo")?.value.trim() || "",
        billAmount,
        previousPaid,
        paidAmount,
        balanceAmount,
        paymentMode,
        remarks:
            document.getElementById("remarks")?.value.trim() || "",
        createdAt:
            new Date().toISOString()
    };

    const payments = getPayments();

    if (editingPaymentId) {

        const index = payments.findIndex(
            item => item.id === editingPaymentId
        );

        if (index !== -1) {
            payments[index] = record;
        }

        editingPaymentId = null;

    } else {
        payments.push(record);
    }

    savePayments(payments);

    alert("Payment saved successfully.");

    resetPaymentForm();
    renderPaymentHistory();
    updatePaymentSummary();
}


/* =========================
   RESET
========================= */

function resetPaymentForm() {

    const form = document.getElementById("paymentForm");

    if (form) {
        form.reset();
    }

    editingPaymentId = null;

    const receipt =
        document.getElementById("receiptNo");

    const date =
        document.getElementById("paymentDate");

    const previousPaid =
        document.getElementById("previousPaid");

    const balance =
        document.getElementById("balanceAmount");

    if (receipt) {
        receipt.value = generateReceiptNo();
    }

    if (date) {
        date.value = todayDate();
    }

    if (previousPaid) {
        previousPaid.value = "0";
    }

    if (balance) {
        balance.value = "0.00";
    }
}


/* =========================
   SUMMARY
========================= */

function updatePaymentSummary() {

    const payments = getPayments();

    let totalReceived = 0;
    let totalOutstanding = 0;
    let todayCollection = 0;

    const today = todayDate();

    payments.forEach(payment => {

        totalReceived +=
            Number(payment.paidAmount) || 0;

        totalOutstanding +=
            Number(payment.balanceAmount) || 0;

        if (payment.paymentDate === today) {
            todayCollection +=
                Number(payment.paidAmount) || 0;
        }
    });

    const receivedElement =
        document.getElementById("totalReceived");

    const outstandingElement =
        document.getElementById("totalOutstanding");

    const todayElement =
        document.getElementById("todayCollection");

    const countElement =
        document.getElementById("totalPayments");

    if (receivedElement) {
        receivedElement.textContent =
            money(totalReceived);
    }

    if (outstandingElement) {
        outstandingElement.textContent =
            money(totalOutstanding);
    }

    if (todayElement) {
        todayElement.textContent =
            money(todayCollection);
    }

    if (countElement) {
        countElement.textContent =
            payments.length;
    }
}


/* =========================
   FILTER
========================= */

function getFilteredPayments() {

    const search =
        document.getElementById("searchPayment")
            ?.value.trim()
            .toLowerCase() || "";

    const fromDate =
        document.getElementById("fromDate")
            ?.value || "";

    const toDate =
        document.getElementById("toDate")
            ?.value || "";

    const filterMode =
        document.getElementById("filterMode")
            ?.value || "";

    return getPayments()
    .filter(payment => payment.firmName === getSelectedFirm())
    .filter(payment => {
        const searchable = [
            payment.receiptNo,
            payment.customerName,
            payment.mobile,
            payment.invoiceNo,
            payment.remarks
        ]
            .join(" ")
            .toLowerCase();

        if (search && !searchable.includes(search)) {
            return false;
        }

        if (fromDate &&
            payment.paymentDate < fromDate) {
            return false;
        }

        if (toDate &&
            payment.paymentDate > toDate) {
            return false;
        }

        if (filterMode &&
            payment.paymentMode !== filterMode) {
            return false;
        }

        return true;
    });
}


function applyPaymentFilters() {
    renderPaymentHistory();
}


function clearPaymentFilters() {

    const search =
        document.getElementById("searchPayment");

    const from =
        document.getElementById("fromDate");

    const to =
        document.getElementById("toDate");

    const mode =
        document.getElementById("filterMode");

    if (search) search.value = "";
    if (from) from.value = "";
    if (to) to.value = "";
    if (mode) mode.value = "";

    renderPaymentHistory();
}


/* =========================
   HISTORY
========================= */

function renderPaymentHistory() {

    const body =
        document.getElementById("paymentHistoryBody");

    const noData =
        document.getElementById("noPaymentData");

    if (!body) return;

    const payments = getFilteredPayments();

    body.innerHTML = "";

    if (!payments.length) {

        if (noData) {
            noData.style.display = "block";
        }

        return;
    }

    if (noData) {
        noData.style.display = "none";
    }

    payments
        .slice()
        .sort((a, b) =>
            String(b.paymentDate || "")
                .localeCompare(
                    String(a.paymentDate || "")
                )
        )
        .forEach((payment, index) => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${index + 1}</td>

                <td>
                    <strong>
                        ${escapeHtml(payment.receiptNo)}
                    </strong>
                </td>

                <td>
                    ${formatDate(payment.paymentDate)}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(payment.customerName)}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(payment.mobile || "-")}
                </td>

                <td>
                    ${escapeHtml(payment.invoiceNo || "-")}
                </td>

                <td>
                    ${money(payment.billAmount)}
                </td>

                <td class="amount-paid">
                    ${money(payment.paidAmount)}
                </td>

                <td class="amount-balance">
                    ${money(payment.balanceAmount)}
                </td>

                <td>
                    <span class="mode-badge">
                        ${escapeHtml(payment.paymentMode)}
                    </span>
                </td>

                <td>
                   <button
    type="button"
    class="action-btn"
    onclick="sendPaymentReminder(${payment.id})">
    Reminder
</button>

<button
    type="button"
    class="action-btn"
    onclick="deletePayment(${payment.id})">
    Delete
</button>                </td>
            `;

            body.appendChild(row);
        });
}


/* =========================
   DELETE
========================= */

function deletePayment(id) {

    const payments = getPayments();

    const payment =
        payments.find(item => item.id === id);

    if (!payment) return;

    const confirmDelete =
        confirm(
            `Delete payment ${payment.receiptNo}?`
        );

    if (!confirmDelete) {
        return;
    }

    const updated =
        payments.filter(item => item.id !== id);

    savePayments(updated);

    renderPaymentHistory();
    updatePaymentSummary();

    alert("Payment deleted successfully.");
}


/* =========================
   EVENTS
========================= */

document.addEventListener("DOMContentLoaded", function () {

    preparePaymentForm();

    const firmName =
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM")
        || "SUVI INFOTECH";

    const footerFirmName =
        document.getElementById("paymentFooterFirmName");

    if (footerFirmName) {
        footerFirmName.textContent = firmName.trim();
    }

    const form =
        document.getElementById("paymentForm");

    if (form) {
        form.addEventListener(
            "submit",
            savePayment
        );
    }

    [
        "billAmount",
        "previousPaid",
        "paidAmount"
    ].forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.addEventListener(
                "input",
                calculateBalance
            );
        }
    });

    const search =
        document.getElementById("searchPayment");

    if (search) {
        search.addEventListener(
            "input",
            renderPaymentHistory
        );
    }

    renderPaymentHistory();
    updatePaymentSummary();
});

/* =========================
   GLOBAL FUNCTIONS
========================= */

window.resetPaymentForm = resetPaymentForm;
window.applyPaymentFilters = applyPaymentFilters;
window.clearPaymentFilters = clearPaymentFilters;
window.deletePayment = deletePayment;
window.calculateBalance = calculateBalance;
function sendPaymentReminder(id) {

    const payments = getPayments();

    const payment = payments.find(item => item.id === id);

    if (!payment) return;

    const totalAmount = Number(payment.billAmount) || 0;
    const paidAmount = Number(payment.paidAmount) || 0;
    const balanceAmount = Number(payment.balanceAmount) || 0;

    const message =
`Payment Reminder - SUVI INFOTECH

Dear ${payment.customerName},

Invoice / Bill No: ${payment.invoiceNo || "-"}

Total Bill Amount: ${money(totalAmount)}
Paid Amount: ${money(paidAmount)}
Balance Amount: ${money(balanceAmount)}

Kindly clear the pending balance amount.

Thank you,
SUVI INFOTECH`;

    if (payment.mobile && /^\d{10}$/.test(payment.mobile)) {

        const whatsappUrl =
            "https://wa.me/91" +
            payment.mobile +
            "?text=" +
            encodeURIComponent(message);

        window.open(whatsappUrl, "_blank");

    } else {

        alert(message);
    }
}

window.sendPaymentReminder = sendPaymentReminder;