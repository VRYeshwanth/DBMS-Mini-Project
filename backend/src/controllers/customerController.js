const pool = require("../config/db");

const getMyRentals = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                r.rental_id,
                r.plate_number,
                v.make,
                v.model,
                v.type,
                v.year,
                v.color,
                r.pickup_loc,
                r.return_loc,
                r.start_date,
                r.end_date,
                r.status,
                p.payment_id,
                p.payment_date,
                p.payment_status,
                p.amount,
                p.payment_method
             FROM CUSTOMER c
             JOIN RENTAL r
                ON c.customer_id = r.customer_id
             JOIN VEHICLE v
                ON r.plate_number = v.plate_number
             LEFT JOIN PAYMENT p
                ON r.rental_id = p.rental_id
             WHERE c.user_id = ?
             ORDER BY r.start_date DESC`,
            [req.user.user_id]
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Get my rentals error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch rental history"
        });
    }
};

const getAllCustomers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                c.customer_id,
                c.name,
                c.address,
                c.phone,
                c.dob,
                u.user_id,
                u.email,
                u.created_at
             FROM CUSTOMER c
             JOIN USER_ACC u
                ON c.user_id = u.user_id
             ORDER BY c.customer_id`
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Get all customers error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};

const getCustomerById = async (req, res) => {
    const { customerId } = req.params;

    try {
        const [customers] = await pool.query(
            `SELECT
                c.customer_id,
                c.name,
                c.address,
                c.phone,
                c.dob,
                u.user_id,
                u.email,
                u.created_at
             FROM CUSTOMER c
             JOIN USER_ACC u
                ON c.user_id = u.user_id
             WHERE c.customer_id = ?`,
            [customerId]
        );

        if (customers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found"
            });
        }

        const [rentals] = await pool.query(
            `SELECT
                r.rental_id,
                r.plate_number,
                v.make,
                v.model,
                r.pickup_loc,
                r.return_loc,
                r.start_date,
                r.end_date,
                r.status
             FROM RENTAL r
             JOIN VEHICLE v
                ON r.plate_number = v.plate_number
             WHERE r.customer_id = ?
             ORDER BY r.start_date DESC`,
            [customerId]
        );

        res.status(200).json({
            success: true,
            data: {
                ...customers[0],
                rentals
            }
        });

    } catch (error) {
        console.error("Get customer error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch customer"
        });
    }
};

module.exports = {
    getMyRentals,
    getAllCustomers,
    getCustomerById
};