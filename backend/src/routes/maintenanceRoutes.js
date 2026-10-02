const express = require("express");

const {
    createMaintenance,
    getAllMaintenance,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance
} = require("../controllers/maintenanceController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    createMaintenance
);

router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    getAllMaintenance
);

router.get(
    "/:maintenanceId",
    authenticate,
    authorizeRoles("admin"),
    getMaintenanceById
);

router.put(
    "/:maintenanceId",
    authenticate,
    authorizeRoles("admin"),
    updateMaintenance
);

router.delete(
    "/:maintenanceId",
    authenticate,
    authorizeRoles("admin"),
    deleteMaintenance
);

module.exports = router;