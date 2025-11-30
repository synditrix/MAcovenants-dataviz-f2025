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
