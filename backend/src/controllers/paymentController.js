const pool = require("../config/db");


const createPayment = async (req, res) => {
    const {
        rental_id,
        amount,
        payment_method
    } = req.body;

    if (!rental_id || amount === undefined || !payment_method) {
        return res.status(400).json({
            success: false,
            message: "Rental ID, amount and payment method are required"
        });
    }

    if (Number(amount) <= 0) {
        return res.status(400).json({
            success: false,
            message: "Payment amount must be greater than zero"
        });
    }

    const allowedMethods = ["UPI", "Card", "Cash"];

    if (!allowedMethods.includes(payment_method)) {
        return res.status(400).json({
            success: false,
            message: "Invalid payment method"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        /*
         * Find the rental.
         */
        const [rentals] = await connection.query(
            `SELECT
                r.rental_id,
                r.customer_id,
                r.status
            FROM RENTAL r
            WHERE r.rental_id = ?`,
            [rental_id]
        );

        if (rentals.length === 0) {
            await connection.rollback();

            return res.status(404).json({
                success: false,
                message: "Rental not found"
            });
        }

        const rental = rentals[0];

        if (rental.status !== "Active") {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Payment can only be made for an active rental"
            });
        }


        /*
         * If the requester is a customer,
         * verify that the rental belongs to them.
         */
        if (req.user.role === "customer") {
            const [customers] = await connection.query(
                `SELECT customer_id
                 FROM CUSTOMER
                 WHERE user_id = ?`,
                [req.user.user_id]
            );

            if (
                customers.length === 0 ||
                customers[0].customer_id !== rental.customer_id
            ) {
                await connection.rollback();

                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }


        /*
         * Because PAYMENT.rental_id is UNIQUE,
         * each rental can have only one payment.
         */
        const [existingPayment] = await connection.query(
            `SELECT payment_id
             FROM PAYMENT
             WHERE rental_id = ?`,
            [rental_id]
        );

        if (existingPayment.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Payment already exists for this rental"
            });
        }


        /*
         * Generate custom payment ID.
         */
        const [lastPayment] = await connection.query(
            `SELECT payment_id
             FROM PAYMENT
             WHERE payment_id LIKE 'PAY%'
             ORDER BY payment_id DESC
             LIMIT 1`
        );

        let paymentId;

        if (lastPayment.length === 0) {
            paymentId = "PAY001";
        } else {
            const lastId = lastPayment[0].payment_id;
            const numberPart = lastId.replace("PAY", "");
            const lastNumber = Number(numberPart);

            if (Number.isNaN(lastNumber)) {
                throw new Error(
                    `Invalid payment ID format: ${lastId}`
                );
            }

            paymentId = `PAY${String(lastNumber + 1).padStart(3, "0")}`;
        }


        /*
         * Insert payment.
         */
        await connection.query(
            `INSERT INTO PAYMENT
            (
                payment_id,
                rental_id,
                payment_date,
                payment_status,
                amount,
                payment_method
            )
            VALUES (?, ?, NOW(), ?, ?, ?)`,
            [
                paymentId,
                rental_id,
                "Paid",
                amount,
                payment_method
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Payment recorded successfully",
            data: {
                payment_id: paymentId
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Create payment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to record payment"
        });

    } finally {
        connection.release();
    }
};

const getAllPayments = async (req, res) => {
    try {
        let rows;

        if (req.user.role === "admin") {
            [rows] = await pool.query(
                `SELECT
                    p.payment_id,
                    p.rental_id,
                    r.customer_id,
                    c.name AS customer_name,
                    r.plate_number,
                    v.make,
                    v.model,
                    p.payment_date,
                    p.payment_status,
                    p.amount,
                    p.payment_method
                 FROM PAYMENT p
                 JOIN RENTAL r
                    ON p.rental_id = r.rental_id
                 JOIN CUSTOMER c
                    ON r.customer_id = c.customer_id
                 JOIN VEHICLE v
                    ON r.plate_number = v.plate_number
                 ORDER BY p.payment_date DESC`
            );
        } else {
            [rows] = await pool.query(
                `SELECT
                    p.payment_id,
                    p.rental_id,
                    r.customer_id,
                    r.plate_number,
                    v.make,
                    v.model,
                    p.payment_date,
                    p.payment_status,
                    p.amount,
                    p.payment_method
                 FROM PAYMENT p
                 JOIN RENTAL r
                    ON p.rental_id = r.rental_id
                 JOIN CUSTOMER c
                    ON r.customer_id = c.customer_id
                 JOIN VEHICLE v
                    ON r.plate_number = v.plate_number
                 WHERE c.user_id = ?
                 ORDER BY p.payment_date DESC`,
                [req.user.user_id]
            );
        }

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        console.error("Get payments error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payments"
        });
    }
};

const getPaymentById = async (req, res) => {
    const { paymentId } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT
                p.payment_id,
                p.rental_id,
                r.customer_id,
                c.name AS customer_name,
                c.phone AS customer_phone,
                r.plate_number,
                v.make,
                v.model,
                v.type,
                p.payment_date,
                p.payment_status,
                p.amount,
                p.payment_method
             FROM PAYMENT p
             JOIN RENTAL r
                ON p.rental_id = r.rental_id
             JOIN CUSTOMER c
                ON r.customer_id = c.customer_id
             JOIN VEHICLE v
                ON r.plate_number = v.plate_number
             WHERE p.payment_id = ?`,
            [paymentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment not found"
            });
        }

        const payment = rows[0];

        /*
         * Customers can only view their own payments.
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
                customer[0].customer_id !== payment.customer_id
            ) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }
        }

        res.status(200).json({
            success: true,
            data: payment
        });

    } catch (error) {
        console.error("Get payment error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch payment"
        });
    }
};


module.exports = {
    createPayment,
    getAllPayments,
    getPaymentById
};