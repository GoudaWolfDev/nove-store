import { el, qs } from '../core/utils.js';
import { t } from '../core/i18n.js';

let overlay, box, lastFocus, onClose;

function ensure() {
  if (overlay) return;
  box = el('div', { className: 'modal-box', attrs: { role: 'dialog', 'aria-modal': 'true' } });
  overlay = el('div', { className: 'modal', attrs: { id: 'nova-modal' } }, [
    el('div', { className: 'backdrop', on: { click: closeModal } }),
    box
  ]);
  overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  document.body.append(overlay);
}

/**
 * Open the shared modal with HTML content.
 * @param {string} html
 * @param {{wide?:boolean, onClose?:Function}} [opts]
 */
export function openModal(html, { wide = false, onClose: cb } = {}) {
  ensure();
  lastFocus = document.activeElement;
  onClose = cb;
  box.classList.toggle('wide', wide);
  box.innerHTML = `<button class="modal-close icon-btn" aria-label="${t('common.close')}"><i class="fas fa-xmark"></i></button>${html}`;
  box.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => (box.querySelector('input,button,a') || box).focus(), 40);
  return box;
}

export function closeModal() {
  if (!overlay) return;
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (typeof onClose === 'function') onClose();
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

/** Lightbox for product images. */
export function openLightbox(images, start = 0, alt = '') {
  let idx = start;
  const render = () => `<div style="padding:16px"><img src="${images[idx]}" alt="${alt}" style="width:100%;max-height:76vh;object-fit:contain;border-radius:12px"></div>`;
  const open = () => openModal(render(), { wide: true });
  open();
  // simple prev/next via keyboard handled in modal
  const handler = (e) => {
    if (!overlay.classList.contains('open')) { document.removeEventListener('keydown', handler); return; }
    if (e.key === 'ArrowRight') { idx = (idx + 1) % images.length; box.innerHTML = `<button class="modal-close icon-btn"><i class="fas fa-xmark"></i></button>${render()}`; box.querySelector('.modal-close').addEventListener('click', closeModal); }
    if (e.key === 'ArrowLeft') { idx = (idx - 1 + images.length) % images.length; box.innerHTML = `<button class="modal-close icon-btn"><i class="fas fa-xmark"></i></button>${render()}`; box.querySelector('.modal-close').addEventListener('click', closeModal); }
  };
  document.addEventListener('keydown', handler);
}
