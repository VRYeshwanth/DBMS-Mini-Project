const express = require("express");

const {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch
} = require("../controllers/branchController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorizeRoles("admin"),
    createBranch
);

router.get(
    "/",
    authenticate,
    authorizeRoles("admin"),
    getAllBranches
);

router.get(
    "/:branchId",
    authenticate,
    authorizeRoles("admin"),
    getBranchById
);

router.put(
    "/:branchId",
    authenticate,
    authorizeRoles("admin"),
    updateBranch
);

module.exports = router;