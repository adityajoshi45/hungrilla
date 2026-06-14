const express = require("express");
const router = express.Router();
const {
  getMenuByRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const authMiddleware = require("../middleware/auth");

router.get("/restaurant/:id", getMenuByRestaurant);
router.post("/", authMiddleware, addMenuItem);
router.put("/:id", authMiddleware, updateMenuItem);
router.delete("/:id", authMiddleware, deleteMenuItem);

module.exports = router;
