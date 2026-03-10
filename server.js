const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());

const port = 5000;

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


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
