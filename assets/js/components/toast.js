import { el } from '../core/utils.js';
import { t } from '../core/i18n.js';

let wrap;

const ICONS = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };

/**
 * Show an accessible toast notification.
 * @param {'success'|'error'|'info'} type
 */
export function showToast(type = 'info', title = '', message = '', timeout = 3400) {
  if (!wrap) {
    wrap = el('div', { className: 'toast-wrap', attrs: { role: 'status', 'aria-live': 'polite' } });
    document.body.append(wrap);
  }
  const node = el('div', { className: `toast ${type}` }, [
    el('i', { className: `fas ${ICONS[type] || ICONS.info}`, attrs: { 'aria-hidden': 'true' } }),
    el('div', { className: 'grow' }, [
      el('strong', { text: title || t('toast.title') }),
      message ? el('p', { text: message }) : null
    ]),
    el('button', { className: 'toast-close icon-btn', html: '<i class="fas fa-xmark"></i>', attrs: { 'aria-label': t('common.close') } })
  ]);
  wrap.append(node);
  const remove = () => { node.classList.add('hide'); setTimeout(() => node.remove(), 300); };
  node.querySelector('.toast-close').addEventListener('click', remove);
  if (timeout) setTimeout(remove, timeout);
  return node;
}
