require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Razorpay = require("razorpay");
const {
    initializeApp,
    cert
} = require("firebase-admin/app");

const {
    getFirestore
} = require("firebase-admin/firestore");

const serviceAccount =
    require("./firebase-service-account.json");

initializeApp({
    credential: cert(serviceAccount)
});

const firestore = getFirestore();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
let razorpay = null;

if (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
) {
    razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "SUVI INFOTECH Payment Server Running",
        razorpayConfigured: Boolean(
            process.env.RAZORPAY_KEY_ID &&
            process.env.RAZORPAY_KEY_SECRET
        )
    });
});
/* ================================
   RAZORPAY YEARLY ORDER
   Amount: ₹5,500
   Validity: 365 Days
================================ */

app.post("/api/create-order", async (req, res) => {

    try {

        const {
            customerName,
            companyId,
            firmName
        } = req.body;

        if (!customerName) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required."
            });
        }

if (!razorpay) {
    return res.status(503).json({
        success: false,
        message: "Razorpay is not configured on server."
    });
           }
        const order = await razorpay.orders.create({
          
            amount: 550000,
            currency: "INR",
            receipt: `SUVI-${Date.now()}`,
            notes: {
                customerName: customerName,
                companyId: companyId || "",
                firmName: firmName || "",
                plan: "yearly",
                validityDays: "365"
            }
        });

        return res.json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {

        console.error("Razorpay Order Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order."
        });
    }
});
/* ================================
   RAZORPAY PAYMENT VERIFICATION
================================ */
/* ================================
   RAZORPAY PAYMENT VERIFICATION
   + AUTO LICENSE GENERATION
   + FIREBASE ACTIVATION
================================ */

app.post("/api/verify-payment", async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            deviceId
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification data is incomplete."
            });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Razorpay Key Secret is not configured."
            });
        }

        const crypto = require("crypto");

        /* ==========================================
           1. VERIFY RAZORPAY SIGNATURE
        ========================================== */

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");

        if (generatedSignature !== razorpay_signature) {

            console.error(
                "Razorpay signature verification failed."
            );

            return res.status(400).json({
                success: false,
                message: "Payment verification failed."
            });
        }

        console.log(
            "Razorpay payment verified:",
            razorpay_payment_id
        );

        /* ==========================================
           2. CHECK DUPLICATE PAYMENT
        ========================================== */

        const existingPayment =
            await firestore
                .collection("licenses")
                .where(
                    "razorpayOrderId",
                    "==",
                    razorpay_order_id
                )
                .limit(1)
                .get();

        if (!existingPayment.empty) {

            const existingDoc =
                existingPayment.docs[0];

            const existingData =
                existingDoc.data();

            return res.json({
                success: true,
                message: "Payment already processed.",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                licenseKey: existingDoc.id,
                licenseData: existingData
            });
        }

        /* ==========================================
           3. GET RAZORPAY ORDER DETAILS
        ========================================== */

        if (!razorpay) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured."
            });
        }

        const order =
            await razorpay.orders.fetch(
                razorpay_order_id
            );

        const notes = order.notes || {};

        const customerName =
            notes.customerName || "Customer";

        const companyId =
            notes.companyId || "";

        const firmName =
            notes.firmName || "";

        /* ==========================================
           4. GENERATE UNIQUE LICENSE KEY
        ========================================== */

        function generateLicenseKey() {

            const chars =
                "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

            function block() {

                let result = "";

                for (let i = 0; i < 4; i++) {

                    result +=
                        chars[
                            crypto.randomInt(
                                0,
                                chars.length
                            )
                        ];
                }

                return result;
            }

            return (
                "SUVI-" +
                block() +
                "-" +
                block() +
                "-" +
                block()
            );
        }

        let licenseKey;
        let licenseRef;

        do {

            licenseKey =
                generateLicenseKey();

            licenseRef =
                firestore
                    .collection("licenses")
                    .doc(licenseKey);

            const check =
                await licenseRef.get();

            if (!check.exists) {
                break;
            }

        } while (true);

        /* ==========================================
           5. LICENSE DATES
        ========================================== */

        const activationDate =
            new Date();

        const expiryDate =
            new Date(activationDate);

        expiryDate.setDate(
            expiryDate.getDate() + 365
        );

        const purchaseDate =
            new Date();

        /* ==========================================
           6. CREATE LICENSE DATA
        ========================================== */

        const licenseData = {

            softwareName:
                "SUVI INFOTECH Service Pro",

            licenseKey:
                licenseKey,

            licenseType:
                "yearly",

            plan:
                "Yearly Version",

            planDays:
                365,

            customerName:
                customerName,

            companyId:
                companyId,

            firmName:
                firmName,

            purchaseDate:
                purchaseDate,

            activationDate:
                activationDate,

            expiryDate:
                expiryDate,

            status:
                "active",

            licenseStatus:
                "active",

            numberOfDevices:
                1,

            deviceId:
                deviceId || "",

            vendorName:
                "SUVI INFOTECH",

            supportContact:
                "SUVI INFOTECH",

            paymentStatus:
                "paid",

            paymentMethod:
                "Razorpay",

            razorpayOrderId:
                razorpay_order_id,

            razorpayPaymentId:
                razorpay_payment_id,

            amount:
                5500,

            currency:
                "INR",

            validityDays:
                365,

            createdAt:
                new Date(),

            updatedAt:
                new Date()
        };

        /* ==========================================
           7. SAVE LICENSE TO FIRESTORE
        ========================================== */

        await licenseRef.set(
            licenseData
        );

        console.log(
            "YEARLY LICENSE CREATED:",
            licenseKey
        );

        /* ==========================================
           8. RETURN LICENSE TO FRONTEND
        ========================================== */

        return res.json({

            success:
                true,

            message:
                "Payment verified and yearly license activated successfully.",

            orderId:
                razorpay_order_id,

            paymentId:
                razorpay_payment_id,

            licenseKey:
                licenseKey,

            licenseData: {

                ...licenseData,

                purchaseDate:
                    purchaseDate.toISOString(),

                activationDate:
                    activationDate.toISOString(),

                expiryDate:
                    expiryDate.toISOString(),

                createdAt:
                    licenseData.createdAt.toISOString(),

                updatedAt:
                    licenseData.updatedAt.toISOString()
            }
        });

    } catch (error) {

        console.error(
            "Payment Verification / License Error:",
            error
        );

        return res.status(500).json({

            success:
                false,

            message:
                "Payment verified, but license activation failed."
        });
    }
});
app.listen(PORT, () => {
    console.log("-----------------------------------");
    console.log("SUVI INFOTECH Payment Server");
    console.log(`Server running on port ${PORT}`);
    console.log("-----------------------------------");
});