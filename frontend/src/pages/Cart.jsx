import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

// Address form component
const AddressForm = ({ onAdded }) => {
  const [form, setForm] = useState({
    label: "Home",
    address_line: "",
    city: "",
    pincode: "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await API.post("/auth/address", form);
      setSuccess(true);
      onAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (success)
    return (
      <p style={{ color: "#27ae60", fontWeight: "600", fontSize: "14px" }}>
        ✅ Address saved! You can now place your order.
      </p>
    );

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Label</label>
        <select
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        >
          <option>Home</option>
          <option>Work</option>
          <option>Other</option>
        </select>
      </div>
      <div className="form-group">
        <label>Street Address</label>
        <input
          type="text"
          placeholder="e.g. 123 MG Road"
          value={form.address_line}
          onChange={(e) => setForm({ ...form, address_line: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>City</label>
        <input
          type="text"
          placeholder="e.g. Pune"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          required
        />
      </div>
      <div className="form-group">
        <label>Pincode</label>
        <input
          type="text"
          placeholder="e.g. 411001"
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          required
        />
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={saving}
      >
        {saving ? "Saving..." : "+ Save Address"}
      </button>
    </form>
  );
};

// Main Cart component
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setCartItems(res.data.cartItems);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await API.get("/auth/addresses");
      setAddresses(res.data.addresses);
      if (res.data.addresses.length > 0) {
        setSelectedAddress(res.data.addresses[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchAddresses();
  }, []);

  const removeItem = async (itemId) => {
    try {
      await API.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      alert("Please add a delivery address first!");
      return;
    }
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    try {
      setPlacingOrder(true);
      const restaurant_id = cartItems[0].restaurant_id;
      const items = cartItems.map((item) => ({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
      }));
      await API.post("/orders", {
        restaurant_id,
        address_id: selectedAddress,
        items,
        payment_method: "COD",
      });
      setOrderSuccess(true);
      setCartItems([]);
      setTimeout(() => navigate("/orders"), 2500);
    } catch (err) {
      console.error(err);
      alert("Failed to place order. Try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;

  if (orderSuccess)
    return (
      <div className="empty-state" style={{ paddingTop: "100px" }}>
        <div style={{ fontSize: "60px" }}>🎉</div>
        <h3 style={{ color: "#27ae60", marginTop: "16px" }}>
          Order Placed Successfully!
        </h3>
        <p>Redirecting to your orders...</p>
      </div>
    );

  return (
    <div className="cart-page">
      <div className="container">
        <h2 className="section-title">Your Cart 🛒</h2>

        {cartItems.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: "50px" }}>🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some delicious items from a restaurant</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
              onClick={() => navigate("/")}
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              gap: "24px",
            }}
          >
            {/* LEFT — Cart items list */}
            <div className="card">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <img
                    src={
                      item.image_url ||
                      "https://via.placeholder.com/70x70?text=Food"
                    }
                    alt={item.name}
                    style={{
                      width: "70px",
                      height: "70px",
                      borderRadius: "8px",
                      objectFit: "cover",
                    }}
                  />
                  <div className="cart-item-info">
                    <h4>{item.name}</h4>
                    <p>{item.restaurant_name}</p>
                    <p
                      style={{
                        color: "#ff4d00",
                        fontWeight: "600",
                        marginTop: "4px",
                      }}
                    >
                      ₹{item.price} × {item.quantity}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p
                      style={{
                        fontWeight: "700",
                        fontSize: "16px",
                        marginBottom: "8px",
                      }}
                    >
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="cart-total">
                <span>Total Amount</span>
                <span style={{ color: "#ff4d00", fontSize: "22px" }}>
                  ₹{total}
                </span>
              </div>
            </div>

            {/* RIGHT — Order summary */}
            <div
              className="card"
              style={{ padding: "20px", alignSelf: "start" }}
            >
              <h3 style={{ marginBottom: "16px", fontSize: "18px" }}>
                Order Summary
              </h3>

              {/* Address section */}
              <div className="form-group">
                <label>📍 Delivery Address</label>

                {addresses.length > 0 ? (
                  <>
                    <select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label} — {addr.address_line}, {addr.city}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-outline"
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        padding: "6px 12px",
                      }}
                      onClick={() => setShowAddressForm(!showAddressForm)}
                    >
                      {showAddressForm ? "Cancel" : "+ Add New Address"}
                    </button>
                    {showAddressForm && (
                      <div style={{ marginTop: "12px" }}>
                        <AddressForm
                          onAdded={() => {
                            fetchAddresses();
                            setShowAddressForm(false);
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p
                      style={{
                        color: "#e74c3c",
                        fontSize: "13px",
                        marginBottom: "10px",
                      }}
                    >
                      No address saved yet. Add one to continue:
                    </p>
                    <AddressForm onAdded={fetchAddresses} />
                  </>
                )}
              </div>

              {/* Price breakdown */}
              <div
                style={{
                  borderTop: "1px solid #f0f0f0",
                  paddingTop: "14px",
                  marginTop: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#777",
                  }}
                >
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                    fontSize: "14px",
                    color: "#777",
                  }}
                >
                  <span>Delivery fee</span>
                  <span style={{ color: "#27ae60" }}>FREE</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "700",
                    fontSize: "18px",
                    marginTop: "12px",
                  }}
                >
                  <span>Total</span>
                  <span style={{ color: "#ff4d00" }}>₹{total}</span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  color: "#888",
                  marginBottom: "16px",
                }}
              >
                💵 Payment: Cash on Delivery
              </div>

              <button
                className="btn btn-primary btn-block"
                onClick={placeOrder}
                disabled={placingOrder || addresses.length === 0}
                style={{ fontSize: "16px", padding: "14px" }}
              >
                {placingOrder ? "Placing Order..." : "🛒 Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
