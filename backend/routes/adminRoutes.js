const express = require("express");
const router = express.Router();
const db = require("../config/db");
const authMiddleware = require("../middleware/auth"); // ✅ Fixed path
const adminMiddleware = require("../middleware/adminMiddleware");

// All routes protected
router.use(authMiddleware, adminMiddleware);

// GET all restaurants
router.get("/restaurants", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM restaurants ORDER BY created_at DESC",
    );
    res.json({ restaurants: rows });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST add restaurant
router.post("/restaurants", async (req, res) => {
  const { name, cuisine, image_url, rating, delivery_time, min_order } =
    req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO restaurants (name, cuisine, image_url, rating, delivery_time, min_order) VALUES (?, ?, ?, ?, ?, ?)",
      [name, cuisine, image_url, rating, delivery_time, min_order],
    );
    res.json({ message: "Restaurant added!", id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT update restaurant
router.put("/restaurants/:id", async (req, res) => {
  const { name, cuisine, image_url, rating, delivery_time, min_order } =
    req.body;
  try {
    await db.query(
      "UPDATE restaurants SET name=?, cuisine=?, image_url=?, rating=?, delivery_time=?, min_order=? WHERE id=?",
      [
        name,
        cuisine,
        image_url,
        rating,
        delivery_time,
        min_order,
        req.params.id,
      ],
    );
    res.json({ message: "Restaurant updated!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE restaurant
router.delete("/restaurants/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM restaurants WHERE id=?", [req.params.id]);
    res.json({ message: "Restaurant deleted!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
