import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const Restaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingItem, setAddingItem] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [restRes, menuRes] = await Promise.all([
          API.get(`/restaurants/${id}`),
          API.get(`/menu/restaurant/${id}`),
        ]);
        setRestaurant(restRes.data.restaurant);
        setMenuItems(menuRes.data.menuItems);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const addToCart = async (menuItemId) => {
    try {
      setAddingItem(menuItemId);
      await API.post("/cart", { menu_item_id: menuItemId, quantity: 1 });
      setSuccessMsg("Item added to cart!");
      setTimeout(() => setSuccessMsg(""), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingItem(null);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    if (filter === "veg") return item.is_veg === 1;
    if (filter === "nonveg") return item.is_veg === 0;
    return true;
  });

  if (loading) return <div className="loading">Loading menu...</div>;

  if (!restaurant)
    return (
      <div className="empty-state">
        <h3>Restaurant not found</h3>
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Go Back Home
        </button>
      </div>
    );

  return (
    <div className="restaurant-page">
      <div className="container">
        {/* Restaurant Header */}
        <div
          className="card"
          style={{ marginBottom: "28px", overflow: "hidden" }}
        >
          <img
            src={
              restaurant.image_url ||
              "https://via.placeholder.com/1100x250?text=Restaurant"
            }
            alt={restaurant.name}
            style={{ width: "100%", height: "220px", objectFit: "cover" }}
          />
          <div style={{ padding: "20px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <h1 style={{ fontSize: "26px", fontWeight: "800" }}>
                  {restaurant.name}
                </h1>
                <p style={{ color: "#777", marginTop: "6px" }}>
                  {restaurant.description}
                </p>
                <div className="restaurant-meta" style={{ marginTop: "12px" }}>
                  <span>⭐ {restaurant.rating}</span>
                  <span>🕐 {restaurant.delivery_time} mins</span>
                  <span>🍽️ {restaurant.category}</span>
                </div>
              </div>
              <span
                className={`badge ${restaurant.is_open ? "badge-green" : "badge-red"}`}
                style={{ fontSize: "14px", padding: "6px 16px" }}
              >
                {restaurant.is_open ? "Open Now" : "Closed"}
              </span>
            </div>
          </div>
        </div>

        {/* Success message */}
        {successMsg && (
          <div
            style={{
              background: "#e8f8e8",
              color: "#27ae60",
              padding: "12px 16px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontWeight: "600",
            }}
          >
            ✅ {successMsg}
          </div>
        )}

        {/* Filter buttons */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {["all", "veg", "nonveg"].map((f) => (
            <button
              key={f}
              className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter(f)}
              style={{ padding: "8px 20px", fontSize: "13px" }}
            >
              {f === "all" ? "🍽️ All" : f === "veg" ? "🟢 Veg" : "🔴 Non-Veg"}
            </button>
          ))}
          <button
            className="btn btn-outline"
            onClick={() => navigate("/cart")}
            style={{
              marginLeft: "auto",
              padding: "8px 20px",
              fontSize: "13px",
            }}
          >
            🛒 View Cart
          </button>
        </div>

        {/* Menu title */}
        <h2 className="section-title">Menu</h2>

        {/* Menu grid */}
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <h3>No items found</h3>
            <p>Try a different filter</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="card menu-item-card">
                <img
                  src={
                    item.image_url ||
                    "https://via.placeholder.com/280x150?text=Food"
                  }
                  alt={item.name}
                />
                <div className="menu-item-body">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span>{item.is_veg ? "🟢" : "🔴"}</span>
                    <h4>{item.name}</h4>
                  </div>
                  <p>{item.description || "Delicious and freshly prepared"}</p>
                  <span className="badge badge-orange">{item.category}</span>
                </div>
                <div className="menu-item-footer">
                  <span className="menu-item-price">₹{item.price}</span>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "8px 18px", fontSize: "13px" }}
                    onClick={() => addToCart(item.id)}
                    disabled={addingItem === item.id}
                  >
                    {addingItem === item.id ? "Adding..." : "+ Add"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurant;
