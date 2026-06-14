const db = require("../config/db");

// PLACE NEW ORDER
const placeOrder = async (req, res) => {
  try {
    const { restaurant_id, address_id, items, payment_method } = req.body;
    const user_id = req.user.id;

    if (!restaurant_id || !address_id || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "restaurant_id, address_id and items are required." });
    }

    // Calculate total amount
    let total_amount = 0;
    for (const item of items) {
      const [menuItem] = await db.query(
        "SELECT price FROM menu_items WHERE id = ?",
        [item.menu_item_id],
      );
      if (menuItem.length === 0) {
        return res
          .status(404)
          .json({ message: `Menu item ${item.menu_item_id} not found.` });
      }
      total_amount += menuItem[0].price * item.quantity;
    }

    // Create the order
    const [orderResult] = await db.query(
      `INSERT INTO orders 
        (user_id, restaurant_id, address_id, total_amount, payment_method) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        user_id,
        restaurant_id,
        address_id,
        total_amount,
        payment_method || "COD",
      ],
    );

    const order_id = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      const [menuItem] = await db.query(
        "SELECT price FROM menu_items WHERE id = ?",
        [item.menu_item_id],
      );
      await db.query(
        `INSERT INTO order_items (order_id, menu_item_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [order_id, item.menu_item_id, item.quantity, menuItem[0].price],
      );
    }

    // Clear user's cart after order is placed
    await db.query("DELETE FROM cart_items WHERE user_id = ?", [user_id]);

    res.status(201).json({
      message: "Order placed successfully!",
      order_id,
      total_amount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while placing order." });
  }
};

// GET MY ORDERS
const getMyOrders = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [orders] = await db.query(
      `SELECT o.*, r.name AS restaurant_name, r.image_url AS restaurant_image
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [user_id],
    );

    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// GET SINGLE ORDER WITH ITEMS
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [orders] = await db.query(
      `SELECT o.*, r.name AS restaurant_name
       FROM orders o
       JOIN restaurants r ON o.restaurant_id = r.id
       WHERE o.id = ? AND o.user_id = ?`,
      [id, user_id],
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Get order items
    const [orderItems] = await db.query(
      `SELECT oi.*, m.name AS item_name, m.image_url
       FROM order_items oi
       JOIN menu_items m ON oi.menu_item_id = m.id
       WHERE oi.order_id = ?`,
      [id],
    );

    res.json({
      order: { ...orders[0], items: orderItems },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

// UPDATE ORDER STATUS (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "placed",
      "confirmed",
      "preparing",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const [existing] = await db.query("SELECT id FROM orders WHERE id = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: "Order not found." });
    }

    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);

    res.json({ message: `Order status updated to "${status}".` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, updateOrderStatus };
