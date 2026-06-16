// src/components/Navbar/Navbar.js
import React, { useState, useEffect } from 'react';
import './Navbar.css';

export function DiamondLogo({ size = 44 }) {
  return (
    <img 
      src="/logo.png" 
      alt="VVM Logo" 
      style={{ 
        width: size, 
        height: size, 
        borderRadius: '50%',
        backgroundColor: '#fff',
        padding: '2px',
        objectFit: 'contain',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
      }} 
    />
  );
}

/* ── Navbar ─────────────────────────────────────── */
function Navbar({ onNav, theme, toggleTheme, cartCount, onCartOpen }) {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActive]  = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const ids = ['home','about','products','testimonials','why','contact'];
      const cur = ids.find(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= 100 && r.bottom >= 100;
      });
      if (cur) setActive(cur);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { id:'about',    label:'About'    },
    { id:'products', label:'Products' },
    { id:'why',      label:'Why VVM'  },
    { id:'contact',  label:'Contact'  },
  ];

  const go = (id) => { onNav(id); setMobileOpen(false); };

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-logo" onClick={() => go('home')}>
          <DiamondLogo size={48} />
          <div>
            <span className="nav-brand-name">VVM TRADERS</span>
            <span className="nav-brand-tag">Spice Exporters · </span>
          </div>
        </div>

        <ul className="nav-links">
          {links.map(l => (
            <li key={l.id}>
              <a className={activeSection === l.id ? 'active' : ''} onClick={() => go(l.id)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-right">
          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme">
            <span className="t-icon" key={theme}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
          </button>

          {/* Cart icon */}
          <button className="nav-cart-btn" onClick={onCartOpen} aria-label="Open cart" title="Your Cart">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button className="nav-cta" onClick={() => go('contact')}>Get Quote</button>

          <button className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {links.map(l => <a key={l.id} onClick={() => go(l.id)}>{l.label}</a>)}
        <a onClick={onCartOpen}>🛒 Cart {cartCount > 0 && `(${cartCount})`}</a>
        <button className="mob-cta" onClick={() => go('contact')}>Get a Quote</button>
      </div>
    </>
  );
}

export default Navbar;
