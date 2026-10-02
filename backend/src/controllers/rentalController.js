const pool = require("../config/db");


const createRental = async (req, res) => {
    const {
        plate_number,
        pickup_loc,
        return_loc,
        start_date,
        end_date
    } = req.body;

    if (
        !plate_number ||
        !pickup_loc ||
        !return_loc ||
        !start_date ||
        !end_date
    ) {
        return res.status(400).json({
            success: false,
            message: "All rental fields are required"
        });
    }

    if (start_date > end_date) {
        return res.status(400).json({
            success: false,
            message: "End date must be on or after start date"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        /*
         * Find the customer associated with the
         * currently authenticated user.
         */
        const [customers] = await connection.query(
            `SELECT customer_id
             FROM CUSTOMER
             WHERE user_id = ?`,
            [req.user.user_id]
        );

        if (customers.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Customer profile not found"
            });
        }

        const customerId = customers[0].customer_id;


        /*
         * Check whether the vehicle exists.
         */
        const [vehicles] = await connection.query(
            `SELECT plate_number
             FROM VEHICLE
             WHERE plate_number = ?`,
            [plate_number]
        );

        if (vehicles.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Vehicle not found"
            });
        }

        const [activeMaintenance] = await connection.query(
            `SELECT maintenance_id
            FROM MAINTENANCE
            WHERE plate_number = ?
            AND maintenance_status = 'Active'
            LIMIT 1`,
            [plate_number]
        );

        if (activeMaintenance.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Vehicle is currently under maintenance and cannot be rented"
            });
        }


        /*
         * Check for an overlapping ACTIVE rental.
         *
         * Existing:
         * start_date <= requested end_date
         * AND
         * end_date >= requested start date
         */
        const [conflictingRentals] = await connection.query(
            `SELECT rental_id
             FROM RENTAL
             WHERE plate_number = ?
               AND status = 'Active'
               AND start_date <= ?
               AND end_date >= ?
             LIMIT 1`,
            [
                plate_number,
                end_date,
                start_date
            ]
        );

        if (conflictingRentals.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Vehicle is not available for the selected dates"
            });
        }


        /*
         * Generate custom rental ID.
         */
        const [lastRental] = await connection.query(
            `SELECT rental_id
             FROM RENTAL
             WHERE rental_id LIKE 'REN%'
             ORDER BY rental_id DESC
             LIMIT 1`
        );

        let rentalId;

        if (lastRental.length === 0) {
            rentalId = "REN001";
        } else {
            const lastId = lastRental[0].rental_id;
            const numberPart = lastId.replace("REN", "");
            const lastNumber = Number(numberPart);

            if (Number.isNaN(lastNumber)) {
                throw new Error(
                    `Invalid rental ID format: ${lastId}`
                );
            }

            rentalId = `REN${String(lastNumber + 1).padStart(3, "0")}`;
        }


        /*
         * Create the rental.
         */
        await connection.query(
            `INSERT INTO RENTAL
            (
                rental_id,
                customer_id,
                plate_number,
                pickup_loc,
                return_loc,
                start_date,
                end_date,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                rentalId,
                customerId,
                plate_number,
                pickup_loc,
                return_loc,
                start_date,
                end_date,
                "Active"
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Rental created successfully",
            data: {
                rental_id: rentalId
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Create rental error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to create rental"
        });

    } finally {
        connection.release();
    }
};

const getAllRentals = async (req, res) => {
    try {
        let rows;

        if (req.user.role === "admin") {
            [rows] = await pool.query(
                `SELECT
                    r.rental_id,
                    r.customer_id,
                    c.name AS customer_name,
                    c.phone AS customer_phone,
                    r.plate_number,
                    v.make,
                    v.model,
                    v.type,
                    r.pickup_loc,
                    r.return_loc,
                    r.start_date,
                    r.end_date,
                    r.status
                 FROM RENTAL r
                 JOIN CUSTOMER c
                    ON r.customer_id = c.customer_id
                 JOIN VEHICLE v
                    ON r.plate_number = v.plate_number
                 ORDER BY r.start_date DESC`
            );
        } else {
            [rows] = await pool.query(
                `SELECT
                    r.rental_id,
                    r.customer_id,
                    r.plate_number,
                    v.make,
                    v.model,
                    v.type,
                    r.pickup_loc,
                    r.return_loc,
                    r.start_date,
                    r.end_date,
                    r.status
                 FROM RENTAL r
                 JOIN CUSTOMER c
                    ON r.customer_id = c.customer_id
                 JOIN VEHICLE v
                    ON r.plate_number = v.plate_number
                 WHERE c.user_id = ?
                 ORDER BY r.start_date DESC`,
                [req.user.user_id]
            );
        }

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Get rentals error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch rentals"
        });
    }
};

const getRentalById = async (req, res) => {
    const { rentalId } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT
                r.rental_id,
                r.customer_id,
                c.name AS customer_name,
                c.phone AS customer_phone,
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
                r.status
             FROM RENTAL r
             JOIN CUSTOMER c
                ON r.customer_id = c.customer_id
             JOIN VEHICLE v
                ON r.plate_number = v.plate_number
             WHERE r.rental_id = ?`,
            [rentalId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Rental not found"
            });
        }

        const rental = rows[0];

        /*
         * Customers can only view their own rentals.
         */
        if (req.user.role === "customer") {
            const [customer] = await pool.query(
                `SELECT customer_id
                 FROM CUSTOMER
                 WHERE user_id = ?`,
                [req.user.user_id]
            );

            if (
                customer.length === 0 ||
                customer[0].customer_id !== rental.customer_id
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        res.status(200).json({
            success: true,
            data: rental
        });

    } catch (error) {
        console.error("Get rental error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch rental"
        });
    }
};


module.exports = {
    createRental,
    getAllRentals,
    getRentalById
};