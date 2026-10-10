import { t } from '../core/i18n.js';
import { store } from '../core/store.js';
import { qs, qsa } from '../core/utils.js';
import { showToast } from '../components/toast.js';

const strengthOf = (pw) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};

export function initAuth() {
  const main = qs('#app-main');
  const redirect = new URLSearchParams(location.search).get('redirect') || 'account.html';
  main.innerHTML = `<div class="container">
    <div class="auth-wrap">
      <div class="auth-tabs" role="tablist">
        <button class="active" data-tab="login" role="tab">${t('auth.loginTab')}</button>
        <button data-tab="register" role="tab">${t('auth.registerTab')}</button>
      </div>
      <div id="authPanel"></div>
    </div></div>`;
  render('login', redirect);
  qsa('.auth-tabs button').forEach((b) => b.addEventListener('click', () => {
    qsa('.auth-tabs button').forEach((x) => x.classList.remove('active')); b.classList.add('active'); render(b.dataset.tab, redirect);
  }));
}

function render(tab, redirect) {
  const panel = qs('#authPanel');
  if (tab === 'login') {
    panel.innerHTML = `<h2 style="margin-bottom:4px">${t('auth.welcome')}</h2><p class="text-soft" style="margin-bottom:20px">${t('auth.loginTab')}</p>
      <form id="loginForm" novalidate>
        <div class="field"><label>${t('checkout.email')}</label><input class="input" name="email" type="email" required><span class="err"></span></div>
        <div class="field"><label>${t('auth.password')}</label>
          <div class="field-icon suffix"><input class="input" name="password" type="password" id="loginPw" required><i class="fas fa-eye" data-toggle="loginPw"></i></div><span class="err"></span></div>
        <div class="between" style="margin-bottom:16px"><label class="check"><input type="checkbox" name="remember" checked> ${t('auth.remember')}</label><a href="#" class="pill">${t('auth.forgot')}</a></div>
        <button class="btn btn-primary btn-block btn-lg" type="submit">${t('auth.loginTab')}</button>
      </form>
      <div class="divider">${t('auth.noAccount')}</div>
      <button class="btn btn-outline btn-block" id="toRegister">${t('auth.registerTab')}</button>
      <a href="checkout.html" class="btn btn-ghost btn-block mt-2">${t('checkout.guest')}</a>`;
    qs('#toRegister').addEventListener('click', () => { qsa('.auth-tabs button').forEach((x) => x.classList.remove('active')); qs('[data-tab="register"]').classList.add('active'); render('register', redirect); });
    qs('#loginForm').addEventListener('submit', (e) => onLogin(e, redirect));
  } else {
    panel.innerHTML = `<h2 style="margin-bottom:4px">${t('auth.createAccount')}</h2><p class="text-soft" style="margin-bottom:20px">${t('auth.registerTab')}</p>
      <form id="registerForm" novalidate>
        <div class="grid-2"><div class="field"><label>${t('auth.firstName')}</label><input class="input" name="firstName" required><span class="err"></span></div>
        <div class="field"><label>${t('auth.lastName')}</label><input class="input" name="lastName" required><span class="err"></span></div></div>
        <div class="field"><label>${t('checkout.email')}</label><input class="input" name="email" type="email" required><span class="err"></span></div>
        <div class="field"><label>${t('auth.password')}</label>
          <div class="field-icon suffix"><input class="input" name="password" type="password" id="regPw" required><i class="fas fa-eye" data-toggle="regPw"></i></div>
          <div class="strength"><span id="strengthBar"></span></div><span class="err"></span></div>
        <div class="field"><label>${t('auth.confirmPassword')}</label><input class="input" name="confirm" type="password" required><span class="err"></span></div>
        <label class="check" style="margin-bottom:16px"><input type="checkbox" name="agree" required> ${t('auth.agree')}</label>
        <button class="btn btn-primary btn-block btn-lg" type="submit">${t('auth.registerTab')}</button>
      </form>`;
    const pw = qs('#regPw');
    pw.addEventListener('input', () => {
      const s = strengthOf(pw.value);
      const bar = qs('#strengthBar');
      bar.style.width = `${s * 25}%`;
      bar.style.background = ['#f04438', '#f79009', '#ffb400', '#12b76a'][Math.max(0, s - 1)] || '#f04438';
    });
    qs('#registerForm').addEventListener('submit', (e) => onRegister(e, redirect));
  }
  qsa('[data-toggle]').forEach((i) => i.addEventListener('click', () => {
    const input = qs('#' + i.dataset.toggle);
    input.type = input.type === 'password' ? 'text' : 'password';
    i.classList.toggle('fa-eye'); i.classList.toggle('fa-eye-slash');
  }));
}

function onLogin(e, redirect) {
  e.preventDefault();
  const form = e.target, fd = new FormData(form);
  const email = String(fd.get('email')).trim(), password = String(fd.get('password'));
  let ok = true;
  ok = field(form.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? t('auth.invalidEmail') : '') && ok;
  ok = field(form.password, password.length < 1 ? 'Required' : '') && ok;
  if (!ok) return;
  const res = store.login({ email, password, remember: !!fd.get('remember') });
  if (!res.ok) { field(form.password, t('auth.badCreds')); showToast('error', t('auth.badCreds')); return; }
  showToast('success', t('auth.welcomeBack', { name: res.user.firstName }));
  setTimeout(() => (location.href = redirect), 500);
}

function onRegister(e, redirect) {
  e.preventDefault();
  const form = e.target, fd = new FormData(form);
  const firstName = String(fd.get('firstName')).trim(), lastName = String(fd.get('lastName')).trim();
  const email = String(fd.get('email')).trim(), password = String(fd.get('password')), confirm = String(fd.get('confirm'));
  let ok = true;
  ok = field(form.firstName, firstName.length < 2 ? 'Required' : '') && ok;
  ok = field(form.lastName, lastName.length < 2 ? 'Required' : '') && ok;
  ok = field(form.email, !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? t('auth.invalidEmail') : '') && ok;
  ok = field(form.password, password.length < 8 ? t('auth.shortPassword') : '') && ok;
  ok = field(form.confirm, confirm !== password ? t('auth.passwordMismatch') : '') && ok;
  if (!fd.get('agree')) { ok = false; showToast('error', t('auth.agree')); }
  if (!ok) return;
  const res = store.register({ firstName, lastName, email, password, remember: true });
  if (!res.ok) { field(form.email, t('auth.emailExists')); showToast('error', t('auth.emailExists')); return; }
  showToast('success', t('auth.accountCreated'));
  setTimeout(() => (location.href = redirect), 500);
}

function field(input, msg) {
  const err = input.parentElement.querySelector('.err');
  input.classList.toggle('invalid', !!msg);
  if (err) err.textContent = msg || '';
  return !msg;
}
