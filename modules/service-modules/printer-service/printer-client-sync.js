/* =========================================================
   PRINTER SERVICE - CLIENT SYNC
   Client Master + Call Register
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const clientCode =
        document.getElementById("clientCode");

    const clientMobile =
        document.getElementById("clientMobile");

    const clientName =
    document.getElementById("clientName");

    const departmentName =
        document.getElementById("departmentName");

    const newClientModal =
        document.getElementById("newClientModal");


    /* =====================================================
       OPEN CLIENT MASTER - NEW CLIENT
       ===================================================== */

   if (clientCode && newClientModal) {

    clientCode.addEventListener(
        "change",
        function () {

            if (
                this.value ===
                "__NEW_CLIENT__"
            ) {

                newClientCode.value =
    generateNewClientCode();
                newClientModal.style.display =
                    "flex";

                newClientModal.setAttribute(
                    "aria-hidden",
                    "false"
                );

            }

        }
    );

}

    /* =====================================================
       LOAD CLIENT MASTER + CALL REGISTER
       ===================================================== */
function generateNewClientCode() {

    let clients = [];

    try {

        clients =
            JSON.parse(
                localStorage.getItem(
                    "suviInfotechClients"
                )
            ) || [];

    } catch (error) {

        clients = [];

    }


    let maxNumber = 0;


    clients.forEach(function (client) {

        const id =
            String(
                client.clientId ||
                ""
            ).toUpperCase();


        const match =
            id.match(/^CLI(\d+)$/);


        if (match) {

            const number =
                parseInt(
                    match[1],
                    10
                );


            if (
                number >
                maxNumber
            ) {

                maxNumber =
                    number;

            }

        }

    });


    const nextNumber =
        maxNumber + 1;


    return (
        "CLI" +
        String(nextNumber)
            .padStart(3, "0")
    );

}
    async function loadPrinterClients() {

        if (!clientCode) {
            return;
        }

        const selectedValue =
            clientCode.value;


        /* Keep New Client option */

        clientCode.innerHTML = `
            <option value="">
                Select Client Code
            </option>

            <option value="__NEW_CLIENT__">
                ＋ New Client
            </option>
        `;


        const clients = [];


        /* =================================================
           CLIENT MASTER
           ================================================= */

        try {

            const localClients =
                JSON.parse(
                    localStorage.getItem(
                        "suviInfotechClients"
                    )
                ) || [];


            if (Array.isArray(localClients)) {

                localClients.forEach(
                    function (client) {

                        if (
                            client.clientId &&
                            !clients.some(
                                function (item) {
                                    return (
                                        item.clientId ===
                                        client.clientId
                                    );
                                }
                            )
                        ) {

                            clients.push({
                                ...client,
                                source:
                                    "Client Master"
                            });

                        }

                    }
                );

            }

        } catch (error) {

            console.error(
                "Client Master load error:",
                error
            );

        }


        /* =================================================
           FIREBASE CLIENT MASTER
           ================================================= */

        try {

            if (
                window.SuviFirebaseSync &&
                typeof
                window.SuviFirebaseSync.getAll ===
                "function"
            ) {

                const firebaseClients =
                    await window.SuviFirebaseSync.getAll(
                        "clients"
                    );


                if (
                    Array.isArray(firebaseClients)
                ) {

                    firebaseClients.forEach(
                        function (client) {

                            const id =
                                client.clientId ||
                                client.id;


                            if (
                                id &&
                                !clients.some(
                                    function (item) {
                                        return (
                                            item.clientId ===
                                            id
                                        );
                                    }
                                )
                            ) {

                                clients.push({
                                    ...client,
                                    clientId: id,
                                    source:
                                        "Client Master"
                                });

                            }

                        }
                    );

                }

            }

        } catch (error) {

            console.error(
                "Firebase Client load error:",
                error
            );

        }


        /* =================================================
           CALL REGISTER
           ================================================= */

        try {

            if (
                window.SuviFirebaseSync &&
                typeof
                window.SuviFirebaseSync.getAll ===
                "function"
            ) {

                const calls =
                    await window.SuviFirebaseSync.getAll(
                        "callRegister"
                    );


                if (Array.isArray(calls)) {

                    calls.forEach(
                        function (call) {

                            const mobile =
                                call.mobileNumber ||
                                call.mobile ||
                                call.phone ||
                                "";


                            /*
                             * Only valid 10 digit mobile numbers
                             */

                            if (
                                !/^\d{10}$/.test(
                                    String(mobile)
                                )
                            ) {
                                return;
                            }


                            /*
                             * Call Register may already
                             * belong to Client Master.
                             */

                            const clientId =
                                call.clientId ||
                                call.clientCode ||
                                "";


                            /*
                             * Avoid duplicate client
                             * if Client Master already
                             * contains same client.
                             */

                            const duplicate =
                                clients.some(
                                    function (item) {

                                        return (
                                            (
                                                clientId &&
                                                item.clientId ===
                                                clientId
                                            ) ||
                                            (
                                                item.mobileNumber &&
                                                String(
                                                    item.mobileNumber
                                                ) ===
                                                String(mobile)
                                            )
                                        );

                                    }
                                );


                            if (!duplicate) {

                                clients.push({

                                    clientId:
                                        clientId ||
                                        (
                                            "CALL-" +
                                            (
                                                call.callId ||
                                                Date.now()
                                            )
                                        ),

                                    contactPerson:
                                        call.callerName ||
                                        call.contactPerson ||
                                        "",

                                    mobileNumber:
                                        mobile,

                                    departmentName:
                                        call.departmentName ||
                                        call.department ||
                                        "",

                                    companyName:
                                        call.companyName ||
                                        "",

                                    address:
                                        call.address ||
                                        "",

                                    source:
                                        "Call Register"

                                });

                            }

                        }
                    );

                }

            }

        } catch (error) {

            console.error(
                "Call Register load error:",
                error
            );

        }


        /* =================================================
           ADD CLIENTS TO DROPDOWN
           ================================================= */

        clients.forEach(
            function (client) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    client.clientId;


                option.textContent =
                    client.clientId +
                    (
                        client.source ===
                        "Call Register"
                            ? " - Call Register"
                            : ""
                    );


                option.dataset.mobile =
                    client.mobileNumber ||
                    client.mobile ||
                    "";


                option.dataset.department =
                    client.departmentName ||
                    client.department ||
                    "";
                
                option.dataset.name =
    client.companyName ||
    client.contactPerson ||
    client.clientName ||
    "";

                clientCode.appendChild(
                    option
                );

            }
        );


        /*
         * Restore previous selection
         */

        if (selectedValue) {

            const exists =
                Array.from(
                    clientCode.options
                ).some(
                    function (option) {
                        return (
                            option.value ===
                            selectedValue
                        );
                    }
                );


            if (exists) {

                clientCode.value =
                    selectedValue;

                clientCode.dispatchEvent(
                    new Event("change")
                );

            }

        }

    }


    /* =====================================================
       CLIENT SELECT → MOBILE + DEPARTMENT
       ===================================================== */

    if (clientCode) {

        clientCode.addEventListener(
            "change",
            function () {

                const option =
                    this.options[
                        this.selectedIndex
                    ];


                if (
                    !option ||
                    this.value ===
                    "__NEW_CLIENT__"
                ) {

                    return;

                }

                if (clientName) {

    clientName.value =
        option.dataset.name ||
        "";

}

                if (clientMobile) {

                    clientMobile.value =
                        option.dataset.mobile ||
                        "";

                }


                if (departmentName) {

                    departmentName.value =
                        option.dataset.department ||
                        "";

                }

            }
        );

    }


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    loadPrinterClients();

});
/* =====================================================
   NEW CLIENT MODAL - CANCEL
   ===================================================== */

