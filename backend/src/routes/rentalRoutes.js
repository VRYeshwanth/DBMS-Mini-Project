const express = require("express");

const {
    createRental,
    getAllRentals,
    getRentalById
} = require("../controllers/rentalController");

const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    createRental
);

router.get(
    "/",
    authenticate,
    getAllRentals
);

router.get(
    "/:rentalId",
    authenticate,
    getRentalById
);

module.exports = router;