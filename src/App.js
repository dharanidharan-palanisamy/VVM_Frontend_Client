// src/App.js – VVM Traders | Cart + Price + Dark/Light Theme
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './styles/global.css';
import './styles/sections.css';
import './components/Hero/Hero.css';
import './components/Products/Products.css';
import './components/Navbar/Navbar.css';
import { fetchProducts, submitEnquiry } from './services/api';
import Navbar, { DiamondLogo } from './components/Navbar/Navbar';

/* ── Animate on scroll ─────────────────────────── */
function AnimOnScroll({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ transitionDelay:`${delay}s` }}
      className={`anim-hidden ${vis ? 'anim-visible' : ''}`}>
      {children}
    </div>
  );
}

/* ── Counter ───────────────────────────────────── */
function Counter({ target, suffix = '', active }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let c = 0;
    const inc = target / (1600 / 16);
    const t = setInterval(() => {
      c = Math.min(c + inc, target);
      setVal(Math.floor(c));
      if (c >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [active, target]);
  return <>{val}{suffix}</>;
}

/* ════════════════════════════════════════════════
   CART DRAWER
════════════════════════════════════════════════ */
function CartDrawer({ cart, onClose, onUpdateQty, onRemove, onClear, onCheckout }) {
  const total = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const totalItems = cart.length;

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        {/* Header */}
        <div className="cart-head">
          <div style={{ display:'flex', alignItems:'center' }}>
            <h2>Your Cart</h2>
            {totalItems > 0 && <span className="cart-head-count">{totalItems}</span>}
          </div>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {/* Items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Your cart is empty.<br />Add some spices to get started!</p>
              <button className="cart-empty-btn" onClick={onClose}>Browse Products</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-emoji">{item.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-cat">{item.catLabel}</div>
                  <div className="cart-item-price">
                    ₹ {(Number(item.price) * item.qty).toLocaleString('en-IN')}
                    <span style={{ fontSize:11, color:'var(--text-sub)', marginLeft:6 }}>
                      (₹ {Number(item.price).toLocaleString('en-IN')} / {item.unit})
                    </span>
                  </div>
                  <div className="cart-item-controls">
                    <button onClick={() => onUpdateQty(item.id, item.qty - 1)}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => onRemove(item.id)}
                  title="Remove">🗑</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-foot">
            <div className="cart-subtotal">
              <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
              <strong>₹ {total.toLocaleString('en-IN')}</strong>
            </div>
            <div className="cart-sub-note">Shipping & taxes calculated at checkout</div>
            <button className="cart-checkout-btn" onClick={onCheckout}>
              Proceed to Enquiry →
            </button>
            <button className="cart-clear-btn" onClick={onClear}>Clear Cart</button>
          </div>
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   CART PAGE
════════════════════════════════════════════════ */
function CartPage({ cart, onUpdateQty, onRemove, onClear, onBack }) {
  const [showForm, setShowForm] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', address: '', requirements: ''
  });

  const total  = cart.reduce((s, i) => s + Number(i.price) * i.qty, 0);
  const totalItems = cart.length;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    // product is derived from cart; no product selector required here
    if (!form.address.trim()) e.address = 'Address is required';
    if (!form.requirements.trim()) e.requirements = 'Please describe your requirements';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await submitEnquiry({
        ...form,
        items: cart.map(item => ({
          name: item.name,
          qty: item.qty,
          unit: item.unit,
          price: item.price
        })),
        total: total.toLocaleString('en-IN')
      });
      setSent(true);
    } catch {
      alert('Submission failed. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const startEnquiry = () => {
    setErrors({});
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
    setShowForm(true);
  };

  const closeEnquiry = () => {
    setShowForm(false);
    try { document.body.style.overflow = ''; } catch (e) {}
    setErrors({});
    setLoading(false);
    setSent(false);
  };

  if (sent) {
    return (
      <div className="cart-page">
        <div className="checkout-success">
          <div className="cs-icon">✅</div>
          <h3>Enquiry Sent!</h3>
          <p>
            Thank you for your order enquiry. Our team will review your cart
            and get back to you within 24 business hours with pricing and
            delivery details.
          </p>
          <button onClick={() => { onClear(); onBack(); }}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page" id="cart-page">
      <div className="section-label">Shopping</div>
      <h1 className="cart-page-title">Your <em>Cart</em></h1>

      {cart.length === 0 ? (
        <div className="cart-page-empty">
          <div className="cpe-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse our premium spice catalogue and add products to your cart.</p>
          <button className="csb-checkout" style={{ maxWidth:240, margin:'0 auto', display:'block' }} onClick={onBack}>
            Browse Products
          </button>
        </div>
      ) : (
        <>
          <p className="cart-page-sub">{totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart</p>
          <div className="cart-page-grid">
            {/* Items list */}
            <div className="cart-page-items">
              {cart.map(item => (
                <div key={item.id} className="cart-page-item">
                  <div className="cpi-emoji">{item.emoji}</div>
                  <div className="cpi-info">
                    <div className="cpi-name">{item.name}</div>
                    <div className="cpi-cat">{item.catLabel}</div>
                    <div className="cpi-unit">₹ {Number(item.price).toLocaleString('en-IN')} per {item.unit}</div>
                    <div className="cpi-controls" style={{ marginTop:10 }}>
                      <button onClick={() => onUpdateQty(item.id, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => onUpdateQty(item.id, item.qty + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cpi-price">
                    ₹ {(Number(item.price) * item.qty).toLocaleString('en-IN')}
                  </div>
                  <button className="cpi-remove" onClick={() => onRemove(item.id)} title="Remove">🗑</button>
                </div>
              ))}
              <div style={{ padding:'16px 0' }}>
                <button className="cart-clear-btn" onClick={onClear}
                  style={{ maxWidth:200 }}>
                  Clear All Items
                </button>
              </div>
            </div>

            {/* Summary box */}
            <div className="cart-summary-box">
              <div className="csb-title">Order Summary</div>
              {cart.map(item => (
                <div key={item.id} className="csb-row">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹ {(Number(item.price) * item.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="csb-total">
                <span>Total</span>
                <strong>₹ {total.toLocaleString('en-IN')}</strong>
              </div>
              <button className="csb-checkout" onClick={startEnquiry}>
                Send Enquiry →
              </button>
              <button className="csb-continue" onClick={onBack}>
                ← Continue Shopping
              </button>
              <p className="csb-note">
                Prices are indicative. Final price confirmed after enquiry review.
                All orders subject to availability.
              </p>
            </div>
          </div>

          {showForm && (
            <>
              <div className="enquiry-modal-overlay" onClick={closeEnquiry} />
              <div className="enquiry-modal" role="dialog" aria-modal="true">
                <button className="enquiry-close" onClick={closeEnquiry} aria-label="Close">✕</button>
                <div className="cart-enquiry-header">
                  <h2>Send Your Enquiry</h2>
                  <p>Please confirm your details below — we'll review the items in your cart and reply with a quote.</p>
                </div>

                <div className="enquiry-products">
                  {cart.map(it => (
                    <div key={it.id} className="enquiry-product-row">
                      <div className="ep-left">
                        <div className="ep-emoji">{it.emoji}</div>
                        <div>
                          <div className="ep-name">{it.name}</div>
                          <div className="ep-meta">{it.qty} × {it.unit}</div>
                        </div>
                      </div>
                      <div className="ep-price">₹ {(Number(it.price) * it.qty).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

                <div className="cart-form-grid">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Your Name *</label>
                      <input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                      {errors.name && <div className="form-error">{errors.name}</div>}
                    </div>
                    <div className="form-group">
                      <label>Company</label>
                      <input placeholder="Company Name" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email *</label>
                      <input type="email" placeholder="email@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                      {errors.email && <div className="form-error">{errors.email}</div>}
                    </div>
                    <div className="form-group">
                      <label>Phone *</label>
                      <input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      {errors.phone && <div className="form-error">{errors.phone}</div>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Address *</label>
                    <textarea placeholder="Company / delivery address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                    {errors.address && <div className="form-error">{errors.address}</div>}
                  </div>
                  <div className="form-group">
                    <label>Requirements *</label>
                    <textarea placeholder="Describe quantities, packaging, grade, delivery location, and any special requirements." value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} />
                    {errors.requirements && <div className="form-error">{errors.requirements}</div>}
                  </div>
                  <div className="cart-form-actions">
                    <button className="form-submit" onClick={handleSubmit} disabled={loading}>
                      {loading ? 'Sending…' : 'Submit Enquiry →'}
                    </button>
                    <button className="csb-continue" type="button" onClick={closeEnquiry}>
                      ← Back to Cart
                    </button>
                  </div>
                </div>

                {sent && (
                  <div className="form-success" style={{ marginTop:18 }}>
                    <div className="success-icon">✅</div>
                    <h4>Enquiry Received!</h4>
                    <p>Our team will contact you within 24 business hours. Thank you.</p>
                    <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:12 }}>
                      <button className="form-submit" onClick={() => { closeEnquiry(); onClear(); onBack(); }}>Continue Shopping</button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════ */
function Hero({ onNav }) {
  const statsRef = useRef(null);
  const [statsActive, setStatsActive] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsActive(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const tiles = [
    { emoji:'🌶️', label:'Chilli',      bg:'#1A1A1A' },
    { emoji:'☕',  label:'Masala Tea',  bg:'#141414' },
    { emoji:'🟡',  label:'Turmeric',   bg:'#1E1A00' },
    { emoji:'🌿',  label:'Fenugreek',  bg:'#0A140A' },
    { emoji:'⭐',  label:'Star Anise', bg:'#0A0A18' },
    { emoji:'💚',  label:'Cardamom',   bg:'#081408' },
    { emoji:'⚫',  label:'Pepper',     bg:'#111111' },
    { emoji:'🫘',  label:'Nutmeg',     bg:'#161208' },
    { emoji:'🍃',  label:'Bay Leaf',   bg:'#081210' },
  ];

  return (
    <section className="hero" id="home">
      <div className="hero-bg-pattern" />
      <div className="hero-content">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          <span>Pan-India Spice Exporter</span>
        </div>
        <h1>India's Finest<br /><em>Spices &amp;</em><strong>Masalas</strong></h1>
        <p className="hero-sub">
          VVM Traders sources and exports 25+ premium spices, herbs, and masala blends
          across every state in India — authentic flavour in every shipment, guaranteed.
        </p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={() => onNav('products')}>Explore Products</button>
          <button className="btn-outline" onClick={() => onNav('contact')}>Request a Quote</button>
        </div>
        <div className="hero-stats" ref={statsRef}>
          {[{n:25,s:'+',l:'Spice Varieties'},{n:28,s:'',l:'States Covered'},{n:100,s:'%',l:'Quality Assured'}].map((s,i) => (
            <div key={i}>
              <div className="stat-num"><Counter target={s.n} suffix={s.s} active={statsActive} /></div>
              <div className="stat-label">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-visual">
        <div className="spice-grid">
          {tiles.map((t, i) => (
            <div key={i} className="spice-tile" style={{ background: t.bg }}>
              <span className="icon">{t.emoji}</span>
              <span className="lbl">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   MARQUEE
════════════════════════════════════════════════ */
const MARQUEE_ITEMS = ['Chilli Powder','Masala Tea','Cardamom','Turmeric','Star Anise','Pepper Bold','Fenugreek','Jeera','Nutmeg','Bay Leaf','Ceylon Cinnamon','Ginger','Mace Flower','Black Cumin','Coriander Powder','Mustard'];

function Marquee() {
  const all = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-bar">
      <div className="marquee-track">
        {all.map((item, i) => (
          <span key={i} className="marquee-item"><span className="marquee-sep" />{item}</span>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   ABOUT
════════════════════════════════════════════════ */
function About() {
  const features = [
    { icon:'🌾', title:'Farm Direct',        desc:'Sourced directly from verified farmers for maximum freshness and traceability.' },
    { icon:'✅', title:'Quality Tested',      desc:'Every batch tested for purity, aroma, moisture, and grade compliance.' },
    { icon:'📦', title:'Custom Packaging',    desc:'Flexible pack sizes and private label options tailored to your brand.' },
    { icon:'🚚', title:'Nationwide Delivery', desc:'Reliable logistics covering all 28 states and union territories.' },
  ];
  return (
    <section className="about" id="about">
      <div className="about-grid">
        <AnimOnScroll>
          <div className="section-label">About VVM Traders</div>
          <h2 className="section-title">Rooted in Tradition,<br /><em>Built for Trade</em></h2>
          <p className="section-body">VVM Traders is a trusted name in India's spice export business — operating pan-India with a commitment to quality, authenticity, and timely delivery. We work directly with farmers and processing units to bring you the finest spices from across the country.</p>
          <div className="about-features">
            {features.map((f, i) => (
              <div key={i} className="feature-item">
                <div className="feature-icon">{f.icon}</div>
                <div><h4>{f.title}</h4><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </AnimOnScroll>
        <AnimOnScroll delay={0.15}>
          <div style={{ position:'relative', height:480 }}>
            <div className="about-card-main">
              <img
                  src="https://images.unsplash.com/photo-1716816211590-c15a328a5ff0?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpY2VzfGVufDB8fDB8fHww"
                  alt="Spices"
              />
              <p className="about-card-quote">"Where tradition meets<br />the taste of quality."</p>
            </div>
            <div className="about-card-accent">
              <div style={{ position:'absolute', top:12, right:12, opacity:0.2 }}><DiamondLogo size={34} /></div>
              <div className="about-card-accent-num">25+</div>
              <div className="about-card-accent-txt">Premium Spice Varieties</div>
            </div>
          </div>
        </AnimOnScroll>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   PRODUCT MODAL
════════════════════════════════════════════════ */
function ProductModal({ product, onClose, onAddToCart, onEnquire, isInCart }) {
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(isInCart);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  const handleAdd = () => {
    onAddToCart(product, qty);
    setAdded(true);
  };

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose}>✕</button>
          <span className="modal-emoji">{product.emoji}</span>
          <div className="modal-cat">{product.catLabel}</div>
          <div className="modal-name">{product.name}</div>
        </div>
        <div className="modal-body">
          <p className="modal-desc">{product.desc}</p>
          <div className="modal-tags">
            {product.tags.map((t, i) => <span key={i} className="modal-tag">{t}</span>)}
          </div>
          <div className="modal-attrs">
            {[['Origin',product.origin],['Grade',product.grade],['Pack Size',product.packSize],['Availability',product.availability]].map(([k,v]) => (
              <div key={k} className="modal-attr">
                <div className="modal-attr-label">{k}</div>
                <div className="modal-attr-val">{v}</div>
              </div>
            ))}
          </div>
          {/* Price + Qty row */}
          <div className="modal-price-row">
            <div>
              <div className="modal-price-big">₹ {Number(product.price).toLocaleString('en-IN')}</div>
              <div className="modal-price-per">per {product.unit} · {product.stock}</div>
            </div>
            <div className="modal-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
          </div>
          <button className={`modal-cart-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
            {added ? '✅ Added to Cart' : '🛒 Add to Cart'}
          </button>
          <span className="modal-enquire-link"
            onClick={() => { onEnquire(product.name); onClose(); }}>
            Or send a bulk enquiry →
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   PRODUCTS SECTION
════════════════════════════════════════════════ */
function Products({ onEnquire, cart, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [filter,   setFilter]   = useState('all');
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(null);
  const [flashId,  setFlashId]  = useState(null);

  useEffect(() => {
    fetchProducts()
      .then(r => { setProducts(r.data); setLoading(false); })
      .catch(() => { setError('Could not load products. Is the backend running on port 5000?'); setLoading(false); });
  }, []);

  const cats = [
    { key:'all',    label:'All'          },
    { key:'powder', label:'Powders'      },
    { key:'whole',  label:'Whole Spices' },
    { key:'seed',   label:'Seeds'        },
    { key:'blend',  label:'Blends & Tea' },
  ];

  const filtered = products.filter(p => {
    const mCat    = filter === 'all' || p.cat === filter;
    const q       = search.toLowerCase();
    const mSearch = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    return mCat && mSearch;
  });

  const handleAddToCart = (product, qty = 1) => {
    onAddToCart(product, qty);
    setFlashId(product.id);
    setTimeout(() => setFlashId(null), 1800);
  };

  const isInCart = (id) => cart.some(c => c.id === id);

  return (
    <section className="products" id="products">
      <div className="products-header">
        <AnimOnScroll>
          <div className="section-label">Our Product Range</div>
          <h2 className="section-title" style={{ marginBottom:0 }}>Spices &amp; <em>Masalas</em></h2>
        </AnimOnScroll>
        <div className="products-controls">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" />
          </div>
          <div className="filter-bar">
            {cats.map(c => (
              <button key={c.key} className={`filter-btn ${filter === c.key ? 'active' : ''}`} onClick={() => setFilter(c.key)}>{c.label}</button>
            ))}
          </div>
        </div>
      </div>

      {loading && <div className="loading-wrap"><div className="spinner" /></div>}
      {error   && <div style={{ textAlign:'center', padding:'40px', color:'var(--chilli-light)' }}>{error}</div>}

      {!loading && !error && (
        <div className="products-grid">
          {filtered.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              No products found. Try a different search or filter.
            </div>
          )}
          {filtered.map((p, i) => {
            const inCart  = isInCart(p.id);
            const flashed = flashId === p.id;
            return (
              <AnimOnScroll key={p.id} delay={(i % 4) * 0.07}>
                <div className="product-card" onClick={() => setModal(p)}>
                  <span className="p-emoji">{p.emoji}</span>
                  <div className="p-cat">{p.catLabel}</div>
                  <div className="p-name">{p.name}</div>
                  <div className="p-desc">{p.desc.substring(0, 95)}…</div>
                  <div className="p-tags">
                    {p.tags.map((t, j) => <span key={j} className="p-tag">{t}</span>)}
                  </div>
                  {/* Price + Add to Cart — always visible */}
                  <div className="p-bottom">
                    <div className="p-price">
                      <span className="p-price-label">Price</span>
                      <span className="p-price-value">
                        ₹ {Number(p.price).toLocaleString('en-IN')}
                        <span className="p-price-unit">/ {p.unit}</span>
                      </span>
                    </div>
                    <button
                      className={`p-add-btn ${(inCart || flashed) ? 'added' : ''}`}
                      onClick={e => { e.stopPropagation(); handleAddToCart(p, 1); }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        {(inCart || flashed)
                          ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                          : <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>
                        }
                      </svg>
                      {(inCart || flashed) ? 'Added' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </AnimOnScroll>
            );
          })}
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal}
          isInCart={isInCart(modal.id)}
          onClose={() => setModal(null)}
          onAddToCart={handleAddToCart}
          onEnquire={onEnquire}
        />
      )}
    </section>
  );
}

/* ════════════════════════════════════════════════
   STATS BAND
════════════════════════════════════════════════ */
function StatsBand() {
  const ref = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActive(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="stats-band" ref={ref}>
      <div className="stats-inner">
        {[{n:25,s:'+',l:'Spice Varieties'},{n:28,s:'',l:'States Covered'},{n:500,s:'+',l:'Happy Clients'},{n:100,s:'%',l:'Quality Assured'}].map((s,i) => (
          <div key={i} className="stat-item">
            <span className="big-num"><Counter target={s.n} suffix={s.s} active={active} /></span>
            <span className="big-label">{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════════════ */
function Testimonials() {
  const items = [
    { init:'RK', name:'Rajesh Kumar',  role:'MD, Spice World Pvt. Ltd., Chennai',        quote:'VVM Traders has been our go-to supplier for cardamom and pepper for three years. Exceptional quality, consistent grading, and they never miss a delivery window.' },
    { init:'PS', name:'Priya Sharma',  role:'Procurement Head, Heritage Hotels, Jaipur', quote:'Their Masala Tea blend is outstanding — our hotel guests love it. Private labelling was seamless, and the team was incredibly responsive throughout.' },
    { init:'AM', name:'Arun Menon',    role:'Director, Global Agri Exports, Kochi',       quote:'We source turmeric, chilli powder, and jeera in bulk from VVM. The FSSAI certification and custom packaging made compliance effortless for our export business.' },
  ];
  return (
    <section className="testimonials" id="testimonials">
      <AnimOnScroll>
        <div className="section-label">What Clients Say</div>
        <h2 className="section-title">Trusted by <em>Businesses</em> Across India</h2>
      </AnimOnScroll>
      <div className="testi-grid">
        {items.map((t, i) => (
          <AnimOnScroll key={i} delay={i * 0.1}>
            <div className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-quote">
                <span className="testi-quote-mark">"</span>
                <p>{t.quote}</p>
              </div>
              <div className="testi-author">
                <div className="testi-avatar">{t.init}</div>
                <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
              </div>
            </div>
          </AnimOnScroll>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   WHY US
════════════════════════════════════════════════ */
function WhyUs() {
  const items = [
    { icon:'🌾', num:'01', title:'Source Integrity', body:'Transparent supply chains with direct farmer partnerships across Kerala, Rajasthan, Gujarat, and major spice belts.' },
    { icon:'🏅', num:'02', title:'Grade-Certified',  body:'All products meet FSSAI standards. Organic-certified and export-grade variants available with full documentation.' },
    { icon:'🎛️', num:'03', title:'Custom Orders',    body:'Bulk orders, bespoke masala blends.' },
    { icon:'🗺️', num:'04', title:'Pan-India Reach',  body:'From Kashmir to Kanyakumari, our distribution network ensures reliable, timely delivery across the country.' },
  ];
  return (
    <section className="why" id="why">
      <AnimOnScroll>
        <div className="section-label dark">Why Choose VVM</div>
        <h2 className="section-title" style={{ color:'var(--text-white)' }}>The VVM <em style={{ color:'var(--saffron-light)' }}>Difference</em></h2>
        <p className="section-body" style={{ color:'rgba(255,255,255,.45)', maxWidth:540 }}>Every spice we supply carries the promise of authenticity, freshness, and consistent quality — backed by stringent testing and a nationwide network.</p>
      </AnimOnScroll>
      <div className="why-grid">
        {items.map((it, i) => (
          <div key={i} className="why-item">
            <span className="why-icon">{it.icon}</span>
            <div className="why-num">{it.num}</div>
            <h3>{it.title}</h3>
            <p>{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   PROCESS
════════════════════════════════════════════════ */
function Process() {
  const steps = [
    { icon:'🌾', n:'01', title:'Sourcing',      body:'Direct procurement from certified farms and cooperatives.' },
    { icon:'🔬', n:'02', title:'Quality Check', body:'Lab testing for purity, moisture, and grade compliance.'   },
    { icon:'⚙️', n:'03', title:'Processing',    body:'Cleaning, grading, and processing in certified facilities.' },
    { icon:'📦', n:'04', title:'Packaging',     body:'Custom bulk, retail, or private label packaging.'           },
    { icon:'🚚', n:'05', title:'Delivery',      body:'Fast, tracked dispatch across all Indian states.'           },
  ];
  return (
    <section className="process" id="process">
      <AnimOnScroll>
        <div className="section-label">How We Work</div>
        <h2 className="section-title">From Farm to <em>Your Door</em></h2>
      </AnimOnScroll>
      <div className="process-steps">
        <div className="process-line" />
        {steps.map((s, i) => (
          <div key={i} className="process-step">
            <div className="step-circle"><span className="step-n">{s.n}</span>{s.icon}</div>
            <h4>{s.title}</h4><p>{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   CONTACT
════════════════════════════════════════════════ */
const PRODUCT_NAMES = ['Chilli Powder','Masala Tea Blend','Tea Granules','Omam (Ajwain)','Black Cardamom','Mustard (Black)','Yellow Mustard','Fenugreek (Methi)','Black Cumin (Shahi Jeera)','Ceylon Cinnamon','White Til (Sesame)','Black Til (Sesame)','Cardamom (Green)','Pepper Bold','Nutmeg','Cinnamon Roll','Star Anise','Jeera (Cumin Seeds)','White Pepper','Turmeric Powder','Bay Leaf (Tej Patta)','Ginger (Dried Whole)','Mace Flower (Javitri)','Coriander Powder','Multiple Products / Custom Blend'];

function Contact({ defaultProduct }) {
  const [form, setForm]       = useState({ name:'', company:'', email:'', phone:'', product:'', message:'' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => { if (defaultProduct) setForm(f => ({ ...f, product: defaultProduct })); }, [defaultProduct]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Valid email is required';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try { await submitEnquiry(form); setSuccess(true); }
    catch { alert('Submission failed. Please check if the backend server is running on port 5000.'); }
    finally { setLoading(false); }
  };

  const details = [
    { icon:'📍', label:'Location',         val:'India — Pan-India Operations' },
    { icon:'📧', label:'Email',            val:'info@vvmtraders.in'           },
    { icon:'📞', label:'Phone / WhatsApp', val:'+91 00000 00000'              },
    { icon:'🕐', label:'Business Hours',   val:'Mon – Sat: 9 AM – 6 PM IST'  },
  ];

  return (
    <section className="contact" id="contact">
      <div className="section-label dark">Get In Touch</div>
      <h2 className="section-title" style={{ color:'var(--text-white)' }}>
        Request a <em style={{ color:'var(--saffron-light)' }}>Quote</em>
      </h2>
      <div className="contact-grid">
        <AnimOnScroll>
          <p className="contact-info-text">Whether you need bulk spice supply, custom masala blends, or private label products — our team responds within one business day with the best pricing and full quality assurance.</p>
          <div className="contact-details">
            {details.map((d, i) => (
              <div key={i} className="c-detail">
                <div className="c-detail-icon">{d.icon}</div>
                <div className="c-detail-text"><h5>{d.label}</h5><p>{d.val}</p></div>
              </div>
            ))}
          </div>
        </AnimOnScroll>
        <AnimOnScroll delay={0.15}>
          <div className="contact-form-wrap">
            {success ? (
              <div className="form-success">
                <div className="success-icon">✅</div>
                <h4>Enquiry Received!</h4>
                <p>Our team will get back to you within 24 business hours.</p>
              </div>
            ) : (
              <>
                <div className="form-row">
                  <div className="form-group"><label>Your Name *</label><input placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />{errors.name && <div className="form-error">{errors.name}</div>}</div>
                  <div className="form-group"><label>Company</label><input placeholder="Company Name" value={form.company} onChange={e => setForm(f => ({ ...f, company:e.target.value }))} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Email *</label><input type="email" placeholder="email@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email:e.target.value }))} />{errors.email && <div className="form-error">{errors.email}</div>}</div>
                  <div className="form-group"><label>Phone</label><input type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} /></div>
                </div>
                <div className="form-group">
                  <label>Product of Interest</label>
                  <select value={form.product} onChange={e => setForm(f => ({ ...f, product:e.target.value }))}>
                    <option value="">Select a product…</option>
                    {PRODUCT_NAMES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Message / Requirements</label>
                  <textarea placeholder="Quantity, preferred packaging, delivery location, grade requirements…" value={form.message} onChange={e => setForm(f => ({ ...f, message:e.target.value }))} />
                </div>
                <button className="form-submit" onClick={handleSubmit} disabled={loading}>{loading ? 'Sending…' : 'Send Enquiry →'}</button>
              </>
            )}
          </div>
        </AnimOnScroll>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════════════
   FOOTER
════════════════════════════════════════════════ */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
            <DiamondLogo size={40} />
            <h3 style={{ marginBottom:0 }}>VVM Traders</h3>
          </div>
          <p>India's trusted exporter of premium spices, masalas, seeds, and herbal products. Quality at every step, from farm to your door.</p>
          <div className="footer-social">{['📱','📧','💼','📸'].map((ic,i) => <div key={i} className="social-btn">{ic}</div>)}</div>
        </div>
        {[
          { h:'Products', items:['Chilli Powder','Cardamom','Turmeric','Pepper Bold','Masala Tea','Star Anise'] },
          { h:'Company',  items:['About Us','Why VVM','Our Process','Contact Us'] },
          { h:'Compliance', items:['FSSAI Certified','Quality Policy','Export Documents','Privacy Policy'] },
        ].map((col,i) => (
          <div key={i} className="footer-col">
            <h5>{col.h}</h5>
            <ul>{col.items.map((it,j) => <li key={j}>{it}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p>© 2025 VVM Traders. All rights reserved. Spice Exporters.</p>
        <div className="footer-certs">{['FSSAI','ISO Ready','Export Grade'].map((c,i) => <div key={i} className="cert-badge">{c}</div>)}</div>
      </div>
    </footer>
  );
}

/* ════════════════════════════════════════════════
   FLOATERS
════════════════════════════════════════════════ */
function Floaters() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', h, { passive:true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return (
    <>
      <a href="https://wa.me/910000000000?text=Hi%20VVM%20Traders" target="_blank" rel="noreferrer" className="whatsapp-fab">💬</a>
      {show && <button className="back-top" onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}>↑</button>}
    </>
  );
}

/* ════════════════════════════════════════════════
   ROOT APP  –  cart state + theme state
════════════════════════════════════════════════ */
function App() {
  /* Theme */
  const [theme, setTheme] = useState(() => localStorage.getItem('vvm_theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vvm_theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  /* Cart state */
  const [cart,       setCart]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('vvm_cart') || '[]'); } catch { return []; }
  });
  const [cartOpen,   setCartOpen]   = useState(false);
  const [showCart,   setShowCart]   = useState(false); // full cart page

  /* Persist cart */
  useEffect(() => {
    localStorage.setItem('vvm_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      }
      return [...prev, { ...product, qty }];
    });
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) { setCart(prev => prev.filter(i => i.id !== id)); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }, []);

  const removeItem = useCallback((id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.length;

  /* Nav */
  const [defaultProduct, setDefaultProduct] = useState('');
  const navTo = useCallback((id) => {
    setShowCart(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior:'smooth' });
    }, 50);
  }, []);
  const handleEnquire = useCallback((productName) => {
    setDefaultProduct(productName);
    setShowCart(false);
    setTimeout(() => navTo('contact'), 100);
  }, [navTo]);

  const handleCartOpen = useCallback(() => {
    setCartOpen(false);
    setShowCart(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  }, []);

  const handleCheckout = useCallback(() => {
    setCartOpen(false);
    setShowCart(true);
    window.scrollTo({ top:0, behavior:'smooth' });
  }, []);

  return (
    <div>
      <Navbar
        onNav={navTo}
        theme={theme}
        toggleTheme={toggleTheme}
        cartCount={cartCount}
        onCartOpen={handleCartOpen}
      />

      {/* Cart Drawer */}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClear={clearCart}
          onCheckout={handleCheckout}
        />
      )}

      {/* Cart Page OR main website */}
      {showCart ? (
        <CartPage
          cart={cart}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onClear={clearCart}
          onBack={() => { setShowCart(false); setTimeout(() => navTo('products'), 50); }}
        />
      ) : (
        <>
          <Hero onNav={navTo} />
          <Marquee />
          <About />
          <Products onEnquire={handleEnquire} cart={cart} onAddToCart={addToCart} />
          <StatsBand />
          <Testimonials />
          <WhyUs />
          <Process />
          <Contact defaultProduct={defaultProduct} />
          <Footer />
        </>
      )}

      <Floaters />
    </div>
  );
}

export default App;

