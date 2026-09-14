/* =========================================================
   SUVI INFOTECH - LOGIN JAVASCRIPT
   Passcode Login Version
   ========================================================= */


/* =========================================================
   SUVI INFOTECH PASSCODE
   ========================================================= */

const SUVI_PASSCODE = "1234";


document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
       ===================================================== */

    const loginForm =
        document.getElementById("loginForm");

    const passcode =
        document.getElementById("passcode");

    const togglePasscode =
        document.getElementById("togglePasscode");

    const rememberMe =
        document.getElementById("rememberMe");

    const loginButton =
        document.getElementById("loginButton");

    const loginMessage =
        document.getElementById("loginMessage");

        /* =====================================================
   MOBILE OTP - AFTER 3 WRONG ATTEMPTS
   ===================================================== */

let wrongAttempts = 0;

function showMobileOTPOption() {

    if (document.getElementById("mobileOTPBox")) {
        return;
    }

    const otpBox = document.createElement("div");

    otpBox.id = "mobileOTPBox";

    otpBox.innerHTML = `
        <div style="
            margin-top:18px;
            padding:18px;
            border-radius:16px;
            background:#f7f9fc;
            border:1px solid #e4e8ef;
            text-align:center;
        ">

            <strong style="display:block;margin-bottom:8px;">
                Forgot Passcode?
            </strong>

            <p style="margin:0 0 14px;color:#666;font-size:14px;">
                Verify using your registered mobile number.
            </p>

            <button
                type="button"
                id="sendLoginOTP"
                style="
                    border:0;
                    padding:11px 18px;
                    border-radius:10px;
                    cursor:pointer;
                "
            >
                📱 Verify with Mobile OTP
            </button>

            <div id="loginOTPSection"
                 style="display:none;margin-top:15px;">

                <input
                    type="text"
                    id="loginOTP"
                    maxlength="6"
                    inputmode="numeric"
                    placeholder="Enter 6-digit OTP"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:12px;
                        border:1px solid #ddd;
                        border-radius:10px;
                        text-align:center;
                        letter-spacing:5px;
                        font-size:18px;
                    "
                >

                <button
                    type="button"
                    id="verifyLoginOTP"
                    style="
                        margin-top:10px;
                        border:0;
                        padding:11px 18px;
                        border-radius:10px;
                        cursor:pointer;
                    "
                >
                    VERIFY OTP
                </button>

                <div
                    id="otpMessage"
                    style="margin-top:10px;font-size:13px;">
                </div>

            </div>
        </div>
    `;

    loginForm.parentElement.appendChild(otpBox);

    document
        .getElementById("sendLoginOTP")
        .addEventListener("click", sendLoginOTP);

    document
        .getElementById("verifyLoginOTP")
        .addEventListener("click", verifyLoginOTP);
}


/* =====================================================
   GET REGISTERED MOBILE
   ===================================================== */

function getRegisteredMobile() {

    const firms = JSON.parse(
        localStorage.getItem("SUVI_INFOTECH_FIRMS") || "[]"
    );

    const selectedFirm =
        localStorage.getItem("SUVI_INFOTECH_SELECTED_FIRM");

    const firm = firms.find(
        f => f.firmName === selectedFirm
    );

    return firm ? String(firm.mobile || "").trim() : "";
}


/* =====================================================
   SEND LOGIN OTP
   ===================================================== */