function closeNewClientModal() {

    if (!newClientModal) {
        return;
    }

    newClientModal.classList.remove("show");

    newClientModal.style.display =
        "none";

    newClientModal.setAttribute(
        "aria-hidden",
        "true"
    );

    if (clientCode) {
        clientCode.value = "";
    }

    if (clientMobile) {
        clientMobile.value = "";
    }

    if (departmentName) {
        departmentName.value = "";
    }

}


/* =====================================================
   CANCEL BUTTON
   ===================================================== */

if (cancelNewClient) {

    cancelNewClient.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeNewClientModal();

        }
    );

}


/* =====================================================
   SAVE NEW CLIENT
   ===================================================== */

if (saveNewClient) {

    saveNewClient.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();


            const name =
                newClientName.value.trim();

            const mobile =
                newClientMobile.value.trim();

            const department =
                newClientDepartment.value.trim();


            /* NAME */

            if (!name) {

                alert(
                    "Please enter Contact Person."
                );

                newClientName.focus();

                return;

            }


            /* MOBILE */

            if (
                !/^[6-9]\d{9}$/.test(
                    mobile
                )
            ) {

                alert(
                    "Mobile Number must be exactly 10 digits."
                );

                newClientMobile.focus();

                return;

            }


            /* GET LOCAL CLIENTS */

            let clients = [];

            try {

                clients =
                    JSON.parse(
                        localStorage.getItem(
                            "suviInfotechClients"
                        )
                    ) || [];

            } catch (error) {

                clients = [];

            }


            /* DUPLICATE MOBILE CHECK */

            const duplicate =
                clients.find(
                    function (client) {

                        return (
                            String(
                                client.mobileNumber ||
                                ""
                            ).trim() === mobile
                        );

                    }
                );


            if (duplicate) {

                alert(
                    "This mobile number already exists: " +
                    duplicate.clientId
                );

                closeNewClientModal();

                await loadPrinterClients();

                clientCode.value =
                    duplicate.clientId;

                clientCode.dispatchEvent(
                    new Event("change")
                );

                return;

            }


            /* CLIENT DATA */

            const client = {

                date:
                    new Date()
                        .toISOString()
                        .split("T")[0],

                clientId:
                    newClientCode.value,

                contactPerson:
                    name,

                mobileNumber:
                    mobile,

                emailId:
                    "",

                gstNumber:
                    "",

                departmentName:
                    department,

                companyName:
                    "",

                city:
                    "",

                state:
                    "",

                pincode:
                    "",

                address:
                    "",

                notes:
                    "",

                serviceHistory:
                    [],

                createdAt:
                    new Date().toISOString(),

                updatedAt:
                    new Date().toISOString()

            };


            /* SAVE LOCAL */

            clients.push(client);

            localStorage.setItem(
                "suviInfotechClients",
                JSON.stringify(clients)
            );


            /* SAVE FIREBASE */

            try {

                if (
                    window.SuviFirebaseSync &&
                    typeof
                    window.SuviFirebaseSync.save ===
                    "function"
                ) {

                    await window.SuviFirebaseSync.save(
                        "clients",
                        client.clientId,
                        client
                    );

                }

            } catch (error) {

                console.error(
                    "Client Firebase save error:",
                    error
                );

            }


            /* CLOSE */

            closeNewClientModal();


            /* REFRESH DROPDOWN */

            await loadPrinterClients();


            /* SELECT NEW CLIENT */

            clientCode.value =
                client.clientId;

            clientCode.dispatchEvent(
                new Event("change")
            );


            alert(
                "New Client saved successfully.\n\n" +
                "Client Code: " +
                client.clientId
            );

        }
    );

}