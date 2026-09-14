const STORAGE_KEY = "suviInfotechClientReminders";

let reminders = [];

document.addEventListener("DOMContentLoaded", () => {
    loadReminders();
    prepareForm();
    renderReminders();
    updateSummary();

    document
        .getElementById("reminderForm")
        .addEventListener("submit", saveReminder);

    document
    .getElementById("totalAmount")
    .addEventListener("input", calculatePendingAmount);

document
    .getElementById("paidAmount")
    .addEventListener("input", calculatePendingAmount);    
});

function loadReminders() {
    try {
        reminders = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (error) {
        reminders = [];
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}

function prepareForm() {
    document.getElementById("reminderId").value = generateReminderId();

    const today = new Date();
    const date = today.toISOString().split("T")[0];

    document.getElementById("reminderDate").value = date;
}

function generateReminderId() {
    let max = 0;

    reminders.forEach(item => {
        const number = parseInt(
            String(item.reminderId || "").replace(/\D/g, ""),
            10
        );

        if (!isNaN(number) && number > max) {
            max = number;
        }
    });

    return "REM" + String(max + 1).padStart(3, "0");
}

function saveReminder(event) {
    event.preventDefault();

    const clientName = document
        .getElementById("clientName")
        .value
        .trim();

    const mobile = document
        .getElementById("mobile")
        .value
        .trim();

    if (!/^\d{10}$/.test(mobile)) {
        alert("Please enter a valid 10 digit mobile number.");
        return;
    }

    const reminder = {
        reminderId: document.getElementById("reminderId").value,
        reminderDate: document.getElementById("reminderDate").value,
        clientName: clientName,
        mobile: mobile,
            invoiceNo: document.getElementById("invoiceNo").value.trim(),
    totalAmount: Number(document.getElementById("totalAmount").value) || 0,
    paidAmount: Number(document.getElementById("paidAmount").value) || 0,
    pendingAmount: Number(document.getElementById("pendingAmount").value) || 0,
        reminderType: document.getElementById("reminderType").value,
        priority: document.getElementById("priority").value,
        message: document.getElementById("message").value.trim(),
        status: "Pending",
        createdAt: new Date().toISOString()
    };

    reminders.push(reminder);

    saveToStorage();

    alert("Client reminder saved successfully.");

    clearForm();
    renderReminders();
    updateSummary();
}

function clearForm() {
    document.getElementById("reminderForm").reset();

    document.getElementById("reminderId").value =
        generateReminderId();

    const today = new Date();
    document.getElementById("reminderDate").value =
        today.toISOString().split("T")[0];

    document.getElementById("priority").value = "Normal";
}

function renderReminders() {

    const tbody = document.getElementById("reminderTableBody");
    const emptyMessage = document.getElementById("emptyMessage");

    tbody.innerHTML = "";

    const search =
        document
            .getElementById("searchInput")
            .value
            .trim()
            .toLowerCase();

    const statusFilter =
        document.getElementById("statusFilter").value;

    const typeFilter =
        document.getElementById("typeFilter").value;

    const dateFilter =
        document.getElementById("dateFilter").value;

    const filtered = reminders.filter(item => {

        const searchableText = [
            item.reminderId,
            item.clientName,
            item.mobile,
            item.reminderType,
            item.message
        ]
            .join(" ")
            .toLowerCase();

        const searchMatch =
            !search || searchableText.includes(search);

        const statusMatch =
            statusFilter === "All" ||
            item.status === statusFilter;

        const typeMatch =
            typeFilter === "All" ||
            item.reminderType === typeFilter;

        const dateMatch =
            !dateFilter ||
            item.reminderDate === dateFilter;

        return (
            searchMatch &&
            statusMatch &&
            typeMatch &&
            dateMatch
        );
    });

    filtered.sort((a, b) => {
        return (
            new Date(a.reminderDate) -
            new Date(b.reminderDate)
        );
    });

    if (filtered.length === 0) {
        emptyMessage.style.display = "block";
        return;
    }

    emptyMessage.style.display = "none";

    filtered.forEach(item => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(item.reminderId)}</td>

            <td>${formatDate(item.reminderDate)}</td>

            <td>${escapeHTML(item.clientName)}</td>

            <td>${escapeHTML(item.mobile)}</td>

            <td>${escapeHTML(item.reminderType)}</td>

            <td>
                <span class="priority-badge ${getPriorityClass(item.priority)}">
                    ${escapeHTML(item.priority)}
                </span>
            </td>

            <td>${escapeHTML(item.message || "-")}</td>

            <td>
                <span class="status-badge ${getStatusClass(item.status)}">
                    ${escapeHTML(item.status)}
                </span>
            </td>

            <td>

                <button
                    class="action-btn whatsapp-btn"
                    onclick="sendWhatsApp('${item.reminderId}')"
                    title="Send WhatsApp">
                    <i class="fa-brands fa-whatsapp"></i>
                </button>

                ${
                    item.status !== "Completed"
                    ? `
                        <button
                            class="action-btn complete-btn"
                            onclick="completeReminder('${item.reminderId}')"
                            title="Complete">
                            <i class="fa-solid fa-check"></i>
                        </button>
                    `
                    : ""
                }

                <button
                    class="action-btn delete-btn"
                    onclick="deleteReminder('${item.reminderId}')"
                    title="Delete">
                    <i class="fa-solid fa-trash"></i>
                </button>

            </td>
        `;

        tbody.appendChild(row);
    });
}

function sendWhatsApp(id) {

    const item = reminders.find(
        reminder => reminder.reminderId === id
    );

    if (!item) {
        alert("Reminder not found.");
        return;
    }

    let mobile = String(item.mobile || "")
        .replace(/\D/g, "");

    if (mobile.length !== 10) {
        alert("Invalid 10 digit mobile number.");
        return;
    }

    mobile = "91" + mobile;

    const reminderDate = formatDate(item.reminderDate);

    const totalAmount = Number(item.totalAmount) || 0;
    const paidAmount = Number(item.paidAmount) || 0;
    const pendingAmount = Number(item.pendingAmount) || 0;

    const message =
`Dear ${item.clientName},

This is a payment reminder from SUVI INFOTECH.

Invoice / Bill No: ${item.invoiceNo || "-"}

Total Amount: ₹${totalAmount.toFixed(2)}
Paid Amount: ₹${paidAmount.toFixed(2)}
Pending Amount: ₹${pendingAmount.toFixed(2)}

Reminder Date: ${reminderDate}

Kindly clear the pending amount.

Thank you,
SUVI INFOTECH
Mobile: 9738413450`;

    const whatsappURL =
        "https://wa.me/" +
        mobile +
        "?text=" +
        encodeURIComponent(message);

    window.open(whatsappURL, "_blank");
}
function calculatePendingAmount() {

    const totalAmount =
        Number(document.getElementById("totalAmount").value) || 0;

    const paidAmount =
        Number(document.getElementById("paidAmount").value) || 0;

    const pendingAmount =
        Math.max(0, totalAmount - paidAmount);

    document.getElementById("pendingAmount").value =
        pendingAmount.toFixed(2);
}
function completeReminder(id) {

    const item = reminders.find(
        reminder => reminder.reminderId === id
    );

    if (!item) return;

    item.status = "Completed";
    item.completedAt = new Date().toISOString();

    saveToStorage();

    renderReminders();
    updateSummary();
}

function deleteReminder(id) {

    const confirmDelete = confirm(
        "Delete this reminder?"
    );

    if (!confirmDelete) return;

    reminders = reminders.filter(
        item => item.reminderId !== id
    );

    saveToStorage();

    renderReminders();
    updateSummary();
}

function updateSummary() {

    const today = new Date();
    const todayString = today.toISOString().split("T")[0];

    let todayCount = 0;
    let upcomingCount = 0;
    let overdueCount = 0;
    let completedCount = 0;

    reminders.forEach(item => {

        if (item.status === "Completed") {
            completedCount++;
            return;
        }

        if (item.reminderDate === todayString) {
            todayCount++;
        } else if (item.reminderDate > todayString) {
            upcomingCount++;
        } else {
            overdueCount++;
        }
    });

    document.getElementById("todayCount").textContent =
        todayCount;

    document.getElementById("upcomingCount").textContent =
        upcomingCount;

    document.getElementById("overdueCount").textContent =
        overdueCount;

    document.getElementById("completedCount").textContent =
        completedCount;
}

function formatDate(dateString) {

    if (!dateString) return "-";

    const parts = dateString.split("-");

    if (parts.length !== 3) return dateString;

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function getStatusClass(status) {

    if (status === "Completed") {
        return "status-completed";
    }

    return "status-pending";
}

function getPriorityClass(priority) {

    if (priority === "Urgent") {
        return "priority-urgent";
    }

    if (priority === "High") {
        return "priority-high";
    }

    return "priority-normal";
}

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function goBack() {
    window.history.back();
}

function goDashboard() {
    window.location.href = "../../dashboard.html";
}