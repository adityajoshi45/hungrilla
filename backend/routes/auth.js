const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");
const db = require("../config/db");

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

// Address routes
router.post("/address", authMiddleware, async (req, res) => {
  try {
    const { label, address_line, city, pincode } = req.body;

    if (!address_line || !city || !pincode) {
      return res
        .status(400)
        .json({ message: "address_line, city and pincode are required." });
    }

    const [result] = await db.query(
      "INSERT INTO addresses (user_id, label, address_line, city, pincode) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, label || "Home", address_line, city, pincode],
    );

    res.status(201).json({
      message: "Address added successfully!",
      address_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

router.get("/addresses", authMiddleware, async (req, res) => {
  try {
    const [addresses] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ?",
      [req.user.id],
    );
    res.json({ addresses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
