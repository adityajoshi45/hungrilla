const express = require("express");
const router = express.Router();
const {
  getAllRestaurants,
  getRestaurantById,
  addRestaurant,
  updateRestaurant,
} = require("../controllers/restaurantController");
const authMiddleware = require("../middleware/auth");

router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);
router.post("/", authMiddleware, addRestaurant);
router.put("/:id", authMiddleware, updateRestaurant);

module.exports = router;
