const pool = require("../config/db");

const createMaintenance = async (req, res) => {
    const {
        plate_number,
        maintenance_status,
        maintenance_amt,
        maintenance_type
    } = req.body;

    if (
        !plate_number ||
        !maintenance_status ||
        maintenance_amt === undefined ||
        !maintenance_type
    ) {
        return res.status(400).json({
            success: false,
            message: "All maintenance fields are required"
        });
    }

    const allowedStatuses = ["Active", "Completed"];

    if (!allowedStatuses.includes(maintenance_status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid maintenance status"
        });
    }

    if (Number(maintenance_amt) < 0) {
        return res.status(400).json({
            success: false,
            message: "Maintenance amount cannot be negative"
        });
    }

    if (maintenance_type.length > 50) {
        return res.status(400).json({
            success: false,
            message: "Maintenance type cannot exceed 50 characters"
        });
    }

    try {
        /*
         * Verify that the vehicle exists.
         */
        const [vehicles] = await pool.query(
            `SELECT plate_number
             FROM VEHICLE
             WHERE plate_number = ?`,
            [plate_number]
        );

        if (vehicles.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        const [activeRentals] = await pool.query(
            `SELECT rental_id
            FROM RENTAL
            WHERE plate_number = ?
            AND status = 'Active'
            LIMIT 1`,
            [plate_number]
        );

        if (activeRentals.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Vehicle is currently rented and cannot be sent for maintenance"
            });
        }

        /*
         * Generate custom maintenance ID.
         */
        const [lastMaintenance] = await pool.query(
            `SELECT maintenance_id
             FROM MAINTENANCE
             WHERE maintenance_id LIKE 'MNT%'
             ORDER BY maintenance_id DESC
             LIMIT 1`
        );

        let maintenanceId;

        if (lastMaintenance.length === 0) {
            maintenanceId = "MNT001";
        } else {
            const lastId = lastMaintenance[0].maintenance_id;
            const numberPart = lastId.replace("MNT", "");
            const lastNumber = Number(numberPart);

            if (Number.isNaN(lastNumber)) {
                throw new Error(
                    `Invalid maintenance ID format: ${lastId}`
                );
            }

            maintenanceId = `MNT${String(lastNumber + 1).padStart(3, "0")}`;
        }

        /*
         * Insert maintenance record.
         */
        await pool.query(
            `INSERT INTO MAINTENANCE
            (
                maintenance_id,
                plate_number,
                maintenance_date,
                maintenance_status,
                maintenance_amt,
                maintenance_type
            )
            VALUES (?, ?, NOW(), ?, ?, ?)`,
            [
                maintenanceId,
                plate_number,
                maintenance_status,
                maintenance_amt,
                maintenance_type
            ]
        );

        res.status(201).json({
            success: true,
            message: "Maintenance record created successfully",
            data: {
                maintenance_id: maintenanceId
            }
        });

    } catch (error) {
        console.error("Create maintenance error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create maintenance record"
        });
    }
};

const getAllMaintenance = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                m.maintenance_id,
                m.plate_number,
                v.make,
                v.model,
                v.type,
                v.year,
                v.color,
                m.maintenance_date,
                m.maintenance_status,
                m.maintenance_amt,
                m.maintenance_type
             FROM MAINTENANCE m
             JOIN VEHICLE v
                ON m.plate_number = v.plate_number
             ORDER BY m.maintenance_date DESC`
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Get maintenance records error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance records"
        });
    }
};

const getMaintenanceById = async (req, res) => {
    const { maintenanceId } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT
                m.maintenance_id,
                m.plate_number,
                v.make,
                v.model,
                v.type,
                v.year,
                v.color,
                m.maintenance_date,
                m.maintenance_status,
                m.maintenance_amt,
                m.maintenance_type
             FROM MAINTENANCE m
             JOIN VEHICLE v
                ON m.plate_number = v.plate_number
             WHERE m.maintenance_id = ?`,
            [maintenanceId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error(
            "Get maintenance record error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch maintenance record"
        });
    }
};

const updateMaintenance = async (req, res) => {
    const { maintenanceId } = req.params;

    const {
        maintenance_status,
        maintenance_amt,
        maintenance_type
    } = req.body;

    if (
        !maintenance_status ||
        maintenance_amt === undefined ||
        !maintenance_type
    ) {
        return res.status(400).json({
            success: false,
            message: "All maintenance fields are required"
        });
    }

    const allowedStatuses = ["Active", "Completed"];

    if (!allowedStatuses.includes(maintenance_status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid maintenance status"
        });
    }

    if (Number(maintenance_amt) < 0) {
        return res.status(400).json({
            success: false,
            message: "Maintenance amount cannot be negative"
        });
    }

    if (maintenance_type.length > 50) {
        return res.status(400).json({
            success: false,
            message: "Maintenance type cannot exceed 50 characters"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        /*
         * Find the maintenance record and its vehicle.
         */
        const [maintenance] = await connection.query(
            `SELECT
                maintenance_id,
                plate_number
             FROM MAINTENANCE
             WHERE maintenance_id = ?`,
            [maintenanceId]
        );

        if (maintenance.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        const plateNumber = maintenance[0].plate_number;


        /*
         * If changing maintenance to Active,
         * make sure the vehicle doesn't have
         * an Active rental.
         */
        if (maintenance_status === "Active") {
            const [activeRentals] = await connection.query(
                `SELECT rental_id
                 FROM RENTAL
                 WHERE plate_number = ?
                   AND status = 'Active'
                 LIMIT 1`,
                [plateNumber]
            );

            if (activeRentals.length > 0) {
                await connection.rollback();

                return res.status(409).json({
                    success: false,
                    message: "Vehicle is currently rented and cannot have active maintenance"
                });
            }
        }


        /*
         * Update the maintenance record.
         */
        await connection.query(
            `UPDATE MAINTENANCE
             SET maintenance_status = ?,
                 maintenance_amt = ?,
                 maintenance_type = ?
             WHERE maintenance_id = ?`,
            [
                maintenance_status,
                maintenance_amt,
                maintenance_type,
                maintenanceId
            ]
        );

        await connection.commit();

        res.status(200).json({
            success: true,
            message: "Maintenance record updated successfully"
        });

    } catch (error) {
        await connection.rollback();

        console.error(
            "Update maintenance error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to update maintenance record"
        });

    } finally {
        connection.release();
    }
};

const deleteMaintenance = async (req, res) => {
    const { maintenanceId } = req.params;

    try {
        const [maintenance] = await pool.query(
            `SELECT maintenance_id
             FROM MAINTENANCE
             WHERE maintenance_id = ?`,
            [maintenanceId]
        );

        if (maintenance.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Maintenance record not found"
            });
        }

        await pool.query(
            `DELETE FROM MAINTENANCE
             WHERE maintenance_id = ?`,
            [maintenanceId]
        );

        res.status(200).json({
            success: true,
            message: "Maintenance record deleted successfully"
        });

    } catch (error) {
        console.error(
            "Delete maintenance error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete maintenance record"
        });
    }
};


module.exports = {
    createMaintenance,
    getAllMaintenance,
    getMaintenanceById,
    updateMaintenance,
    deleteMaintenance
};