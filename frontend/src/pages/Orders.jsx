import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/orders")
      .then((res) => setOrders(res.data.orders || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusClass = (status) => {
    const map = {
      placed: "status-placed",
      confirmed: "status-confirmed",
      preparing: "status-preparing",
      out_for_delivery: "status-out_for_delivery",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return map[status] || "status-placed";
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loading">Loading your orders...</div>;

  return (
    <div className="orders-page">
      <div className="container">
        <h2 className="section-title">My Orders 📦</h2>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "50px" }}>📦</div>
            <h3>No orders yet</h3>
            <p>Place your first order from a restaurant!</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
              onClick={() => navigate("/")}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="card order-card">
              <div className="order-header">
                <div>
                  <h3>{order.restaurant_name}</h3>
                  <p className="order-meta">
                    Order #{order.id} · {formatDate(order.created_at)}
                  </p>
                  <p className="order-meta">
                    💵 {order.payment_method} ·{order.items?.length || 0}{" "}
                    item(s)
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`status-badge ${getStatusClass(order.status)}`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <p
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                      color: "#ff4d00",
                      marginTop: "8px",
                    }}
                  >
                    ₹{order.total_amount}
                  </p>
                </div>
              </div>

              {/* Order status progress bar */}
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px 16px",
                  background: "#f9f9f9",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {[
                    "placed",
                    "confirmed",
                    "preparing",
                    "out_for_delivery",
                    "delivered",
                  ].map((step, index) => {
                    const statuses = [
                      "placed",
                      "confirmed",
                      "preparing",
                      "out_for_delivery",
                      "delivered",
                    ];
                    const currentIndex = statuses.indexOf(order.status);
                    const isDone = index <= currentIndex;
                    return (
                      <div
                        key={step}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            background: isDone ? "#ff4d00" : "#ddd",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "13px",
                            fontWeight: "700",
                            transition: "background 0.3s",
                            zIndex: 1,
                          }}
                        >
                          {isDone ? "✓" : index + 1}
                        </div>
                        <p
                          style={{
                            fontSize: "10px",
                            marginTop: "6px",
                            color: isDone ? "#ff4d00" : "#aaa",
                            textAlign: "center",
                            fontWeight: isDone ? "600" : "400",
                          }}
                        >
                          {step.replace(/_/g, " ")}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
