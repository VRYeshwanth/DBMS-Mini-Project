const app = require("./app");
const { syncRentalStatuses } = require("./utils/rentalStatusSync");

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);

    // Initial sync of expired rentals on server startup
    await syncRentalStatuses();

    // Periodic check every 60 seconds while server runs
    setInterval(syncRentalStatuses, 60 * 1000);
});