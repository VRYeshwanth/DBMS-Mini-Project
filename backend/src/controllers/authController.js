const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

const generateNextId = async (connection, table, column, prefix) => {
    const [rows] = await connection.query(
        `SELECT ${column}
         FROM ${table}
         WHERE ${column} LIKE ?
         ORDER BY ${column} DESC
         LIMIT 1`,
        [`${prefix}%`]
    );

    if (rows.length === 0) {
        return `${prefix}001`;
    }

    const lastId = rows[0][column];

    const numberPart = lastId.replace(prefix, "");

    const lastNumber = Number(numberPart);

    if (Number.isNaN(lastNumber)) {
        throw new Error(
            `Invalid ID format in ${table}: ${lastId}`
        );
    }

    return `${prefix}${String(lastNumber + 1).padStart(3, "0")}`;
};


const register = async (req, res) => {
    const {
        email,
        password,
        name,
        address,
        phone,
        dob
    } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({
            success: false,
            message: "Email, password and name are required"
        });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [existingUsers] = await connection.query(
            "SELECT user_id FROM USER_ACC WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            await connection.rollback();

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const userId = await generateNextId(
            connection,
            "USER_ACC",
            "user_id",
            "USR"
        );

        const customerId = await generateNextId(
            connection,
            "CUSTOMER",
            "customer_id",
            "CUS"
        );

        const passwordHash = await bcrypt.hash(password, 10);

        await connection.query(
            `INSERT INTO USER_ACC
            (user_id, email, password, role, created_at)
            VALUES (?, ?, ?, ?, NOW())`,
            [
                userId,
                email,
                passwordHash,
                "customer"
            ]
        );

        await connection.query(
            `INSERT INTO CUSTOMER
            (customer_id, user_id, name, address, phone, dob)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                customerId,
                userId,
                name,
                address || null,
                phone || null,
                dob || null
            ]
        );

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Customer registered successfully",
            data: {
                user_id: userId,
                customer_id: customerId
            }
        });

    } catch (error) {
        await connection.rollback();

        console.error("Registration error:", error.message);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });

    } finally {
        connection.release();
    }
};


const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        const [rows] = await pool.query(
            `SELECT user_id, email, password, role
             FROM USER_ACC
             WHERE email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
};


const getCurrentUser = async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT
                u.user_id,
                u.email,
                u.role,
                u.created_at,
                c.customer_id,
                c.name,
                c.address,
                c.phone,
                c.dob
             FROM USER_ACC u
             LEFT JOIN CUSTOMER c
                ON u.user_id = c.user_id
             WHERE u.user_id = ?`,
            [req.user.user_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get current user error:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
};


module.exports = {
    register,
    login,
    getCurrentUser
};