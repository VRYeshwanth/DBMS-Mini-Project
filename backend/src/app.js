const express = require("express");
const cors = require("cors");

const vehicleRoutes = require("./routes/vehicleRoutes");
const authRoutes = require("./routes/authRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const branchRoutes = require("./routes/branchRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Vehicle Rental Management System API is running"
    });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/branches", branchRoutes);

module.exports = app;