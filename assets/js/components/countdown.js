import { el } from '../core/utils.js';

/**
 * Render a live countdown into a container.
 * @param {HTMLElement} container
 * @param {number} endTime - epoch ms
 * @param {{days:string,hours:string,mins:string,secs:string}} labels
 */
export function startCountdown(container, endTime, labels = {}) {
  if (!container) return () => {};
  const box = (label) => el('div', { className: 'cd-box' }, [el('b', { text: '00' }), el('span', { text: label })]);
  container.innerHTML = '';
  const d = box(labels.days || 'Days'), h = box(labels.hours || 'Hours'),
        m = box(labels.mins || 'Mins'), s = box(labels.secs || 'Secs');
  container.append(d, h, m, s);
  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function tick() {
    const diff = Math.max(0, endTime - Date.now());
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    d.querySelector('b').textContent = pad(days);
    h.querySelector('b').textContent = pad(hrs);
    m.querySelector('b').textContent = pad(mins);
    s.querySelector('b').textContent = pad(secs);
    if (diff === 0) clearInterval(timer);
  }
  tick();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}

/** Countdown target that rolls over every 48h so the demo stays live. */
export const nextFlashEnd = () => {
  const now = Date.now();
  const period = 48 * 3600000;
  return now + (period - (now % period));
};
