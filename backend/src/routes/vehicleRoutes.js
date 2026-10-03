const express = require("express");
const router = express.Router();

const {
    getAllVehicles,
    getVehicleByPlateNumber,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getAvailableVehicles
} = require("../controllers/vehicleController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");


// Public
router.get("/", getAllVehicles);
router.get("/available", getAvailableVehicles);
router.get("/:plateNumber", getVehicleByPlateNumber);


// Admin only
router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    createVehicle
);

router.put(
    "/:plateNumber",
    authenticate,
    authorizeRoles("admin"),
    updateVehicle
);

router.delete(
    "/:plateNumber",
    authenticate,
    authorizeRoles("admin"),
    deleteVehicle
);


module.exports = router;