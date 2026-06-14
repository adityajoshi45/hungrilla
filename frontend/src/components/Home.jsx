import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Home() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    API.get("/restaurants")
      .then((res) => setRestaurants(res.data.restaurants || res.data))
      .catch((err) => console.error("Failed to load restaurants", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.cuisine?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div className="loading">Loading restaurants…</div>;

  return (
    <div className="home-page">
      <div className="container">
        {/* Banner */}
        <div className="home-banner">
          <h1>Hungry? We've got you. 🍕</h1>
          <p>Order from the best restaurants near you</p>
        </div>

        {/* Search */}
        <div className="form-group" style={{ marginBottom: 28 }}>
          <input
            type="text"
            placeholder="Search restaurants or cuisines…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        <h2 className="section-title">All Restaurants</h2>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No restaurants found</h3>
            <p>Try a different search term</p>
          </div>
        ) : (
          <div className="restaurants-grid">
            {filtered.map((r) => (
              <div
                key={r._id}
                className="card restaurant-card"
                onClick={() => navigate(`/restaurant/${r._id}`)}
              >
                <img
                  src={
                    r.image ||
                    `https://placehold.co/400x180?text=${encodeURIComponent(r.name)}`
                  }
                  alt={r.name}
                />
                <div className="restaurant-card-body">
                  <h3>{r.name}</h3>
                  <span
                    className={`badge ${r.isOpen ? "badge-green" : "badge-red"}`}
                  >
                    {r.isOpen ? "Open" : "Closed"}
                  </span>
                  <div className="restaurant-meta">
                    <span>🍴 {r.cuisine || "Various"}</span>
                    {r.deliveryTime && <span>⏱ {r.deliveryTime} mins</span>}
                    {r.minOrder && <span>🛒 Min ₹{r.minOrder}</span>}
                    {r.rating && <span>⭐ {r.rating}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
