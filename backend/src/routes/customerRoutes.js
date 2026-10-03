const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getMyRentals,
    getAllCustomers,
    getCustomerById
} = require("../controllers/customerController");

router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    getAllCustomers
);

router.get(
    "/me/rentals",
    authenticate,
    authorizeRoles("customer"),
    getMyRentals
);

router.get(
    "/:customerId",
    authenticate,
    authorizeRoles("admin"),
    getCustomerById
);

module.exports = router;