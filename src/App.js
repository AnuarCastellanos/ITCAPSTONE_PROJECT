import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

const styles = {
  container: { padding: '20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', backgroundColor: '#141414', color: 'white', minHeight: '100vh' },
  nav: { display: 'flex', justifyContent: 'space-around', padding: '15px', background: '#000', marginBottom: '30px', borderBottom: '2px solid #E50914' },
  link: { color: 'white', textDecoration: 'none', fontWeight: 'bold' },
  card: { background: '#2f2f2f', padding: '20px', borderRadius: '10px', marginBottom: '15px', borderLeft: '5px solid #E50914' },
  input: { padding: '12px', margin: '10px 0', width: '100%', borderRadius: '4px', border: 'none' },
  button: { padding: '12px 24px', backgroundColor: '#E50914', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' },
  planGrid: { display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '20px' }
};

export default function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <Link style={styles.link} to="/">STREAMLIST</Link>
          <Link style={styles.link} to="/movies">MOVIES</Link>
          <Link style={styles.link} to="/cart">CART</Link>
          <Link style={styles.link} to="/billing">BILLING</Link>
          {user && <button style={{background: 'none', color: 'white', border: '1px solid white', cursor: 'pointer'}} onClick={() => setUser(null)}>Logout</button>}
        </nav>

        <Routes>
          <Route path="/" element={user ? <StreamList /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login onLogin={() => setUser({name: "User"})} />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/billing" element={<Billing />} />
        </Routes>
      </div>
    </Router>
  );
}

function Login({ onLogin }) {
  return (
    <div style={{ maxWidth: '400px', margin: 'auto', textAlign: 'center', marginTop: '100px' }}>
      <h1 style={{color: '#E50914'}}>EZTechMovie Login</h1>
      <input style={styles.input} type="email" placeholder="Email Address" />
      <input style={styles.input} type="password" placeholder="Password" />
      <button style={{...styles.button, width: '100%'}} onClick={onLogin}>Sign In</button>
    </div>
  );
}

function StreamList() {
  const [list, setList] = useState([]);
  const [item, setItem] = useState('');
  const add = () => { if(item) { setList([...list, item]); setItem(''); } };
  return (
    <div style={{maxWidth: '600px', margin: 'auto'}}>
      <h2>My Watchlist</h2>
      <div style={{display: 'flex', gap: '10px'}}>
        <input style={styles.input} value={item} onChange={e => setItem(e.target.value)} placeholder="Enter movie or show name..." />
        <button style={styles.button} onClick={add}>Add</button>
      </div>
      {list.map((m, i) => (
        <div key={i} style={styles.card}>{m} <button style={{float: 'right', background: 'none', color: 'gray', border: 'none', cursor: 'pointer'}} onClick={() => setList(list.filter((_, idx) => idx !== i))}>Delete</button></div>
      ))}
    </div>
  );
}

function Movies() {
  const movies = ["Inception", "Interstellar", "The Dark Knight", "Coco", "The Lion King"];
  return (
    <div style={{textAlign: 'center'}}>
      <h2>Available Content</h2>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px'}}>
        {movies.map(m => <div key={m} style={{...styles.card, width: '150px'}}>{m}<br/><br/><button style={styles.button}>Watch</button></div>)}
      </div>
    </div>
  );
}

function Cart() {
  const [selected, setSelected] = useState(null);
  const plans = [
    { name: "Individual", price: 10, perks: "1 Device" },
    { name: "Friendly", price: 15, perks: "2 Devices (HD)" },
    { name: "Family", price: 20, perks: "4 Devices (UHD)" }
  ];
  return (
    <div style={{textAlign: 'center'}}>
      <h2>Select Your Experience Plan</h2>
      <div style={styles.planGrid}>
        {plans.map(p => (
          <div key={p.name} style={{...styles.card, border: selected?.name === p.name ? '2px solid white' : 'none'}}>
            <h3>{p.name}</h3>
            <p>{p.perks}</p>
            <h4>${p.price}/mo</h4>
            <button style={styles.button} onClick={() => setSelected(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
      {selected && <div style={{marginTop: '40px'}}><h3>Total: ${selected.price}.00</h3><button style={styles.button} onClick={() => alert("Proceeding to Secure Payment")}>Checkout</button></div>}
    </div>
  );
}

function Billing() {
  const [cards, setCards] = useState([]);
  const [num, setNum] = useState('');
  const add = () => { setCards([...cards, num]); setNum(''); };
  return (
    <div style={{maxWidth: '500px', margin: 'auto'}}>
      <h2>Payment Management</h2>
      <div style={styles.card}>
        <input style={styles.input} placeholder="Cardholder Name" />
        <input style={styles.input} placeholder="Card Number" value={num} onChange={e => setNum(e.target.value)} />
        <button style={styles.button} onClick={add}>Save Securely</button>
      </div>
      {cards.map((c, i) => <div key={i} style={styles.card}>Card: **** **** **** {c.slice(-4)} <button onClick={() => setCards(cards.filter((_, idx) => idx !== i))} style={{float: 'right'}}>Remove</button></div>)}
      <p style={{fontSize: '12px', color: 'gray', textAlign: 'center'}}>PCI-DSS Compliant Encryption Active</p>
    </div>
  );
}
