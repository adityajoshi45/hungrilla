const db = require("../config/db");

// GET CART
const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [cartItems] = await db.query(
      `SELECT c.id, c.quantity, 
              m.id AS menu_item_id, m.name, m.price, 
              m.image_url, m.is_veg,
              r.id AS restaurant_id, r.name AS restaurant_name
       FROM cart_items c
       JOIN menu_items m ON c.menu_item_id = m.id
       JOIN restaurants r ON m.restaurant_id = r.id
       WHERE c.user_id = ?`,
      [user_id],
    );

    // Calculate cart total
    const total = cartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    res.json({ cartItems, total: total.toFixed(2) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// ADD ITEM TO CART
const addToCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { menu_item_id, quantity } = req.body;

    if (!menu_item_id) {
      return res.status(400).json({ message: "menu_item_id is required." });
    }

    // Check menu item exists
    const [menuItem] = await db.query(
      "SELECT id FROM menu_items WHERE id = ?",
      [menu_item_id],
    );
    if (menuItem.length === 0) {
      return res.status(404).json({ message: "Menu item not found." });
    }

    // If item already in cart, update quantity
    const [existing] = await db.query(
      "SELECT id, quantity FROM cart_items WHERE user_id = ? AND menu_item_id = ?",
      [user_id, menu_item_id],
    );

    if (existing.length > 0) {
      const newQty = existing[0].quantity + (quantity || 1);
      await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
        newQty,
        existing[0].id,
      ]);
      return res.json({ message: "Cart updated.", quantity: newQty });
    }

    // Otherwise insert new cart item
    await db.query(
      "INSERT INTO cart_items (user_id, menu_item_id, quantity) VALUES (?, ?, ?)",
      [user_id, menu_item_id, quantity || 1],
    );

    res.status(201).json({ message: "Item added to cart!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// REMOVE ITEM FROM CART
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const user_id = req.user.id;

    const [existing] = await db.query(
      "SELECT id FROM cart_items WHERE id = ? AND user_id = ?",
      [itemId, user_id],
    );
    if (existing.length === 0) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    await db.query("DELETE FROM cart_items WHERE id = ?", [itemId]);
    res.json({ message: "Item removed from cart." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// CLEAR ENTIRE CART
const clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;
    await db.query("DELETE FROM cart_items WHERE user_id = ?", [user_id]);
    res.json({ message: "Cart cleared." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };
