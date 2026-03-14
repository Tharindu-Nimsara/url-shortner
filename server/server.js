const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { nanoid } = require("nanoid");
const redis = require("redis");

const app = express();
app.use(cors());
app.use(express.json());

const port = 5000;

//-----------------------------------Database connection check
async function testDB() {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Database connected");
    console.log("Server time:", res.rows[0]);
  } catch (err) {
    console.error("❌ Database connection failed");
    console.error(err.message);
  }
}

testDB();

//-----------------------------------

//-----------------------------------
// Connect to local Redis instance (default port 6379)

const redisClient = redis.createClient({
  url: "redis://redis:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

async function connectRedis() {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.error(
      "⚠️ Redis connection failed. Proceeding without cache.",
      err.message,
    );
  }
}
connectRedis();

//-----------------------------------

// Generates a random 7-character string (e.g., 'V1StGXR')
const generateShortCode = () => {
  return nanoid(7);
};

//-----------------------------------------------------------------------
//CORE LOGICS
//-----------------------------------------------------------------------

// Rate Limiting Middleware
const rateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const limit = 10; // Max 10 requests
  const windowInSeconds = 60; // Per 60 seconds

  try {
    // Increment the counter for this IP
    const requestCount = await redisClient.incr(ip);

    if (requestCount === 1) {
      // If it's the first request, set the expiration timer
      await redisClient.expire(ip, windowInSeconds);
    }

    if (requestCount > limit) {
      return res
        .status(429)
        .json({ error: "Too many requests. Please try again later." });
    }

    next(); // IP is under the limit, proceed to the route handler
  } catch (error) {
    console.error("Rate Limiter Error:", error);
    next(); // Fail open so the app keeps working if Redis fails
  }
};

//Post Original url
app.post("/", rateLimiter, async (req, res) => {
  const { originalUrl } = req.body;

  // 1. Validate URL
  try {
    new URL(originalUrl);
  } catch (err) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  // 2. Generate hash
  const shortCode = generateShortCode();

  // 3. Save to PostgreSQL
  try {
    const query = `
            INSERT INTO urls (original_url, short_code, expires_at) 
            VALUES ($1, $2, now() + interval '7 days') 
            RETURNING *;
        `;
    const values = [originalUrl, shortCode];
    await pool.query(query, values);

    // 4. Return success
    res.status(201).json({ shortUrl: `http://localhost:${port}/${shortCode}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database error" });
  }
});

// Get analytics from analytics db
app.get("/analytics/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const query = `
      SELECT 
        DATE(accessed_at) as date, 
        COUNT(*) as clicks 
      FROM analytics 
      WHERE short_code = $1 
      GROUP BY DATE(accessed_at) 
      ORDER BY date ASC;
    `;
    const { rows } = await pool.query(query, [shortCode]);

    // Calculate total clicks quickly
    const totalClicks = rows.reduce(
      (sum, row) => sum + parseInt(row.clicks),
      0,
    );

    res.json({ totalClicks, timeline: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//Redirect to original url from shortUrl.
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    // 1. Check Redis Cache First
    const cachedUrl = await redisClient.get(shortCode);

    if (cachedUrl) {
      // CACHE HIT: Record analytics then redirect
      const ipAddress = req.ip;
      const userAgent = req.headers["user-agent"];
      pool
        .query(
          "INSERT INTO analytics (short_code, ip_address, user_agent) VALUES ($1, $2, $3)",
          [shortCode, ipAddress, userAgent],
        )
        .catch((err) => console.error("Analytics error (cache hit):", err));
      return res.redirect(302, cachedUrl);
    }
    // CACHE MISS
    // 1. Query PostgreSQL
    const query =
      "SELECT original_url, expires_at FROM urls WHERE short_code = $1";
    const { rows } = await pool.query(query, [shortCode]);

    // 2. Handle missing URL
    if (rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }
    const originalUrl = rows[0].original_url;
    const expiresAt = rows[0].expires_at;
    const now = new Date();

    // Check if the link has an expiration date and if it has passed
    if (expiresAt && now > new Date(expiresAt)) {
      return res.status(410).json({ error: "This link has expired" }); // 410 Gone
    }

    // 3. Save to Redis for future requests (Set expiration to 24 hours)
    await redisClient.setEx(shortCode, 86400, originalUrl);

    // 4. Redirect (HTTP 302)
    res.redirect(302, originalUrl);

    // 5. Send data to analytics db
    const ipAddress = req.ip;
    const userAgent = req.headers["user-agent"];

    pool
      .query(
        "INSERT INTO analytics (short_code, ip_address, user_agent) VALUES ($1, $2, $3)",
        [shortCode, ipAddress, userAgent],
      )
      .catch((err) => console.error("Analytics error:", err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//-----------------------------------------------------------------------

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
