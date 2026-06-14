const db = require("../config/db");

// GET MENU FOR A RESTAURANT
const getMenuByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const [restaurant] = await db.query(
      "SELECT id FROM restaurants WHERE id = ?",
      [id],
    );
    if (restaurant.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const [menuItems] = await db.query(
      "SELECT * FROM menu_items WHERE restaurant_id = ?",
      [id],
    );

    res.json({ menuItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// ADD MENU ITEM (admin only)
const addMenuItem = async (req, res) => {
  try {
    const {
      restaurant_id,
      name,
      description,
      price,
      image_url,
      category,
      is_veg,
    } = req.body;

    if (!restaurant_id || !name || !price) {
      return res
        .status(400)
        .json({ message: "restaurant_id, name and price are required." });
    }

    const [restaurant] = await db.query(
      "SELECT id FROM restaurants WHERE id = ?",
      [restaurant_id],
    );
    if (restaurant.length === 0) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    const [result] = await db.query(
      `INSERT INTO menu_items 
        (restaurant_id, name, description, price, image_url, category, is_veg) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        restaurant_id,
        name,
        description || null,
        price,
        image_url || null,
        category || null,
        is_veg || false,
      ],
    );

    res.status(201).json({
      message: "Menu item added successfully!",
      menuItemId: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// UPDATE MENU ITEM (admin only)
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, category, is_veg } = req.body;

    const [existing] = await db.query(
      "SELECT id FROM menu_items WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    await db.query(
      `UPDATE menu_items SET 
        name = ?, description = ?, price = ?, 
        image_url = ?, category = ?, is_veg = ?
       WHERE id = ?`,
      [name, description, price, image_url, category, is_veg, id],
    );

    res.json({ message: "Menu item updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// DELETE MENU ITEM (admin only)
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query(
      "SELECT id FROM menu_items WHERE id = ?",
      [id],
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    await db.query("DELETE FROM menu_items WHERE id = ?", [id]);
    res.json({ message: "Menu item deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  getMenuByRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
