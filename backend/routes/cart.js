const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getCart);
router.post("/", authMiddleware, addToCart);
router.delete("/clear", authMiddleware, clearCart);
router.delete("/:itemId", authMiddleware, removeFromCart);

module.exports = router;
