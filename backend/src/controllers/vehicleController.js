const pool = require("../config/db");

const getAllVehicles = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM VEHICLE");

        res.status(200).json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error("Error fetching vehicles:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicles"
        });
    }
};

const getVehicleByPlateNumber = async (req, res) => {
    const { plateNumber } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT
                v.plate_number,
                v.make,
                v.type,
                v.model,
                v.year,
                v.color,
                v.branch_id,
                b.name AS branch_name,
                b.address AS branch_address
             FROM VEHICLE v
             JOIN BRANCH b
                ON v.branch_id = b.branch_id
             WHERE v.plate_number = ?`,
            [plateNumber]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get vehicle error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch vehicle"
        });
    }
};


const createVehicle = async (req, res) => {
    const {
        plate_number,
        make,
        type,
        model,
        year,
        color,
        branch_id
    } = req.body;

    if (
        !plate_number ||
        !make ||
        !type ||
        !model ||
        !year ||
        !color ||
        !branch_id
    ) {
        return res.status(400).json({
            success: false,
            message: "All vehicle fields are required"
        });
    }

    try {
        const [existingVehicle] = await pool.query(
            `SELECT plate_number
             FROM VEHICLE
             WHERE plate_number = ?`,
            [plate_number]
        );

        if (existingVehicle.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Vehicle with this plate number already exists"
            });
        }

        const [branch] = await pool.query(
            `SELECT branch_id
             FROM BRANCH
             WHERE branch_id = ?`,
            [branch_id]
        );

        if (branch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Branch not found"
            });
        }

        await pool.query(
            `INSERT INTO VEHICLE
            (plate_number, make, type, model, year, color, branch_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                plate_number,
                make,
                type,
                model,
                year,
                color,
                branch_id
            ]
        );

        res.status(201).json({
            success: true,
            message: "Vehicle created successfully"
        });

    } catch (error) {
        console.error("Create vehicle error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create vehicle"
        });
    }
};

const updateVehicle = async (req, res) => {
    const { plateNumber } = req.params;

    const {
        make,
        type,
        model,
        year,
        color,
        branch_id
    } = req.body;

    if (
        !make ||
        !type ||
        !model ||
        !year ||
        !color ||
        !branch_id
    ) {
        return res.status(400).json({
            success: false,
            message: "All vehicle fields are required"
        });
    }

    try {
        const [vehicle] = await pool.query(
            `SELECT plate_number
             FROM VEHICLE
             WHERE plate_number = ?`,
            [plateNumber]
        );

        if (vehicle.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        const [branch] = await pool.query(
            `SELECT branch_id
             FROM BRANCH
             WHERE branch_id = ?`,
            [branch_id]
        );

        if (branch.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Branch not found"
            });
        }

        await pool.query(
            `UPDATE VEHICLE
             SET make = ?,
                 type = ?,
                 model = ?,
                 year = ?,
                 color = ?,
                 branch_id = ?
             WHERE plate_number = ?`,
            [
                make,
                type,
                model,
                year,
                color,
                branch_id,
                plateNumber
            ]
        );

        res.status(200).json({
            success: true,
            message: "Vehicle updated successfully"
        });

    } catch (error) {
        console.error("Update vehicle error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update vehicle"
        });
    }
};

const deleteVehicle = async (req, res) => {
    const { plateNumber } = req.params;

    try {
        const [vehicle] = await pool.query(
            `SELECT plate_number
             FROM VEHICLE
             WHERE plate_number = ?`,
            [plateNumber]
        );

        if (vehicle.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        await pool.query(
            `DELETE FROM VEHICLE
             WHERE plate_number = ?`,
            [plateNumber]
        );

        res.status(200).json({
            success: true,
            message: "Vehicle deleted successfully"
        });

    } catch (error) {
        console.error("Delete vehicle error:", error.message);

        // Foreign-key violation
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message: "Vehicle cannot be deleted because it is referenced by existing records"
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to delete vehicle"
        });
    }
};


module.exports = {
    getAllVehicles,
    getVehicleByPlateNumber,
    createVehicle,
    updateVehicle,
    deleteVehicle
};