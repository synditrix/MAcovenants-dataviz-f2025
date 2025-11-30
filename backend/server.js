// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Basic sanity check route
app.get("/", (req, res) => {
    res.json({ ok: true, message: "MA covenants API is running" });
});

// DB health check route
app.get("/api/health/db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW() as now");
        res.json({ db_ok: true, now: result.rows[0].now });
    } catch (err) {
        console.error("DB health check failed:", err);
        res.status(500).json({ db_ok: false, error: err.message });
    }
});

// **** ROUTES FOR DASHBOARD STATISTICS ****

// Route to get total number of system-identified covenants
app.get("/api/stats/total-system-id-covenants", async (req, res) => {
    try {
        const result = await pool.query("SELECT COUNT(*) FROM deeds");
        res.json({ total_system_id_covenants: result.rows[0].count });
    } catch (err) {
        console.error("Error in /api/stats/total-system-id-covenants:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get total number of manually confirmed covenants (deeds with at least 2 positive reviews and no negative reviews)
app.get("/api/stats/total-confirmed-covenants", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) FROM (
                SELECT deed_id, 
                COUNT(*) FILTER (WHERE is_restrictive_covenant = TRUE) as positive_reviews,
                COUNT(*) FILTER (WHERE is_restrictive_covenant = FALSE) as negative_reviews
                FROM deed_reviews
                GROUP BY deed_id
                HAVING COUNT(*) FILTER (WHERE is_restrictive_covenant = TRUE) >= 2 
                AND COUNT(*) FILTER (WHERE is_restrictive_covenant = FALSE) = 0
            )
        `);
        res.json({ total_confirmed_covenants: result.rows[0].count });
    } catch (err) {
        console.error("Error in /api/stats/total-confirmed-covenants:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get total number of pending deed reviews
app.get("/api/stats/total-pending-reviews", async (req, res) => {
    try {
        const result = await pool.query(`
         SELECT COUNT(*) from deed_reviews WHERE deed_reviews.is_restrictive_covenant IS NULL
        `);
        res.json({ total_pending_reviews: result.rows[0].count });
    } catch (err) {
        console.error("Error in /api/stats/total-pending-reviews:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get number of deeds with review requested
app.get("/api/stats/total_review_requested", async (req, res) => {
    try {
        const result = await pool.query(`
         SELECT COUNT(*) from deed_reviews WHERE deed_reviews.review_required = true
        `);
        res.json({ total_review_requested: result.rows[0].count });
    } catch (err) {
        console.error("Error in /api/stats/total-review_requested:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get number of false positive deeds (deeds with at least 2 negative reviews and no positive reviews)
app.get("/api/stats/total_false_positives", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT COUNT(*) FROM (
                SELECT deed_id, 
                COUNT(*) FILTER (WHERE is_restrictive_covenant = TRUE) as positive_reviews,
                COUNT(*) FILTER (WHERE is_restrictive_covenant = FALSE) as negative_reviews
                FROM deed_reviews
                GROUP BY deed_id
                HAVING COUNT(*) FILTER (WHERE is_restrictive_covenant = TRUE) = 0 
                AND COUNT(*) FILTER (WHERE is_restrictive_covenant = FALSE) >= 2
            )
        `);
        res.json({ total_false_positives: result.rows[0].count });
    } catch (err) {
        console.error("Error in /api/stats/total-false-positives", err);
        res.status(500).json({ error: err.message });
    }
});

// /**
//  * Example: covenants by county
//  * You WILL need to adjust table/column names to match your schema.
//  * Open pgAdmin → your DB → public → deeds and check columns.
//  *
//  * Assumptions here:
//  *   - table: deeds
//  *   - columns:
//  *       county (text or varchar)
//  *       has_covenant (boolean)   <-- change this if your column is named differently
//  */
// app.get("/api/stats/covenants-by-county", async (req, res) => {
//     try {
//         const result = await pool.query(`
//       SELECT
//         county,
//         COUNT(*) AS total_deeds,
//         SUM(CASE WHEN has_covenant THEN 1 ELSE 0 END) AS covenant_deeds
//       FROM deeds
//       GROUP BY county
//       ORDER BY covenant_deeds DESC;
//     `);
//
//         // Convert string counts to numbers for frontend convenience
//         const rows = result.rows.map((r) => ({
//             county: r.county,
//             total_deeds: Number(r.total_deeds),
//             covenant_deeds: Number(r.covenant_deeds),
//         }));
//
//         res.json(rows);
//     } catch (err) {
//         console.error("Error in /api/stats/covenants-by-county:", err);
//         res.status(500).json({ error: err.message });
//     }
// });

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
