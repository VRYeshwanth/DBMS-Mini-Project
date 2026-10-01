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

module.exports = {
    getAllVehicles
};