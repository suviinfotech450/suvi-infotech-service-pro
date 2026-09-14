"use strict";

const EXPENSE_STORAGE_KEY = "suviInfotechExpenses";

let editingExpenseId = null;

/* =========================
   DASHBOARD
========================= */

function goDashboard() {
    window.top.location.href = "../../dashboard.html";
}

/* =========================
   STORAGE
========================= */

function getExpenses() {
    try {
        const data = localStorage.getItem(EXPENSE_STORAGE_KEY);
        const expenses = data ? JSON.parse(data) : [];

        return Array.isArray(expenses) ? expenses : [];
    } catch (error) {
        console.error("Expense storage read error:", error);
        return [];
    }
}

function saveExpenses(expenses) {
    localStorage.setItem(
        EXPENSE_STORAGE_KEY,
        JSON.stringify(expenses)
    );
}

/* =========================
   DATE
========================= */

function getTodayDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/* =========================
   EXPENSE ID
========================= */

function generateExpenseId() {
    const expenses = getExpenses();

    let maxNumber = 0;

    expenses.forEach(expense => {
        const match = String(expense.expenseId || "").match(/^EXP(\d+)$/i);

        if (match) {
            maxNumber = Math.max(
                maxNumber,
                Number(match[1])
            );
        }
    });

    return `EXP${String(maxNumber + 1).padStart(3, "0")}`;
}

/* =========================
   MONEY
========================= */

