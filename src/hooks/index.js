// client/src/hooks/index.js
import { useState, useEffect, useRef } from 'react';

export function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export function useCounter(target, active, suffix = '') {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const increment = target / (1600 / 16);
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setVal(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [active, target]);
  return val + suffix;
}

export function useScrollSpy(ids = []) {
  const [active, setActive] = useState(ids[0] || '');
  useEffect(() => {
    const handler = () => {
      const found = ids.find(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      });
      if (found) setActive(found);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [ids]);
  return active;
}

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
