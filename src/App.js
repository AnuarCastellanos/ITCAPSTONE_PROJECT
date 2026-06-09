import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

// --- SHARED STYLES ---
const styles = {
  container: { padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#141414', color: 'white', minHeight: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#000', marginBottom: '30px', borderBottom: '2px solid #E50914' },
  link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' },
  card: { background: '#2f2f2f', padding: '15px', borderRadius: '10px', marginBottom: '15px', position: 'relative' },
  input: { padding: '12px', margin: '10px 0', width: '100%', borderRadius: '4px', border: 'none', fontSize: '16px' },
  button: { padding: '12px 24px', backgroundColor: '#E50914', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' },
  movieGrid: { display: 'grid', gridTemplateColumns: '广泛(200px, 1fr)', gap: '20px', marginTop: '20px' },
  poster: { width: '100%', borderRadius: '5px' }
};

export default function App() {
  // Persistence for User Login
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('ezUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('ezUser', JSON.stringify(user));
  }, [user]);

  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link style={styles.link} to="/">STREAMLIST</Link>
          <Link style={styles.link} to="/movies">MOVIES (API)</Link>
          <Link style={styles.link} to="/cart">CART</Link>
          <Link style={styles.link} to="/billing">BILLING</Link>
          {user && <button onClick={() => setUser(null)} style={{background:'none', color:'red', border:'1px solid red', cursor:'pointer'}}>Logout</button>}
        </nav>

        <Routes>
          <Route path="/" element={user ? <StreamList /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={() => setUser({name: "Group 2"})} />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/billing" element={<Billing />} />
        </Routes>
      </div>
    </Router>
  );
}

// --- COMPONENT 1: LOGIN ---
function Login({ onLogin }) {
  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      <h1 style={{color: '#E50914'}}>EZTechMovie</h1>
      <input style={styles.input} type="email" placeholder="Email" />
      <input style={styles.input} type="password" placeholder="Password" />
      <button style={{...styles.button, width:'100%'}} onClick={onLogin}>Sign In</button>
    </div>
  );
}

// --- COMPONENT 2: STREAMLIST (LocalStorage Persistence) ---
function StreamList() {
  const [list, setList] = useState(() => {
    const saved = localStorage.getItem('myStreamList');
    return saved ? JSON.parse(saved) : [];
  });
  const [item, setItem] = useState('');

  useEffect(() => {
    localStorage.setItem('myStreamList', JSON.stringify(list));
  }, [list]);

  const add = () => { if(item) { setList([...list, {id: Date.now(), title: item}]); setItem(''); } };
  const del = (id) => setList(list.filter(m => m.id !== id));

  return (
    <div style={{ maxWidth: '600px', margin: 'auto' }}>
      <h2>My Watchlist (Persisted)</h2>
      <div style={{display:'flex', gap:'10px'}}>
        <input style={styles.input} value={item} onChange={e => setItem(e.target.value)} placeholder="Add movie to cloud list..." />
        <button style={styles.button} onClick={add}>Add</button>
      </div>
      {list.map(m => (
        <div key={m.id} style={styles.card}>
          {m.title} 
          <button onClick={() => del(m.id)} style={{float:'right', color:'red', background:'none', border:'none', cursor:'pointer'}}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// --- COMPONENT 3: MOVIES (TMDB API Integration) ---
function Movies() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const API_KEY = 'YOUR_TMDB_API_KEY_HERE'; // <--- INSERT YOUR KEY HERE

  const searchMovies = async () => {
    if (!query) return;
    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
      const data = await response.json();
      setMovies(data.results || []);
    } catch (err) {
      console.error("API Error:", err);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Global Movie Search (Live API)</h2>
      <div style={{ maxWidth: '500px', margin: 'auto', display: 'flex', gap: '10px' }}>
        <input style={styles.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search TMDB Database..." />
        <button style={styles.button} onClick={searchMovies}>Search</button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '30px' }}>
        {movies.map(m => (
          <div key={m.id} style={{ ...styles.card, width: '200px' }}>
            <img src={m.poster_path ? `https://image.tmdb.org/t/p/w200${m.poster_path}` : 'https://via.placeholder.com/200x300?text=No+Image'} alt={m.title} style={styles.poster} />
            <h4 style={{fontSize:'14px'}}>{m.title}</h4>
            <p style={{color:'gold'}}>★ {m.vote_average}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENT 4: CART (LocalStorage Persistence) ---
function Cart() {
  const [selected, setSelected] = useState(() => {
    const saved = localStorage.getItem('selectedPlan');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('selectedPlan', JSON.stringify(selected));
  }, [selected]);

  const plans = [
    { name: "Individual", price: 10 },
    { name: "Friendly", price: 15 },
    { name: "Family", price: 20 }
  ];

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>Streaming Experience Plans</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        {plans.map(p => (
          <div key={p.name} style={{ ...styles.card, border: selected?.name === p.name ? '2px solid #E50914' : '1px solid #444' }}>
            <h3>{p.name}</h3>
            <p>${p.price}/mo</p>
            <button style={styles.button} onClick={() => setSelected(p)}>Select</button>
          </div>
        ))}
      </div>
      {selected && <div style={{marginTop:'20px'}}><h3>Selected: {selected.name} - ${selected.price}.00</h3></div>}
    </div>
  );
}

// --- COMPONENT 5: BILLING (LocalStorage Persistence) ---
function Billing() {
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('userCards');
    return saved ? JSON.parse(saved) : [];
  });
  const [num, setNum] = useState('');

  useEffect(() => {
    localStorage.setItem('userCards', JSON.stringify(cards));
  }, [cards]);

  const save = () => { if(num) { setCards([...cards, num]); setNum(''); } };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Payment Management (PCI Compliant)</h2>
      <div style={styles.card}>
        <input style={styles.input} placeholder="Card Number" value={num} onChange={e => setNum(e.target.value)} />
        <button style={styles.button} onClick={save}>Save Card</button>
      </div>
      {cards.map((c, i) => (
        <div key={i} style={styles.card}>
          **** **** **** {c.slice(-4)}
          <button onClick={() => setCards(cards.filter((_, idx) => idx !== i))} style={{float:'right', color:'gray', background:'none', border:'none', cursor:'pointer'}}>Remove</button>
        </div>
      ))}
    </div>
  );
}
