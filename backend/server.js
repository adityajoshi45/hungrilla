const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Hungrilla API!" });
});

// Routes — all active now
app.use("/api/auth", require("./routes/auth"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/menu", require("./routes/menu"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/admin", require("./routes/adminRoutes")); // ✅ Admin routes added

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Hungrilla server running on port ${PORT}`);
});
