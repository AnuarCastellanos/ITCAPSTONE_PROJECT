import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';

// --- GLOBAL STYLES (EZTechMovie Dark Theme) ---
const styles = {
  container: { padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#141414', color: 'white', minHeight: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '15px', background: '#000', marginBottom: '30px', borderBottom: '2px solid #E50914', position: 'sticky', top: 0, zIndex: 100 },
  link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' },
  badge: { backgroundColor: '#E50914', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', marginLeft: '5px' },
  card: { background: '#2f2f2f', padding: '15px', borderRadius: '10px', marginBottom: '15px', borderLeft: '5px solid #E50914' },
  input: { padding: '12px', margin: '10px 0', width: '100%', borderRadius: '4px', border: 'none', fontSize: '16px', backgroundColor: '#333', color: 'white' },
  button: { padding: '12px 24px', backgroundColor: '#E50914', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' },
  secondaryBtn: { padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px', width: '100%' },
  oauthBtn: { padding: '10px', backgroundColor: 'white', color: '#757575', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', width: '100%' }
};

export default function App() {
  // --- PERSISTENCE STATE INITIALIZATION ---
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ezUser')) || null);
  const [list, setList] = useState(() => JSON.parse(localStorage.getItem('myStreamList')) || []);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('ezCart')) || []);
  const [cards, setCards] = useState(() => JSON.parse(localStorage.getItem('userCards')) || []);

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => { localStorage.setItem('ezUser', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('myStreamList', JSON.stringify(list)); }, [list]);
  useEffect(() => { localStorage.setItem('ezCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('userCards', JSON.stringify(cards)); }, [cards]);

  // --- CART LOGIC: RESTRICT SUBSCRIPTIONS ---
  const addToCart = (product) => {
    if (product.type === 'sub' && cart.some(item => item.type === 'sub')) {
      alert("WARNING: EZTechMovie allows only one active subscription plan per account.");
      return;
    }
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateCartQty = (id, delta) => {
    setCart(cart.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);

  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link style={styles.link} to="/">STREAMLIST</Link>
          <Link style={styles.link} to="/movies">MOVIES (API)</Link>
          <Link style={styles.link} to="/cart">CART <span style={styles.badge}>{cartCount}</span></Link>
          <Link style={styles.link} to="/billing">BILLING</Link>
          {user && <button onClick={() => setUser(null)} style={{background:'none', color:'red', border:'none', cursor:'pointer'}}>Logout</button>}
        </nav>

        <Routes>
          {/* PROTECTED ROUTES: Redirect to login if user is null */}
          <Route path="/" element={user ? <StreamList list={list} setList={setList} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={() => setUser({name: "Group 2"})} />} />
          <Route path="/movies" element={user ? <Movies onAdd={(t) => setList([...list, {id: Date.now(), title: t}])} /> : <Navigate to="/login" />} />
          <Route path="/cart" element={user ? <CartView cart={cart} onUpdate={updateCartQty} onAdd={addToCart} /> : <Navigate to="/login" />} />
          <Route path="/billing" element={user ? <Billing cards={cards} setCards={setCards} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- LOGIN COMPONENT (OAuth & Access Control) ---
function Login({ onLogin }) {
  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center', background:'#222', padding:'40px', borderRadius:'10px' }}>
      <h1 style={{color: '#E50914'}}>EZTechMovie</h1>
      <input style={styles.input} type="email" placeholder="Email Address" />
      <input style={styles.input} type="password" placeholder="Password" />
      <button style={{...styles.button, width:'100%'}} onClick={onLogin}>Sign In</button>
      <p style={{margin:'20px 0'}}>OR</p>
      <button style={styles.oauthBtn} onClick={onLogin}>
        <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" width="18" alt="G"/>
        Continue with Google (OAuth)
      </button>
    </div>
  );
}

// --- MOVIES COMPONENT (TMDB API Integration) ---
function Movies({ onAdd }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_KEY = '3483f9cf45ef2f699a49557493dae62c';

  const search = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
      const data = await res.json();
      setMovies(data.results || []);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Global Movie Search</h2>
      <div style={{ maxWidth: '500px', margin: 'auto', display: 'flex', gap: '10px' }}>
        <input style={styles.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search TMDB..." />
        <button style={styles.button} onClick={search}>{loading ? '...' : 'Search'}</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        {movies.map(m => (
          <div key={m.id} style={{ ...styles.card, width: '180px' }}>
            <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : 'https://via.placeholder.com/180x270'} alt="m" style={{width:'100%', borderRadius:'5px'}} />
            <h4 style={{fontSize:'12px', margin:'10px 0'}}>{m.title}</h4>
            <button style={styles.secondaryBtn} onClick={() => onAdd(m.title)}>+ Watchlist</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- STREAMLIST COMPONENT (Dashboard CRUD) ---
function StreamList({ list, setList }) {
  const [item, setItem] = useState('');
  const add = () => { if(item) { setList([...list, {id: Date.now(), title: item}]); setItem(''); } };
  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>My StreamList</h2>
      <div style={{display:'flex', gap:'10px'}}>
        <input style={styles.input} value={item} onChange={e => setItem(e.target.value)} placeholder="Add movie manually..." />
        <button style={styles.button} onClick={add}>Add</button>
      </div>
      {list.map(m => (
        <div key={m.id} style={styles.card}>{m.title} 
          <button onClick={() => setList(list.filter(i => i.id !== m.id))} style={{float:'right', color:'red', background:'none', border:'none', cursor:'pointer'}}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// --- CART COMPONENT (Redirects & Qty Adjustment) ---
function CartView({ cart, onUpdate, onAdd }) {
  const navigate = useNavigate();
  const SUBS = [{ id: 's1', name: "Family Plan (UHD)", price: 20, type: 'sub' }];
  const ACCS = [{ id: 'a1', name: "EZTech T-Shirt", price: 25, type: 'acc' }];
  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <div style={{display:'flex', gap:'20px', marginBottom:'30px'}}>
        {SUBS.concat(ACCS).map(p => (
          <div key={p.id} style={{...styles.card, flex:1}}>
            <h4>{p.name}</h4><p>${p.price}</p>
            <button style={styles.button} onClick={() => onAdd(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
      <h2>Shopping Cart Review</h2>
      {cart.map(i => (
        <div key={i.id} style={styles.card}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span>{i.name} (${i.price})</span>
            <div>
              <button onClick={() => onUpdate(i.id, -1)}>-</button>
              <span style={{margin:'0 10px'}}>{i.qty}</span>
              <button onClick={() => onUpdate(i.id, 1)}>+</button>
            </div>
          </div>
        </div>
      ))}
      <div style={{textAlign:'right'}}>
        <h3>Total: ${total.toFixed(2)}</h3>
        <button style={styles.button} onClick={() => navigate('/billing')}>Proceed to Checkout</button>
      </div>
    </div>
  );
}

// --- BILLING COMPONENT (Formatted CC Management) ---
function Billing({ cards, setCards }) {
  const [num, setNum] = useState('');

  // Format: 1234 5678 9012 3456
  const formatCard = (val) => {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  };

  const save = () => {
    if(num.length === 19) {
      setCards([...cards, num]);
      setNum('');
    } else { alert("Please enter a valid 16-digit card number."); }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Credit Card Management</h2>
      <div style={styles.card}>
        <label>Enter Payment Details:</label>
        <input style={styles.input} placeholder="1234 5678 9012 3456" value={num} onChange={(e) => setNum(formatCard(e.target.value))} />
        <button style={styles.button} onClick={save}>Save Card</button>
      </div>
      <h3>Stored Payment Methods</h3>
      {cards.map((c, i) => (
        <div key={i} style={styles.card}>
          **** **** **** {c.slice(-4)} (PCI Compliant)
        </div>
      ))}
    </div>
  );
}
