const express = require("express");
const cors = require("cors");
const pool = require("./db");
const { nanoid } = require("nanoid");

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

// Generates a random 7-character string (e.g., 'V1StGXR')
const generateShortCode = () => {
  return nanoid(7);
};

//-----------------------------------------------------------------------
//CORE LOGIC
//-----------------------------------------------------------------------

//Post Original url
app.post("/", async (req, res) => {
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

//Redirect to original url from shortUrl.
app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    // 1. Query PostgreSQL
    const query = "SELECT original_url FROM urls WHERE short_code = $1";
    const { rows } = await pool.query(query, [shortCode]);

    // 2. Handle missing URL
    if (rows.length === 0) {
      return res.status(404).json({ error: "URL not found" });
    }

    // 3. Redirect (HTTP 302)
    const originalUrl = rows[0].original_url;
    res.redirect(302, originalUrl);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

//-----------------------------------------------------------------------

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
