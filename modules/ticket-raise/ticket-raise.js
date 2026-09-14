/* =========================================================
   SUVI INFOTECH - TICKET RAISE JS
   Handles:
   - Ticket ID generation
   - Date & Time
   - Client Master search
   - Auto Mobile / Address
   - Ticket save
   - Ticket history
   - History search
   - Status / Reason
   ========================================================= */

(function () {
    "use strict";

    const TICKET_STORAGE_KEY = "suvi_ticket_data";

    const CLIENT_STORAGE_KEYS = [
    "suviInfotechClients"
];

    const form = document.getElementById("ticketForm");

    const ticketId = document.getElementById("ticketId");
    const ticketDate = document.getElementById("ticketDate");
    const ticketTime = document.getElementById("ticketTime");

    const clientSearch = document.getElementById("clientSearch");
    const clientSuggestions = document.getElementById("clientSuggestions");

    const clientName = document.getElementById("clientName");
    const mobileNumber = document.getElementById("mobileNumber");
    const address = document.getElementById("address");

    const status = document.getElementById("status");
    const reasonGroup = document.getElementById("reasonGroup");
    const reason = document.getElementById("reason");
    const printerModelGroup =
    document.getElementById("printerModelGroup");

const printerModel =
    document.getElementById("printerModel");
    const category =
    document.getElementById("category");

    const historySearch =
        document.getElementById("ticketHistorySearch");

    const historyBody =
        document.getElementById("ticketHistoryBody");


    /* =====================================================
       STORAGE
       ===================================================== */

    function getTickets() {
        try {
            const data = JSON.parse(
                localStorage.getItem(TICKET_STORAGE_KEY)
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {
            return [];
        }
    }


    function saveTickets(data) {
        try {
            localStorage.setItem(
                TICKET_STORAGE_KEY,
                JSON.stringify(data)
            );
        } catch (error) {
            console.error("Ticket storage error:", error);
        }
    }


    /* =====================================================
       CLIENT MASTER
       ===================================================== */

    function getClients() {

        for (const key of CLIENT_STORAGE_KEYS) {

            try {

                const data = JSON.parse(
                    localStorage.getItem(key)
                );

                if (Array.isArray(data)) {
                    return data;
                }

            } catch (error) {
                /* Continue checking next key */
            }
        }

        return [];
    }


    function getClientName(client) {
        return (
            client.clientName ||
            client.companyName ||
            client.name ||
            client.contactPerson ||
            ""
        );
    }


    function getClientMobile(client) {
        return (
            client.mobileNumber ||
            client.mobile ||
            client.phone ||
            ""
        );
    }


    function getClientAddress(client) {

        if (client.address) {
            return client.address;
        }

        const parts = [
            client.city,
            client.state,
            client.pincode
        ].filter(Boolean);

        return parts.join(", ");
    }


    /* =====================================================
       DATE / TIME
       ===================================================== */

    function updateDateTime() {

        const now = new Date();

        const day = String(
            now.getDate()
        ).padStart(2, "0");

        const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        const month =
            monthNames[now.getMonth()];

        const year =
            now.getFullYear();

        let hours = now.getHours();

        const minutes = String(
            now.getMinutes()
        ).padStart(2, "0");

        const seconds = String(
            now.getSeconds()
        ).padStart(2, "0");

        const ampm =
            hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12;

        const formattedHours =
            String(hours).padStart(2, "0");

        ticketDate.value =
            `${day}-${month}-${year}`;

        ticketTime.value =
            `${formattedHours}:${minutes}:${seconds} ${ampm}`;
    }


    /* =====================================================
       TICKET ID
       ===================================================== */

    function generateTicketId() {

        const tickets = getTickets();

        let maxNumber = 0;

        tickets.forEach(function (ticket) {

            const match =
                String(ticket.ticketId || "")
                    .match(/^TKT(\d+)$/i);

            if (match) {

                const number =
                    parseInt(match[1], 10);

                if (number > maxNumber) {
                    maxNumber = number;
                }
            }
        });

        return "TKT" +
            String(maxNumber + 1).padStart(3, "0");
    }


    function prepareNewTicket() {

        ticketId.value =
            generateTicketId();

        updateDateTime();

        status.value = "Open";

        updateReasonVisibility();
    }


    /* =====================================================
       CLIENT SEARCH
       ===================================================== */

    function showClientSuggestions() {

        const search =
            clientSearch.value
                .trim()
                .toLowerCase();

        clientSuggestions.innerHTML = "";

        if (!search) {
            return;
        }

        const clients = getClients();

        const matches = clients.filter(function (client) {

            const name =
                getClientName(client)
                    .toLowerCase();

            const mobile =
                String(
                    getClientMobile(client)
                ).toLowerCase();

            return (
                name.includes(search) ||
                mobile.includes(search)
            );

        }).slice(0, 10);


        if (!matches.length) {

            const empty =
                document.createElement("div");

            empty.className =
                "suggestion-item";

            empty.textContent =
                "No client found";

            clientSuggestions.appendChild(empty);

            return;
        }


        matches.forEach(function (client) {

            const item =
                document.createElement("div");

            item.className =
                "suggestion-item";

            const name =
                getClientName(client);

            const mobile =
                getClientMobile(client);

            item.innerHTML = `
                <span class="suggestion-name">
                    ${escapeHtml(name)}
                </span>
                <span class="suggestion-mobile">
                    ${escapeHtml(mobile)}
                </span>
            `;

            item.addEventListener(
                "click",
                function () {

                    selectClient(client);

                    clientSuggestions.innerHTML = "";
                }
            );

            clientSuggestions.appendChild(item);
        });
    }


    function selectClient(client) {

        const name =
            getClientName(client);

        const mobile =
            getClientMobile(client);

        const clientAddress =
            getClientAddress(client);

        clientName.value = name;
        mobileNumber.value = mobile;
        address.value = clientAddress;

        clientSearch.value =
            name || mobile;
    }


    /* =====================================================
       STATUS / REASON
       ===================================================== */

    function updateReasonVisibility() {

        const currentStatus =
            status.value;

        if (currentStatus === "Complete") {

            reasonGroup.style.display = "none";

            reason.value = "";

            return;
        }

        reasonGroup.style.display = "";
    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       STATUS DISPLAY
       ===================================================== */

    function displayStatus(value) {

        const statusValue =
            String(value || "");

        const displayValue =
            statusValue === "Complete"
                ? "Completed"
                : statusValue;

        const className =
            statusValue
                .toLowerCase();

        return `
            <span class="ticket-status status-${escapeHtml(className)}">
                ${escapeHtml(displayValue)}
            </span>
        `;
    }


    /* =====================================================
       SAVE TICKET
       ===================================================== */

    function saveTicket(event) {

        event.preventDefault();

        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        const currentStatus =
            status.value;


        const newTicket = {

            ticketId:
                ticketId.value,

            date:
                ticketDate.value,

            time:
                ticketTime.value,

            clientName:
                clientName.value.trim(),

            mobileNumber:
                mobileNumber.value.trim(),

            address:
                address.value.trim(),

            complaint:
                document
                    .getElementById("complaint")
                    .value.trim(),

            category:
                document
                    .getElementById("category")
                    .value,
                    printerModel:
    printerModel.value.trim(),

            priority:
                document
                    .getElementById("priority")
                    .value,

                    printerModel:
    document
        .getElementById("printerModel")
        .value.trim(),

            technician:
                document
                    .getElementById("technician")
                    .value.trim(),

            status:
                currentStatus,

            reason:
                currentStatus === "Complete"
                    ? ""
                    : reason.value.trim(),

            remarks:
                document
                    .getElementById("remarks")
                    .value.trim(),

            createdAt:
                new Date().toISOString()
        };


        const tickets =
            getTickets();

        tickets.push(newTicket);

        saveTickets(tickets);


        alert(
            "Ticket " +
            newTicket.ticketId +
            " saved successfully."
        );


        form.reset();

        prepareNewTicket();

        renderHistory();
    }


    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory() {

        const tickets =
            getTickets();

        const search =
            historySearch.value
                .trim()
                .toLowerCase();


        const filtered =
            tickets.filter(function (ticket) {

                if (!search) {
                    return true;
                }

                return [

                    ticket.ticketId,

                    ticket.clientName,

                    ticket.mobileNumber,

                    ticket.category,

                    ticket.status

                ].some(function (value) {

                    return String(
                        value || ""
                    )
                        .toLowerCase()
                        .includes(search);

                });

            });


        historyBody.innerHTML = "";


        if (!filtered.length) {

            historyBody.innerHTML = `
                <tr>
                    <td
                        colspan="8"
                        class="no-data"
                    >
                        No tickets found
                    </td>
                </tr>
            `;

            return;
        }


        filtered
            .slice()
            .reverse()
            .forEach(function (ticket) {

                const row =
                    document.createElement("tr");

                row.innerHTML = `

                    <td>
                        ${escapeHtml(ticket.ticketId)}
                    </td>

                    <td>
                        ${escapeHtml(ticket.date)}
                    </td>

                    <td>
                        ${escapeHtml(ticket.clientName)}
                    </td>

                    <td>
                        ${escapeHtml(ticket.mobileNumber)}
                    </td>

                    <td>
                        ${escapeHtml(ticket.category)}
                    </td>

                    <td>
                        ${escapeHtml(ticket.priority)}
                    </td>

                    <td>
    ${displayStatus(ticket.status)}
</td>

<td>
    ${escapeHtml(ticket.technician || "")}
</td>

<td>
    ${
        ticket.status === "Complete"
            ? ""
            : escapeHtml(ticket.reason || "")
    }
</td> <td>
    <button
        type="button"
        class="convert-service-btn"
        onclick="convertTicketToService('${ticket.ticketId}')">
        Convert to Service
    </button>
</td>

                `;

                historyBody.appendChild(row);
            });
    }
/* =====================================================
   CONVERT TICKET TO SERVICE
   ===================================================== */

window.convertTicketToService = function (id) {

    const tickets = getTickets();

    const ticket = tickets.find(function (item) {
        return item.ticketId === id;
    });

    if (!ticket) {
        alert("Ticket not found.");
        return;
    }

    const category = String(ticket.category || "").toLowerCase();

    let servicePage = "";

    if (category.includes("printer")) {
        servicePage = "../service-modules/printer-service.html";
    }
    else if (category.includes("cartridge")) {
        servicePage = "../service-modules/cartridge-refilling.html";
    }
    else if (
    category.includes("computer") ||
    category.includes("desktop") ||
    category.includes("laptop") ||
    category.includes("hardware")
) {
    servicePage = "../service-modules/desktop-laptop-service/desktop-laptop-service.html";

    }
    else if (
        category.includes("network") ||
        category.includes("wifi")
    ) {
        servicePage = "../service-modules/networking-wifi-service.html";
    }
    else if (
        category.includes("camera") ||
        category.includes("solar")
    ) {
        servicePage = "../service-modules/camera-solar-service.html";
    }
    else if (category.includes("amc")) {
        servicePage = "../service-modules/amc-service.html";
    }
    else if (category.includes("warranty")) {
        servicePage = "../service-modules/warranty-service.html";
    }

    if (!servicePage) {
        alert(
            "No Service Module found for category:\n" +
            ticket.category
        );
        return;
    }

    const params = new URLSearchParams();

    params.set("ticketId", ticket.ticketId || "");
    params.set("clientName", ticket.clientName || "");
    params.set("mobileNumber", ticket.mobileNumber || "");
    params.set("address", ticket.address || "");
    params.set("category", ticket.category || "");
    params.set("complaint", ticket.complaint || "");
    params.set("printerModel", ticket.printerModel || "");
    params.set("technician", ticket.technician || "");
    params.set("priority", ticket.priority || "");
    params.set("reason", ticket.reason || "");
    params.set("remarks", ticket.remarks || "");
    params.set("ticketDate", ticket.date || "");
    params.set("barcode", ticket.barcode || "");
    params.set("serialNumber", ticket.serialNumber || "");
    params.set("make", ticket.make || "");
    params.set("modelName", ticket.modelName || "");

    window.location.href =
        servicePage + "?" + params.toString();
};

/* =====================================================
   DYNAMIC FIRM NAME
   ===================================================== */

const ticketFirmName =
    document.getElementById("ticketFirmName");

if (ticketFirmName) {

    const selectedFirm =
        localStorage.getItem(
            "SUVI_INFOTECH_SELECTED_FIRM"
        );

    if (selectedFirm) {
        ticketFirmName.textContent =
            selectedFirm.trim();
    }
}
    /* =====================================================
       NAVIGATION
       ===================================================== */

    window.goBack = function () {

        if (window.history.length > 1) {
            window.history.back();
        }
    };


    window.goDashboard = function () {

        const dashboardPath =
            "../../dashboard.html";

        if (typeof window.openPage === "function") {

            window.openPage(
                dashboardPath
            );

            return;
        }

        if (typeof window.loadPage === "function") {

            window.loadPage(
                dashboardPath
            );

            return;
        }

        window.location.href =
            dashboardPath;
    };


    /* =====================================================
       EVENTS
       ===================================================== */

    if (form) {
        form.addEventListener(
            "submit",
            saveTicket
        );
    }


    if (clientSearch) {

        clientSearch.addEventListener(
            "input",
            showClientSuggestions
        );
    }


    if (status) {

        status.addEventListener(
            "change",
            updateReasonVisibility
        );
    }
    if (category && printerModelGroup) {

    category.addEventListener(
        "change",
        function () {

            if (category.value === "Printer") {

                printerModelGroup.style.display = "";

            } else {

                printerModelGroup.style.display = "none";
                printerModel.value = "";

            }

        }
    );

}


    if (historySearch) {

        historySearch.addEventListener(
            "input",
            renderHistory
        );
    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                clientSuggestions &&
                !clientSearch.contains(event.target) &&
                !clientSuggestions.contains(event.target)
            ) {

                clientSuggestions.innerHTML = "";
            }
        }
    );


    /* =====================================================
       INIT
       ===================================================== */

    prepareNewTicket();

    renderHistory();

})();