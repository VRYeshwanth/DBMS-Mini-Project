const pool = require("../config/db");

const createBranch = async (req, res) => {
    const {
        name,
        address
    } = req.body;

    if (!name || !address) {
        return res.status(400).json({
            success: false,
            message: "Branch name and address are required"
        });
    }

    try {
        /*
         * Generate custom branch ID.
         */
        const [lastBranch] = await pool.query(
            `SELECT branch_id
             FROM BRANCH
             WHERE branch_id LIKE 'BR%'
             ORDER BY branch_id DESC
             LIMIT 1`
        );

        let branchId;

        if (lastBranch.length === 0) {
            branchId = "BR001";
        } else {
            const lastId = lastBranch[0].branch_id;
            const numberPart = lastId.replace("BR", "");
            const lastNumber = Number(numberPart);

            if (Number.isNaN(lastNumber)) {
                throw new Error(
                    `Invalid branch ID format: ${lastId}`
                );
            }

            branchId = `BR${String(lastNumber + 1).padStart(3, "0")}`;
        }

        await pool.query(
            `INSERT INTO BRANCH
            (
                branch_id,
                name,
                address
            )
            VALUES (?, ?, ?)`,
            [
                branchId,
                name,
                address
            ]
        );

        res.status(201).json({
            success: true,
            message: "Branch created successfully",
            data: {
                branch_id: branchId
            }
        });

    } catch (error) {
        console.error("Create branch error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create branch"
        });
    }
};

const getAllBranches = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                branch_id,
                name,
                address
             FROM BRANCH
             ORDER BY branch_id`
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Get branches error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch branches"
        });
    }
};

const getBranchById = async (req, res) => {
    const { branchId } = req.params;

    try {
        const [branches] = await pool.query(
            `SELECT
                branch_id,
                name,
                address
             FROM BRANCH
             WHERE branch_id = ?`,
            [branchId]
        );

        if (branches.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Branch not found"
            });
        }

        const [vehicles] = await pool.query(
            `SELECT
                plate_number,
                make,
                type,
                model,
                year,
                color
             FROM VEHICLE
             WHERE branch_id = ?
             ORDER BY plate_number`,
            [branchId]
        );

        res.status(200).json({
            success: true,
            data: {
                ...branches[0],
                vehicles
            }
        });

    } catch (error) {
        console.error("Get branch error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch branch"
        });
    }
};

const updateBranch = async (req, res) => {
    const { branchId } = req.params;

    const {
        name,
        address
    } = req.body;

    if (!name || !address) {
        return res.status(400).json({
            success: false,
            message: "Branch name and address are required"
        });
    }

    try {
        const [branches] = await pool.query(
            `SELECT branch_id
             FROM BRANCH
             WHERE branch_id = ?`,
            [branchId]
        );

        if (branches.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Branch not found"
            });
        }

        await pool.query(
            `UPDATE BRANCH
             SET name = ?,
                 address = ?
             WHERE branch_id = ?`,
            [
                name,
                address,
                branchId
            ]
        );

        res.status(200).json({
            success: true,
            message: "Branch updated successfully"
        });

    } catch (error) {
        console.error("Update branch error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update branch"
        });
    }
};

module.exports = {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch
};