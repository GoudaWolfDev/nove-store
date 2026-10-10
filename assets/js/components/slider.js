import { el } from '../core/utils.js';

/**
 * Create a generic slider over `.slides > *` with dots + arrows + swipe.
 * @param {HTMLElement} root
 * @param {{autoplay?:boolean, interval?:number, start?:number}} [opts]
 */
export function createSlider(root, { autoplay = true, interval = 5500, start = 0 } = {}) {
  if (!root) return null;
  const track = root.querySelector('.slides');
  const count = track ? track.children.length : 0;
  if (!count) return null;
  const dotsWrap = root.querySelector('.dots');
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');
  let index = start;
  let timer = null;

  if (dotsWrap) {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < count; i++) {
      dotsWrap.append(el('button', {
        attrs: { 'aria-label': `Slide ${i + 1}`, 'aria-current': i === index },
        on: { click: () => go(i) }
      }));
    }
  }

  function render() {
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dotsWrap) [...dotsWrap.children].forEach((d, i) => {
      d.classList.toggle('active', i === index);
      d.setAttribute('aria-current', i === index);
    });
  }
  function go(i) { index = (i + count) % count; render(); restart(); }
  const next = () => go(index + 1);
  const prev = () => go(index - 1);
  const restart = () => { if (autoplay) { clearInterval(timer); timer = setInterval(next, interval); } };

  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', restart);

  // touch swipe
  let x0 = null;
  root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    x0 = null;
  });

  render();
  restart();
  return { go, next, prev, destroy: () => clearInterval(timer) };
}
