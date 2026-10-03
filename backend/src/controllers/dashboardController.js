const pool = require("../config/db");

const getDashboard = async (req, res) => {
    try {
        // Total vehicles
        const [vehicleCount] = await pool.query(
            `SELECT COUNT(*) AS total_vehicles
             FROM VEHICLE`
        );

        // Total customers
        const [customerCount] = await pool.query(
            `SELECT COUNT(*) AS total_customers
             FROM CUSTOMER`
        );

        // Active rentals
        const [activeRentals] = await pool.query(
            `SELECT COUNT(*) AS active_rentals
             FROM RENTAL
             WHERE status = 'Active'`
        );

        // Active maintenance
        const [activeMaintenance] = await pool.query(
            `SELECT COUNT(*) AS active_maintenance
             FROM MAINTENANCE
             WHERE maintenance_status = 'Active'`
        );

        // Total revenue
        const [revenue] = await pool.query(
            `SELECT COALESCE(SUM(amount), 0) AS total_revenue
             FROM PAYMENT
             WHERE payment_status = 'Paid'`
        );

        // Available vehicles
        const [availableVehicles] = await pool.query(
            `SELECT COUNT(*) AS available_vehicles
             FROM VEHICLE v
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM RENTAL r
                 WHERE r.plate_number = v.plate_number
                   AND r.status = 'Active'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM MAINTENANCE m
                 WHERE m.plate_number = v.plate_number
                   AND m.maintenance_status = 'Active'
             )`
        );

        // Revenue by branch
        const [revenueByBranch] = await pool.query(
            `SELECT
                b.branch_id,
                b.name AS branch_name,
                COALESCE(SUM(p.amount), 0) AS revenue
             FROM BRANCH b
             LEFT JOIN VEHICLE v
                ON b.branch_id = v.branch_id
             LEFT JOIN RENTAL r
                ON v.plate_number = r.plate_number
             LEFT JOIN PAYMENT p
                ON r.rental_id = p.rental_id
               AND p.payment_status = 'Paid'
             GROUP BY b.branch_id, b.name
             ORDER BY revenue DESC`
        );

        // Rentals by vehicle
        const [rentalsByVehicle] = await pool.query(
            `SELECT
                v.plate_number,
                v.make,
                v.model,
                COUNT(r.rental_id) AS rental_count
             FROM VEHICLE v
             LEFT JOIN RENTAL r
                ON v.plate_number = r.plate_number
             GROUP BY
                v.plate_number,
                v.make,
                v.model
             ORDER BY rental_count DESC`
        );

        // Maintenance cost by vehicle
        const [maintenanceCostByVehicle] = await pool.query(
            `SELECT
                v.plate_number,
                v.make,
                v.model,
                COALESCE(SUM(m.maintenance_amt), 0) AS maintenance_cost
             FROM VEHICLE v
             LEFT JOIN MAINTENANCE m
                ON v.plate_number = m.plate_number
             GROUP BY
                v.plate_number,
                v.make,
                v.model
             ORDER BY maintenance_cost DESC`
        );

        res.status(200).json({
            success: true,
            data: {
                statistics: {
                    total_vehicles: vehicleCount[0].total_vehicles,
                    available_vehicles: availableVehicles[0].available_vehicles,
                    total_customers: customerCount[0].total_customers,
                    active_rentals: activeRentals[0].active_rentals,
                    active_maintenance: activeMaintenance[0].active_maintenance,
                    total_revenue: revenue[0].total_revenue
                },
                revenue_by_branch: revenueByBranch,
                rentals_by_vehicle: rentalsByVehicle,
                maintenance_cost_by_vehicle: maintenanceCostByVehicle
            }
        });

    } catch (error) {
        console.error("Get dashboard error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard data"
        });
    }
};

module.exports = {
    getDashboard
};