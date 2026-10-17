const express = require("express");
const cors = require("cors");

const vehicleRoutes = require("./routes/vehicleRoutes");
const authRoutes = require("./routes/authRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const branchRoutes = require("./routes/branchRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const { syncRentalStatuses } = require("./utils/rentalStatusSync");

const app = express();

app.use(cors());
app.use(express.json());

// Auto-sync expired rentals on rental, customer, vehicle, and dashboard requests
app.use(async (req, res, next) => {
    try {
        const path = req.path;
        if (
            path.startsWith("/api/rentals") ||
            path.startsWith("/api/dashboard") ||
            path.startsWith("/api/customers") ||
            path.startsWith("/api/vehicles")
        ) {
            await syncRentalStatuses();
        }
    } catch (err) {
        console.error("Auto-sync middleware error:", err.message);
    }
    next();
});

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
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;