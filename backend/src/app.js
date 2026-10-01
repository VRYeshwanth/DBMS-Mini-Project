const express = require("express");
const cors = require("cors");

const vehicleRoutes = require("./routes/vehicleRoutes");

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

// Vehicle routes
app.use("/api/vehicles", vehicleRoutes);

module.exports = app;