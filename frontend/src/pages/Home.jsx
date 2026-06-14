import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/restaurants")
      .then((res) => setRestaurants(res.data.restaurants))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.category?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div className="loading">Loading restaurants...</div>;

  return (
    <div className="home-page">
      <div className="container">
        {/* Banner */}
        <div className="home-banner">
          <h1>🍔 Welcome to Hungrilla</h1>
          <p>Order delicious food from the best restaurants near you</p>
          <input
            type="text"
            placeholder="Search restaurants or cuisines..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              marginTop: "20px",
              padding: "12px 20px",
              borderRadius: "30px",
              border: "none",
              width: "100%",
              maxWidth: "500px",
              fontSize: "15px",
              outline: "none",
            }}
          />
        </div>

        {/* Restaurant listing */}
        <h2 className="section-title">All Restaurants</h2>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No restaurants found</h3>
            <p>Try searching something else</p>
          </div>
        ) : (
          <div className="restaurants-grid">
            {filtered.map((restaurant) => (
              <div
                key={restaurant.id}
                className="card restaurant-card"
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
              >
                <img
                  src={
                    restaurant.image_url ||
                    "https://via.placeholder.com/300x180?text=Restaurant"
                  }
                  alt={restaurant.name}
                />
                <div className="restaurant-card-body">
                  <h3>{restaurant.name}</h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#888",
                      marginTop: "4px",
                    }}
                  >
                    {restaurant.description || "Delicious food awaits!"}
                  </p>
                  <div className="restaurant-meta">
                    <span>⭐ {restaurant.rating || "N/A"}</span>
                    <span>🕐 {restaurant.delivery_time || 30} mins</span>
                    <span>🍽️ {restaurant.category || "Various"}</span>
                  </div>
                  <div style={{ marginTop: "10px" }}>
                    <span
                      className={`badge ${restaurant.is_open ? "badge-green" : "badge-red"}`}
                    >
                      {restaurant.is_open ? "Open Now" : "Closed"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