function sendLoginOTP() {

    const mobile = getRegisteredMobile();

    const otpMessage =
        document.getElementById("otpMessage");

    if (!mobile) {

        otpMessage.textContent =
            "Registered mobile number not found.";

        return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {

        otpMessage.textContent =
            "Registered mobile number is invalid.";

        return;
    }

    /* TEMPORARY LOCAL OTP
       Real SMS API will be connected later.
    */

    const otp =
        Math.floor(100000 + Math.random() * 900000)
        .toString();

    sessionStorage.setItem(
        "SUVI_LOGIN_OTP",
        otp
    );

    sessionStorage.setItem(
        "SUVI_LOGIN_OTP_TIME",
        Date.now().toString()
    );

    document.getElementById(
        "loginOTPSection"
    ).style.display = "block";

    const maskedMobile =
        "******" + mobile.slice(-4);

    otpMessage.textContent =
        "OTP verification started for " + maskedMobile;

    /*
       TEMPORARY TEST ONLY:
       Remove this alert when real SMS is connected.
    */

    alert(
        "TEST OTP: " + otp +
        "\n\nReal SMS sending will be connected later."
    );
}


/* =====================================================
   VERIFY LOGIN OTP
   ===================================================== */

function verifyLoginOTP() {

    const enteredOTP =
        document.getElementById("loginOTP").value.trim();

    const savedOTP =
        sessionStorage.getItem("SUVI_LOGIN_OTP");

    const otpTime =
        Number(
            sessionStorage.getItem(
                "SUVI_LOGIN_OTP_TIME"
            ) || 0
        );

    const otpMessage =
        document.getElementById("otpMessage");

    /* OTP valid for 5 minutes */

    if (
        !savedOTP ||
        !otpTime ||
        Date.now() - otpTime > 5 * 60 * 1000
    ) {

        otpMessage.textContent =
            "OTP expired. Please request a new OTP.";

        return;
    }

    if (enteredOTP !== savedOTP) {

        otpMessage.textContent =
            "Invalid OTP.";

        return;
    }


    /* =================================================
       OTP LOGIN SUCCESS
       ================================================= */

    localStorage.setItem(
        "suviLoggedUser",
        "SUVI INFOTECH"
    );

    SuviCompany.setCompanyId("SUVI001");

    localStorage.setItem(
        "suviLoginTime",
        new Date().toISOString()
    );

    sessionStorage.removeItem(
        "SUVI_LOGIN_OTP"
    );

    sessionStorage.removeItem(
        "SUVI_LOGIN_OTP_TIME"
    );

    otpMessage.textContent =
        "Verification successful.";

    setTimeout(function () {

        window.location.href =
            "dashboard.html";

    }, 500);
}

    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (!loginForm || !passcode || !loginButton) {

        console.error(
            "Login page elements not found."
        );

        return;
    }


    /* =====================================================
       SHOW / HIDE PASSCODE
       ===================================================== */

    if (togglePasscode) {

        togglePasscode.addEventListener(
            "click",
            function () {

                if (passcode.type === "password") {

                    passcode.type = "text";

                    togglePasscode.textContent =
                        "Hide";

                    togglePasscode.setAttribute(
                        "aria-label",
                        "Hide passcode"
                    );

                } else {

                    passcode.type = "password";

                    togglePasscode.textContent =
                        "Show";

                    togglePasscode.setAttribute(
                        "aria-label",
                        "Show passcode"
                    );
                }

            }
        );
    }


    /* =====================================================
       LOAD REMEMBER ME
       ===================================================== */

    const rememberedLogin =
        localStorage.getItem(
            "suviRememberMe"
        );

    if (rememberedLogin === "true") {

        rememberMe.checked = true;
    }


    /* =====================================================
       CLEAR MESSAGE
       ===================================================== */

    function clearMessage() {

        if (loginMessage) {

            loginMessage.textContent = "";

            loginMessage.classList.remove(
                "error",
                "success"
            );
        }
    }


    /* =====================================================
       SHOW ERROR
       ===================================================== */

    function showError(message) {

        if (loginMessage) {

            loginMessage.textContent =
                message;

            loginMessage.classList.remove(
                "success"
            );

            loginMessage.classList.add(
                "error"
            );
        }
    }


    /* =====================================================
       SHOW SUCCESS
       ===================================================== */

    function showSuccess(message) {

        if (loginMessage) {

            loginMessage.textContent =
                message;

            loginMessage.classList.remove(
                "error"
            );

            loginMessage.classList.add(
                "success"
            );
        }
    }


    /* =====================================================
       LOGIN
       ===================================================== */

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            clearMessage();


            /* =================================================
               GET PASSCODE
               ================================================= */

            const enteredPasscode =
                passcode.value.trim();


            /* =================================================
               VALIDATION
               ================================================= */

            if (enteredPasscode === "") {

                showError(
                    "Please enter your Passcode."
                );

                passcode.focus();

                return;
            }


            /* =================================================
               LOGIN BUTTON
               ================================================= */

            loginButton.disabled = true;


            const buttonText =
                loginButton.querySelector(
                    "span"
                );

            if (buttonText) {

                buttonText.textContent =
                    "LOGGING IN...";
            }


            /* =================================================
               PASSCODE CHECK
               ================================================= */

            if (
                enteredPasscode ===
                SUVI_PASSCODE
            ) {

                /* =============================================
                   REMEMBER LOGIN
                   ============================================= */

                if (rememberMe.checked) {

                    localStorage.setItem(
                        "suviRememberMe",
                        "true"
                    );

                } else {

                    localStorage.removeItem(
                        "suviRememberMe"
                    );
                }


                /* =============================================
                   LOGIN SESSION
                   ============================================= */

                localStorage.setItem(
                    "suviLoggedUser",
                    "SUVI INFOTECH"
                );
                /* =============================================
   COMPANY / TENANT CONTEXT
   ============================================= */

SuviCompany.setCompanyId("SUVI001");

                localStorage.setItem(
                    "suviLoginTime",
                    new Date().toISOString()
                );


                /* =============================================
                   SUCCESS
                   ============================================= */

                showSuccess(
                    "Login successful."
                );


                /* =============================================
                   OPEN DASHBOARD
                   ============================================= */

                setTimeout(
                    function () {

                        window.location.href =
                            "dashboard.html";

                    },
                    300
                );


            } else {

                /* =============================================
                   WRONG PASSCODE
                   ============================================= */

                showError(
                    "Invalid Passcode."
                );
                wrongAttempts++;

if (wrongAttempts >= 3) {

    showError(
        "3 failed attempts. You can verify with Mobile OTP."
    );

    showMobileOTPOption();
}

                passcode.value = "";

                passcode.focus();


                loginButton.disabled =
                    false;

                if (buttonText) {

                    buttonText.textContent =
                        "LOGIN";
                }
            }

        }
    );

});