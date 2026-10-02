const express = require("express");

const {
    createPayment,
    getAllPayments,
    getPaymentById
} = require("../controllers/paymentController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    createPayment
);

router.get(
    "/",
    authenticate,
    getAllPayments
);

router.get(
    "/:paymentId",
    authenticate,
    getPaymentById
);

module.exports = router;