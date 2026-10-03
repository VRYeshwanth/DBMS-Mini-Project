const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getDashboard
} = require("../controllers/dashboardController");

router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    getDashboard
);

module.exports = router;