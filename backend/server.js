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

// **** ROUTES FOR CHARTS ****

// Route to get grantors, sorted DESC by number of deed reviews. This has flaws since it's not counting the number
// of actual deeds. Also, this is only based on exact string match.
app.get("/api/stats/top_grantors", async (req, res) => {
    try {
        const result = await pool.query(`
         SELECT grantors, COUNT(*) from deed_reviews WHERE deed_reviews.grantors IS NOT NULL
         GROUP BY grantors ORDER BY COUNT(*) DESC
        `);
        res.json({ top_grantors: result });
    } catch (err) {
        console.error("Error in /api/stats/top_grantors:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get grantors, sorted DESC by number of deed reviews. This has flaws since it's not counting the number
// of actual deeds. Using regex to match similar named grantors though
app.get("/api/stats/top_grantors_regex", async (req, res) => {
    try {
        const result = await pool.query(`
            WITH normalized AS (SELECT grantors,
                                       initcap(
                                               regexp_replace(
                                                       regexp_replace(
                                                               regexp_replace(
                                                                       regexp_replace(
                                                                               regexp_replace(
                                                                                       lower(trim(grantors)),
                                                                                       '^\\s*the\\s+', '', 'i'
                                                                               ),
                                                                               '\\s*(;|,| and | & ).*$', '', 'i'
                                                                       ),
                                                                       '\\.', '', 'g'
                                                               ),
                                                               '\\s+(company|co|co\\.|incorporated|inc|inc\\.|corp|corp\\.|corporation|co-?operative|cooperative|trust|society|bank|shore?s|improvement\\s+society)\\s*$',
                                                               '', 'i'
                                                       ),
                                                       '\\s+', ' ', 'g'
                                               )
                                       ) AS normalized_grantor
                                FROM deed_reviews)
            SELECT normalized_grantor, COUNT(*) AS deed_count
            FROM normalized
            WHERE normalized_grantor IS NOT NULL
            GROUP BY normalized_grantor
            ORDER BY deed_count DESC
        `);
        res.json({ top_grantors_regex: result });
    } catch (err) {
        console.error("Error in /api/stats/top_grantors_regex:", err);
        res.status(500).json({ error: err.message });
    }
});

// regex but counting by DISTINCT deed IDs to try to get closer to # of deeds rather than deed reviews
// limits to top 20 for readability
app.get("/api/stats/top_grantors_regex_dedupe", async (req, res) => {
    try {
        const result = await pool.query(`
            WITH normalized AS (SELECT deed_id, grantors,
                                       initcap(
                                               regexp_replace(
                                                       regexp_replace(
                                                               regexp_replace(
                                                                       regexp_replace(
                                                                               regexp_replace(
                                                                                       lower(trim(grantors)),
                                                                                       '^\\s*the\\s+', '', 'i'
                                                                               ),
                                                                               '\\s*(;|,| and | & ).*$', '', 'i'
                                                                       ),
                                                                       '\\.', '', 'g'
                                                               ),
                                                               '\\s+(company|co|co\\.|incorporated|inc|inc\\.|corp|corp\\.|corporation|co-?operative|cooperative|trust|society|bank|shore?s|improvement\\s+society)\\s*$',
                                                               '', 'i'
                                                       ),
                                                       '\\s+', ' ', 'g'
                                               )
                                       ) AS normalized_grantor
                                FROM deed_reviews)
            SELECT normalized_grantor, COUNT(DISTINCT deed_id) AS deed_count
            FROM normalized
            WHERE normalized_grantor IS NOT NULL
            GROUP BY normalized_grantor
            ORDER BY deed_count DESC
            LIMIT 20
        `);
        res.json({ top_grantors_regex_dedupe: result });
    } catch (err) {
        console.error("Error in /api/stats/top_grantors_regex_dedupe:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get top exclusion types (pre-identified on deed, not through deed review)
app.get("/api/stats/top_exclusion_types", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT et.title, COUNT(*) FROM deed_exclusion_types det
            JOIN exclusion_types et on det.exclusion_type_id = et.id
            GROUP BY et.id ORDER BY COUNT(*) DESC
        `);
        res.json({ top_exclusion_types: result });
    } catch (err) {
        console.error("Error in /api/stats/top_exclusion_types:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get top exclusion types (through deed review)
app.get("/api/stats/top_exclusion_types_deed_review", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT et.title, COUNT(DISTINCT dr.deed_id) AS deed_count
            FROM deed_review_exclusion_types dret
                     JOIN exclusion_types et on dret.exclusion_type_id = et.id
                     JOIN deed_reviews dr on dret.deed_review_id = dr.id
            WHERE dr.is_restrictive_covenant = TRUE
            GROUP BY et.id
            ORDER BY COUNT(*) DESC
            LIMIT 20
        `);
        res.json({ top_exclusion_types_deed_review: result });
    } catch (err) {
        console.error("Error in /api/stats/top_exclusion_type_deed_review:", err);
        res.status(500).json({ error: err.message });
    }
});

// Route to get counts of exclusion types per year
// GET /api/exclusions/time-series?types=1,2,5&startYear=1800&endYear=1970&county=Worcester
app.get('/api/exclusions/time-series', async (req, res) => {
    try {
        const { types, startYear, endYear, county } = req.query;

        const typeIds = types
            ? types.split(',').map((t) => parseInt(t, 10)).filter(Boolean)
            : [];

        const start = startYear ? parseInt(startYear, 10) : 1800;
        const end   = endYear   ? parseInt(endYear, 10)   : 1970;
        const counties = county
            ? county.split(',') : ['Worcester', 'Norfolk_LR', 'Northern Middlesex'];

        const sql = `
      WITH per_deed_exclusion AS (
        SELECT DISTINCT
          dr.deed_id,
          et.id   AS exclusion_type_id,
          et.title,
          EXTRACT(YEAR FROM dr.deed_date)::int AS year,
          bp.county
        FROM deed_review_exclusion_types AS dret
        JOIN exclusion_types AS et
          ON dret.exclusion_type_id = et.id
        JOIN deed_reviews AS dr
          ON dret.deed_review_id = dr.id
        JOIN deeds AS d
          ON dr.deed_id = d.id
        JOIN deed_review_book_pages drbp
          ON dr.id = drbp.deed_review_id
        JOIN book_pages bp 
          ON bp.id = drbp.book_page_id
        WHERE
          (cardinality($1::int[]) = 0 OR et.id = ANY($1::int[]))
          AND EXTRACT(YEAR FROM dr.deed_date)::int BETWEEN $2 AND $3
          AND (cardinality($4::text[]) = 0 OR bp.county = ANY($4::text[]))  
      )
      SELECT
        year,
        exclusion_type_id AS "exclusionTypeId",
        title,
        county,
        COUNT(*) AS "deedCount"
      FROM per_deed_exclusion
      GROUP BY year, exclusion_type_id, title, county
      ORDER BY year, exclusion_type_id;
    `;

        const { rows } = await pool.query(sql, [typeIds, start, end, counties]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get all exclusion types
app.get("/api/stats/exclusion_types", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, title FROM exclusion_types")
        res.json({ exclusion_types: result.rows });
    } catch (err) {
        console.error("Error in /api/stats/exclusion_types:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
