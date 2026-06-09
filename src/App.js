import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

const styles = {
  container: { padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#141414', color: 'white', minHeight: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '15px', background: '#000', marginBottom: '30px', borderBottom: '2px solid #E50914', position: 'sticky', top: 0, zIndex: 100 },
  link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' },
  cartBadge: { backgroundColor: '#E50914', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', marginLeft: '5px' },
  card: { background: '#2f2f2f', padding: '20px', borderRadius: '10px', marginBottom: '15px', borderLeft: '5px solid #E50914' },
  button: { padding: '10px 20px', backgroundColor: '#E50914', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' },
  qtyBtn: { padding: '5px 10px', margin: '0 5px', cursor: 'pointer' },
  warning: { color: '#ffcc00', fontWeight: 'bold', fontSize: '14px', marginTop: '10px' }
};

// Data inspired by Data.js requirements
const SUBSCRIPTIONS = [
  { id: 's1', name: "Individual Plan", price: 10, type: 'sub' },
  { id: 's2', name: "Friendly Plan", price: 15, type: 'sub' },
  { id: 's3', name: "Family Plan", price: 20, type: 'sub' }
];

const ACCESSORIES = [
  { id: 'a1', name: "EZTech T-Shirt", price: 25, type: 'acc' },
  { id: 'a2', name: "EZTech Phone Case", price: 15, type: 'acc' }
];

export default function App() {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('ezCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ezCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const isSubscription = product.type === 'sub';
    const hasSubscription = cart.some(item => item.type === 'sub');

    if (isSubscription && hasSubscription) {
      alert("WARNING: You can only have one active subscription at a time!");
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link style={styles.link} to="/">STREAMLIST</Link>
          <Link style={styles.link} to="/services">SERVICES</Link>
          <Link style={styles.link} to="/cart">
            CART <span style={styles.badge}>{cartCount}</span>
          </Link>
          <Link style={styles.link} to="/billing">BILLING</Link>
        </nav>

        <Routes>
          <Route path="/" element={<StreamList />} />
          <Route path="/services" element={<Services onAdd={addToCart} />} />
          <Route path="/cart" element={<CartView cart={cart} onUpdate={updateQty} onRemove={removeFromCart} />} />
          <Route path="/billing" element={<Billing />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- SERVICES PAGE (Subscription + Accessories) ---
function Services({ onAdd }) {
  return (
    <div>
      <h2>Streaming Subscriptions</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {SUBSCRIPTIONS.map(s => (
          <div key={s.id} style={styles.card}>
            <h3>{s.name}</h3>
            <p>${s.price}/mo</p>
            <button style={styles.button} onClick={() => onAdd(s)}>Add Subscription</button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: '40px' }}>EZTech Accessories</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {ACCESSORIES.map(a => (
          <div key={a.id} style={styles.card}>
            <h3>{a.name}</h3>
            <p>${a.price}</p>
            <button style={styles.button} onClick={() => onAdd(a)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- CART VIEW PAGE ---
function CartView({ cart, onUpdate, onRemove }) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <h2>Your Shopping Cart</h2>
      {cart.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          {cart.map(item => (
            <div key={item.id} style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{item.name}</h4>
                  <p>${item.price} x {item.qty}</p>
                </div>
                <div>
                  <button style={styles.qtyBtn} onClick={() => onUpdate(item.id, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button style={styles.qtyBtn} onClick={() => onUpdate(item.id, 1)}>+</button>
                  <button onClick={() => onRemove(item.id)} style={{ marginLeft: '20px', color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'right', borderTop: '1px solid white', paddingTop: '20px' }}>
            <h3>Total Price: ${total.toFixed(2)}</h3>
            <button style={styles.button}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

// Stubs for other routes
function StreamList() { return <h2>My StreamList</h2>; }
function Billing() { return <h2>Billing Management</h2>; }
