import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// --- STYLING (Modern Dark Theme) ---
const styles = {
  container: { padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#141414', color: 'white', minHeight: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '15px', background: '#000', marginBottom: '30px', borderBottom: '2px solid #E50914', position: 'sticky', top: 0, zIndex: 100 },
  link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' },
  badge: { backgroundColor: '#E50914', color: 'white', borderRadius: '50%', padding: '2px 8px', fontSize: '12px', marginLeft: '5px' },
  card: { background: '#2f2f2f', padding: '15px', borderRadius: '10px', marginBottom: '15px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  input: { padding: '12px', margin: '10px 0', width: '100%', borderRadius: '4px', border: 'none', fontSize: '16px', backgroundColor: '#333', color: 'white' },
  button: { padding: '12px 24px', backgroundColor: '#E50914', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold', transition: '0.3s' },
  secondaryBtn: { padding: '8px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' },
  oauthBtn: { padding: '10px', backgroundColor: 'white', color: '#757575', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', width: '100%' }
};

export default function App() {
  // --- PERSISTENCE LOGIC (Refactored for Consistency) ---
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ezUser')) || null);
  const [list, setList] = useState(() => JSON.parse(localStorage.getItem('myStreamList')) || []);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('ezCart')) || []);

  useEffect(() => { localStorage.setItem('ezUser', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('myStreamList', JSON.stringify(list)); }, [list]);
  useEffect(() => { localStorage.setItem('ezCart', JSON.stringify(cart)); }, [cart]);

  // --- CART ACTIONS ---
  const addToCart = (product) => {
    const isSub = product.type === 'sub';
    if (isSub && cart.some(i => i.type === 'sub')) {
      alert("AI NOTIFICATION: You may only possess one active subscription plan.");
      return;
    }
    const exists = cart.find(i => i.id === product.id);
    if (exists) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link style={styles.link} to="/">STREAMLIST</Link>
          <Link style={styles.link} to="/movies">MOVIES (API)</Link>
          <Link style={styles.link} to="/cart">CART <span style={styles.badge}>{cart.length}</span></Link>
          <Link style={styles.link} to="/billing">BILLING</Link>
          {user && <button onClick={() => setUser(null)} style={{background:'none', color:'red', border:'none', cursor:'pointer'}}>Logout</button>}
        </nav>

        <Routes>
          <Route path="/" element={user ? <StreamList list={list} setList={setList} /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={() => setUser({name: "Group 2"})} />} />
          <Route path="/movies" element={<Movies onAdd={(t) => setList([...list, {id: Date.now(), title: t}])} />} />
          <Route path="/cart" element={<CartView cart={cart} onUpdate={updateQty} onAdd={addToCart} />} />
          <Route path="/billing" element={<Billing />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- LOGIN (Incorporating OAuth Concept) ---
function Login({ onLogin }) {
  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center', background:'#222', padding:'40px', borderRadius:'10px' }}>
      <h1 style={{color: '#E50914'}}>EZTechMovie</h1>
      <input style={styles.input} type="email" placeholder="Email" />
      <input style={styles.input} type="password" placeholder="Password" />
      <button style={{...styles.button, width:'100%'}} onClick={onLogin}>Sign In</button>
      <p style={{margin:'20px 0', fontSize:'12px'}}>OR</p>
      {/* AI RECOMMENDATION: Added OAuth Placeholder for Week 4 Requirement */}
      <button style={styles.oauthBtn} onClick={onLogin}>
        <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" width="18" alt="G"/>
        Continue with Google (OAuth)
      </button>
    </div>
  );
}

// --- MOVIES (Refactored with AI for Loading/Error Handling) ---
function Movies({ onAdd }) {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const API_KEY = '3483f9cf45ef2f699a49557493dae62c';

  const searchMovies = async () => {
    if (!query) {
      setError("Please enter a keyword to search.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
      if (!res.ok) throw new Error("API Connection Failed");
      const data = await res.json();
      setMovies(data.results || []);
    } catch (err) {
      setError("AI detected an error fetching movie data. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Search Global Database</h2>
      <div style={{ maxWidth: '500px', margin: 'auto', display: 'flex', gap: '10px' }}>
        <input style={styles.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search..." />
        <button style={styles.button} onClick={searchMovies} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p style={{color: '#ffcc00', marginTop:'10px'}}>{error}</p>}

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        {loading ? <p>Loading data via TMDB API...</p> : movies.map(m => (
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

// --- STREAMLIST (Dashboard) ---
function StreamList({ list, setList }) {
  const [item, setItem] = useState('');
  const add = () => { if(item) { setList([...list, {id: Date.now(), title: item}]); setItem(''); } };
  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>My Watchlist</h2>
      <div style={{display:'flex', gap:'10px'}}>
        <input style={styles.input} value={item} onChange={e => setItem(e.target.value)} placeholder="Add manually..." />
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

// --- CART VIEW ---
function CartView({ cart, onUpdate, onAdd }) {
  const SUBS = [{ id: 's1', name: "Basic Plan", price: 10, type: 'sub' }, { id: 's2', name: "Premium Plan", price: 20, type: 'sub' }];
  const ACCS = [{ id: 'a1', name: "EZ Shirt", price: 25, type: 'acc' }];
  const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);

  return (
    <div style={{ maxWidth: '800px', margin: 'auto' }}>
      <div style={{display:'flex', gap:'20px', marginBottom:'40px'}}>
        {SUBS.concat(ACCS).map(p => (
          <div key={p.id} style={{...styles.card, flex:1}}>
            <h4>{p.name}</h4><p>${p.price}</p>
            <button style={styles.button} onClick={() => onAdd(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
      <h2>Shopping Cart</h2>
      {cart.map(i => (
        <div key={i.id} style={styles.card}>
          {i.name} - ${i.price} x {i.qty}
          <div>
            <button onClick={() => onUpdate(i.id, -1)}>-</button>
            <span style={{margin:'0 10px'}}>{i.qty}</span>
            <button onClick={() => onUpdate(i.id, 1)}>+</button>
          </div>
        </div>
      ))}
      <h3>Total: ${total.toFixed(2)}</h3>
    </div>
  );
}

// --- BILLING ---
function Billing() {
  const [cards, setCards] = useState(() => JSON.parse(localStorage.getItem('userCards')) || []);
  const [num, setNum] = useState('');
  useEffect(() => { localStorage.setItem('userCards', JSON.stringify(cards)); }, [cards]);
  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Billing</h2>
      <div style={styles.card}>
        <input style={styles.input} placeholder="Card Number" value={num} onChange={e => setNum(e.target.value)} />
        <button style={styles.button} onClick={() => { if(num) setCards([...cards, num]); setNum(''); }}>Save</button>
      </div>
      {cards.map((c, i) => <div key={i} style={styles.card}>**** **** **** {c.slice(-4)}</div>)}
    </div>
  );
}
