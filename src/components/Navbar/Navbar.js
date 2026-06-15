// src/components/Navbar/Navbar.js
import React, { useState, useEffect } from 'react';
import './Navbar.css';

/* ── Diamond SVG Logo ───────────────────────────── */
export function DiamondLogo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5A050"/>
          <stop offset="50%" stopColor="#E8750A"/>
          <stop offset="100%" stopColor="#B85A00"/>
        </linearGradient>
        <filter id="dglow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <rect x="8" y="8" width="44" height="44" rx="6" fill="rgba(232,117,10,0.15)" transform="rotate(45 30 30)"/>
      <rect x="11" y="11" width="38" height="38" rx="5" fill="url(#dg1)" transform="rotate(45 30 30)" filter="url(#dglow)"/>
      <path d="M30 8 L52 30 L30 52 L8 30 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1"/>
      <ellipse cx="22" cy="20" rx="5" ry="3" fill="rgba(255,255,255,0.35)" transform="rotate(-45 22 20)"/>
      <text x="30" y="34" textAnchor="middle" fontSize="12" fontWeight="700"
        fontFamily="Cormorant Garamond, serif" fill="#FFF9F4" letterSpacing="0.5">VVM</text>
    </svg>
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
          <DiamondLogo size={44} />
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
