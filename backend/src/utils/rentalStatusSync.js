const pool = require("../config/db");

/**
 * Automatically transitions any Active rental whose end_date has passed (< today)
 * to 'Completed'.
 *
 * Evaluates against both MySQL's CURDATE() and the application's local date (YYYY-MM-DD)
 * so that expired rentals are immediately updated whenever data is requested or loaded,
 * without depending on a continuous 24/7 background event scheduler.
 *
 * @param {import('mysql2/promise').Connection|import('mysql2/promise').Pool} [dbConnection]
 * @returns {Promise<number>} Number of updated rows
 */
const syncRentalStatuses = async (dbConnection = pool) => {
    try {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const localToday = `${year}-${month}-${day}`;

        const [result] = await dbConnection.query(
            `UPDATE RENTAL
             SET status = 'Completed'
             WHERE status = 'Active'
               AND (end_date < CURDATE() OR end_date < ?)`,
            [localToday]
        );

        if (result && result.affectedRows > 0) {
            console.log(`[RentalSync] Automatically updated ${result.affectedRows} expired rental(s) to 'Completed'.`);
        }

        return result ? result.affectedRows : 0;
    } catch (error) {
        console.error("[RentalSync Error] Failed to sync expired rentals:", error.message);
        return 0;
    }
};

module.exports = {
    syncRentalStatuses
};