function formatMoney(amount) {
    return "₹" + Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/* =========================
   INITIAL LOAD
========================= */

document.addEventListener("DOMContentLoaded", function () {

    const dateInput = document.getElementById("expenseDate");
    const idInput = document.getElementById("expenseId");

    if (dateInput) {
        dateInput.value = getTodayDate();
    }

    if (idInput) {
        idInput.value = generateExpenseId();
    }

    const form = document.getElementById("expenseForm");

    if (form) {
        form.addEventListener("submit", saveExpense);
    }

    updateExpenseSummary();
    renderExpenseHistory();
});

/* =========================
   SAVE EXPENSE
========================= */

function saveExpense(event) {

    event.preventDefault();

    const date = document.getElementById("expenseDate").value;
    const category = document.getElementById("expenseCategory").value;
    const amount = Number(
        document.getElementById("expenseAmount").value
    ) || 0;

    const description =
        document.getElementById("expenseDescription").value.trim();

    const paymentMode =
        document.getElementById("paymentMode").value;

    const paidTo =
        document.getElementById("paidTo").value.trim();

    const notes =
        document.getElementById("expenseNotes").value.trim();

    if (!date) {
        alert("Please select expense date.");
        return;
    }

    if (!category) {
        alert("Please select expense category.");
        return;
    }

    if (!description) {
        alert("Please enter expense description.");
        return;
    }

    if (amount <= 0) {
        alert("Please enter a valid expense amount.");
        return;
    }

    if (!paymentMode) {
        alert("Please select payment mode.");
        return;
    }

    const expenses = getExpenses();

    if (editingExpenseId) {

        const index = expenses.findIndex(
            expense => expense.id === editingExpenseId
        );

        if (index !== -1) {

            expenses[index] = {
                ...expenses[index],
                date,
                category,
                description,
                amount,
                paymentMode,
                paidTo,
                notes,
                updatedAt: new Date().toISOString()
            };
        }

        editingExpenseId = null;

        saveExpenses(expenses);

        alert("Expense updated successfully.");

    } else {

        const expense = {
            id: Date.now(),
            expenseId: generateExpenseId(),
            date,
            category,
            description,
            amount,
            paymentMode,
            paidTo,
            notes,
            createdAt: new Date().toISOString()
        };

        expenses.push(expense);

        saveExpenses(expenses);

        alert("Expense saved successfully.");
    }

    resetExpenseForm();
    updateExpenseSummary();
    renderExpenseHistory();
}

/* =========================
   RESET
========================= */

function resetExpenseForm() {

    const form = document.getElementById("expenseForm");

    if (form) {
        form.reset();
    }

    editingExpenseId = null;

    const dateInput = document.getElementById("expenseDate");
    const idInput = document.getElementById("expenseId");

    if (dateInput) {
        dateInput.value = getTodayDate();
    }

    if (idInput) {
        idInput.value = generateExpenseId();
    }
}

/* =========================
   EDIT
========================= */

function editExpense(id) {

    const expenses = getExpenses();

    const expense = expenses.find(
        item => item.id === id
    );

    if (!expense) {
        return;
    }

    editingExpenseId = id;

    document.getElementById("expenseDate").value =
        expense.date || "";

    document.getElementById("expenseId").value =
        expense.expenseId || "";

    document.getElementById("expenseCategory").value =
        expense.category || "";

    document.getElementById("expenseAmount").value =
        expense.amount || "";

    document.getElementById("expenseDescription").value =
        expense.description || "";

    document.getElementById("paymentMode").value =
        expense.paymentMode || "";

    document.getElementById("paidTo").value =
        expense.paidTo || "";

    document.getElementById("expenseNotes").value =
        expense.notes || "";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

/* =========================
   DELETE
========================= */

function deleteExpense(id) {

    const expenses = getExpenses();

    const expense = expenses.find(
        item => item.id === id
    );

    if (!expense) {
        return;
    }

    const confirmDelete = confirm(
        `Delete expense ${expense.expenseId}?`
    );

    if (!confirmDelete) {
        return;
    }

    const updatedExpenses = expenses.filter(
        item => item.id !== id
    );

    saveExpenses(updatedExpenses);

    updateExpenseSummary();
    renderExpenseHistory();
}

/* =========================
   SUMMARY
========================= */

function updateExpenseSummary() {

    const expenses = getExpenses();

    const today = getTodayDate();

    const now = new Date();

    const currentMonth =
        now.getMonth();

    const currentYear =
        now.getFullYear();

    let total = 0;
    let todayTotal = 0;
    let monthTotal = 0;
    let yearTotal = 0;

    expenses.forEach(expense => {

        const amount =
            Number(expense.amount) || 0;

        total += amount;

        if (expense.date === today) {
            todayTotal += amount;
        }

        if (expense.date) {

            const expenseDate =
                new Date(expense.date + "T00:00:00");

            if (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
            ) {
                monthTotal += amount;
            }

            if (
                expenseDate.getFullYear() === currentYear
            ) {
                yearTotal += amount;
            }
        }
    });

    document.getElementById("totalExpense").textContent =
        formatMoney(total);

    document.getElementById("todayExpense").textContent =
        formatMoney(todayTotal);

    document.getElementById("monthExpense").textContent =
        formatMoney(monthTotal);

    document.getElementById("yearExpense").textContent =
        formatMoney(yearTotal);
}

/* =========================
   HISTORY
========================= */

function renderExpenseHistory() {

    const body =
        document.getElementById("expenseHistoryBody");

    if (!body) {
        return;
    }

    const search =
        (document.getElementById("expenseSearch")?.value || "")
            .trim()
            .toLowerCase();

    const category =
        document.getElementById("filterCategory")?.value || "";

    const fromDate =
        document.getElementById("filterFrom")?.value || "";

    const toDate =
        document.getElementById("filterTo")?.value || "";

    let expenses = getExpenses();

    expenses = expenses.filter(expense => {

        const matchesSearch =
            !search ||
            String(expense.expenseId || "")
                .toLowerCase()
                .includes(search) ||
            String(expense.category || "")
                .toLowerCase()
                .includes(search) ||
            String(expense.description || "")
                .toLowerCase()
                .includes(search) ||
            String(expense.paidTo || "")
                .toLowerCase()
                .includes(search) ||
            String(expense.paymentMode || "")
                .toLowerCase()
                .includes(search);

        const matchesCategory =
            !category ||
            expense.category === category;

        const matchesFrom =
            !fromDate ||
            expense.date >= fromDate;

        const matchesTo =
            !toDate ||
            expense.date <= toDate;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesFrom &&
            matchesTo
        );
    });

    expenses.sort(
        (a, b) =>
            String(b.date || "").localeCompare(
                String(a.date || "")
            )
    );

    if (expenses.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="9" class="empty-row">
                    No expenses found
                </td>
            </tr>
        `;

    } else {

        body.innerHTML = expenses.map(
            (expense, index) => `
                <tr>

                    <td>${index + 1}</td>

                    <td>${formatDisplayDate(expense.date)}</td>

                    <td>${escapeHtml(expense.expenseId)}</td>

                    <td>${escapeHtml(expense.category)}</td>

                    <td>${escapeHtml(expense.description)}</td>

                    <td>${escapeHtml(expense.paymentMode)}</td>

                    <td>${escapeHtml(expense.paidTo || "-")}</td>

                    <td class="amount-cell">
                        ${formatMoney(expense.amount)}
                    </td>

                    <td>
                        <button
                            type="button"
                            class="delete-btn"
                            onclick="deleteExpense(${expense.id})"
                        >
                            Delete
                        </button>
                    </td>

                </tr>
            `
        ).join("");
    }

    const count =
        document.getElementById("expenseCount");

    if (count) {
        count.textContent =
            `${expenses.length} record${expenses.length === 1 ? "" : "s"}`;
    }
}

/* =========================
   DATE DISPLAY
========================= */

function formatDisplayDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const year = parts[0];
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const months = [
        "Jan", "Feb", "Mar", "Apr",
        "May", "Jun", "Jul", "Aug",
        "Sep", "Oct", "Nov", "Dec"
    ];

    return `${day}-${months[month - 1]}-${year}`;
}

/* =========================
   FILTER CLEAR
========================= */

function clearExpenseFilters() {

    const search =
        document.getElementById("expenseSearch");

    const category =
        document.getElementById("filterCategory");

    const from =
        document.getElementById("filterFrom");

    const to =
        document.getElementById("filterTo");

    if (search) search.value = "";
    if (category) category.value = "";
    if (from) from.value = "";
    if (to) to.value = "";

    renderExpenseHistory();
}

/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================
   GLOBAL FUNCTIONS
========================= */

window.goDashboard = goDashboard;
window.resetExpenseForm = resetExpenseForm;
window.renderExpenseHistory = renderExpenseHistory;
window.clearExpenseFilters = clearExpenseFilters;
window.editExpense = editExpense;
window.deleteExpense = deleteExpense;