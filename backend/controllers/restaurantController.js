const db = require("../config/db");

// GET ALL RESTAURANTS
const getAllRestaurants = async (req, res) => {
  try {
    const [restaurants] = await db.query("SELECT * FROM restaurants");
    res.json({ restaurants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET SINGLE RESTAURANT
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const [restaurants] = await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [id],
    );

    if (restaurants.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    res.json({ restaurant: restaurants[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// ADD RESTAURANT (admin only)
const addRestaurant = async (req, res) => {
  try {
    const { name, description, image_url, category, rating, delivery_time } =
      req.body;

    if (!name) {
      return res.status(400).json({ message: "Restaurant name is required." });
    }

    const [result] = await db.query(
      `INSERT INTO restaurants 
        (name, description, image_url, category, rating, delivery_time) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        image_url || null,
        category || null,
        rating || 0.0,
        delivery_time || 30,
      ],
    );

    res.status(201).json({
      message: "Restaurant added successfully!",
      restaurantId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// UPDATE RESTAURANT (admin only)
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      image_url,
      category,
      rating,
      is_open,
      delivery_time,
    } = req.body;

    const [existing] = await db.query(
      "SELECT id FROM restaurants WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    await db.query(
      `UPDATE restaurants SET 
        name = ?, description = ?, image_url = ?, 
        category = ?, rating = ?, is_open = ?, delivery_time = ?
       WHERE id = ?`,
      [
        name,
        description,
        image_url,
        category,
        rating,
        is_open,
        delivery_time,
        id,
      ],
    );

    res.json({ message: "Restaurant updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getAllRestaurants,
  getRestaurantById,
  addRestaurant,
  updateRestaurant,
};
