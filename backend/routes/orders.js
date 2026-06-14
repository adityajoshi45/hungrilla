const express = require("express");
const router = express.Router();
const {
  placeOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, placeOrder);
router.get("/", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;
