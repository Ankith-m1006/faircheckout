// Kirana Threads: a tiny demo shop. Dark patterns come from window.PATTERNS (patterns.js).
const P = window.PATTERNS;
const PRODUCTS = [
  { id: 'tee', name: 'Cotton Tee', price: 499, colour: '#b5452b', note: 'Soft handloom cotton, everyday fit.' },
  { id: 'kurta', name: 'Linen Kurta', price: 1299, colour: '#2f5d62', note: 'Breathable linen for warm days.' },
  { id: 'tote', name: 'Canvas Tote', price: 349, colour: '#8a6d3b', note: 'Carries a week of groceries.' },
];
const PLAN = { id: 'plan', name: 'Protection plan (1 year)', price: 99 };
const SHIPPING = 49;
const FEE = { name: 'Convenience fee', price: 49 };
const MEMBERSHIP = { name: 'Threads Plus', price: 199 };

const $ = (s) => document.querySelector(s);
const rs = (n) => '₹' + n.toLocaleString('en-IN');
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

let cart = load('kt-cart', []);           // [{id, qty}]
let account = load('kt-account', null);    // {email}
let member = load('kt-member', false);

function cartLines() {
  return cart.map((l) => ({ ...(l.id === 'plan' ? PLAN : PRODUCTS.find((p) => p.id === l.id)), qty: l.qty }));
}
function subtotal() { return cartLines().reduce((a, l) => a + l.price * l.qty, 0); }
function setCart(c) { cart = c; save('kt-cart', cart); $('#cart-count').textContent = cart.filter((l) => l.id !== 'plan').reduce((a, l) => a + l.qty, 0); }

function addToCart(id) {
  const c = [...cart];
  const line = c.find((l) => l.id === id);
  if (line) line.qty++; else c.push({ id, qty: 1 });
  // BASKET SNEAKING: quietly add a paid plan the customer never chose
  if (P.basketSneaking && !c.find((l) => l.id === 'plan')) c.push({ id: 'plan', qty: 1 });
  setCart(c);
  location.hash = '#/cart';
}

function urgencyBanner() {
  if (!P.falseUrgency) return '';
  // FALSE URGENCY: the "deal" restarts from 4:59 on every page load
  return `<div class="urgency" id="urgency">Festive deal ends in <span id="clock">04:59</span>. Prices go up after that!</div>`;
}
function startClock() {
  const el = $('#clock'); if (!el) return;
  let left = 299;
  clearInterval(window.__clock);
  window.__clock = setInterval(() => { left = Math.max(0, left - 1); el.textContent = `0${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`; }, 1000);
}

const views = {
  home() {
    return `${urgencyBanner()}<h1>Honest clothes, made in small batches.</h1>
      <div class="grid">${PRODUCTS.map((p) => `<div class="card">
        <div class="swatch" style="background:${p.colour}">${p.name[0]}</div>
        <h2><a href="#/p/${p.id}">${p.name}</a></h2><p class="note">${p.note}</p>
        <p class="price" data-price="${p.id}">${rs(p.price)}</p>
        <button class="btn small" data-add="${p.id}">Add ${p.name} to cart</button></div>`).join('')}</div>`;
  },
  product(id) {
    const p = PRODUCTS.find((x) => x.id === id) || PRODUCTS[0];
    return `${urgencyBanner()}<div class="two"><div class="swatch" style="background:${p.colour};height:340px">${p.name[0]}</div>
      <div><h1>${p.name}</h1><p class="price" style="font-size:24px">${rs(p.price)}</p><p class="note">Shipping ${rs(SHIPPING)} anywhere in India. Price shown is the price you pay for the item.</p>
      <p style="margin:16px 0">${p.note}</p><button class="btn" data-add="${p.id}">Add ${p.name} to cart</button></div></div>`;
  },
  cart() {
    const lines = cartLines();
    if (!lines.length) return `<h1>Your cart is empty</h1><a class="btn" href="#/">Go shopping</a>`;
    const plan = lines.find((l) => l.id === 'plan');
    const offer = member ? '' : `<div class="offer"><h2>Join ${MEMBERSHIP.name}</h2><p class="note">Free shipping and early access, ${rs(MEMBERSHIP.price)} a month.</p>
        <button class="btn small" id="join">Yes, join ${MEMBERSHIP.name}</button>
        <button class="decline" id="decline">${P.confirmShaming ? "No thanks, I don't like saving money" : 'No thanks'}</button></div>`;
    return `${urgencyBanner()}<h1>Your cart</h1><div class="two"><div class="card">
      ${lines.filter((l) => l.id !== 'plan').map((l) => `<div class="row"><span>${l.name} × ${l.qty}</span><span>${rs(l.price * l.qty)}</span></div>`).join('')}
      <label class="addon"><input type="checkbox" id="plan" ${plan ? 'checked' : ''}> <span>${PLAN.name}: covers stains and tears for a year. <b>${rs(PLAN.price)}</b></span></label>
      <div class="row"><span>Shipping</span><span>${rs(SHIPPING)}</span></div>
      <div class="row total"><span>Total</span><span id="cart-total">${rs(subtotal() + SHIPPING)}</span></div>
      <a class="btn" href="#/checkout">Checkout</a></div><div>${offer}</div></div>`;
  },
  checkout() {
    if (!cartLines().length) { location.hash = '#/cart'; return ''; }
    const guest = P.forcedAction ? '' : `<p style="margin-top:14px"><a class="btn ghost" href="#/payment" id="guest">Continue as guest</a></p>`;
    if (account) return `<h1>Checkout</h1><p>Signed in as ${account.email}.</p><a class="btn" href="#/payment">Continue to payment</a>`;
    return `<div class="steps"><b>1 Details</b> › 2 Payment</div><h1>Checkout</h1><div class="card" style="max-width:460px">
      <p class="note">${P.forcedAction ? 'Create an account to place your order.' : 'Sign in, create an account, or check out as a guest.'}</p>
      <label for="email">Email</label><input type="email" id="email" placeholder="you@example.com">
      <label for="pw">Password</label><input type="password" id="pw" placeholder="At least 8 characters">
      <p style="margin-top:14px"><button class="btn" id="create">Create account and continue</button></p>${guest}</div>`;
  },
  payment() {
    const lines = cartLines();
    if (!lines.length) { location.hash = '#/cart'; return ''; }
    // DRIP PRICING: a mandatory fee that was never shown before this last step
    const fee = P.dripPricing ? `<div class="row"><span>${FEE.name}</span><span>${rs(FEE.price)}</span></div>` : '';
    const total = subtotal() + SHIPPING + (P.dripPricing ? FEE.price : 0);
    return `<div class="steps">1 Details › <b>2 Payment</b></div><h1>Review and pay</h1><div class="card" style="max-width:520px">
      ${lines.map((l) => `<div class="row"><span>${l.name} × ${l.qty}</span><span>${rs(l.price * l.qty)}</span></div>`).join('')}
      <div class="row"><span>Shipping</span><span>${rs(SHIPPING)}</span></div>${fee}
      <div class="row total"><span>Total to pay</span><span id="pay-total">${rs(total)}</span></div>
      <button class="btn" id="pay">Place order (demo, nothing is charged)</button></div>`;
  },
  done() { setCart([]); return `<h1 class="ok">Order placed (demo)</h1><p>Thanks! Nothing was charged.</p><a class="btn" href="#/">Back to shop</a>`; },
  account() {
    if (!member) return `<h1>Account</h1><p>You are not a ${MEMBERSHIP.name} member.</p><button class="btn" id="join">Join ${MEMBERSHIP.name} (${rs(MEMBERSHIP.price)}/month)</button>`;
    // SUBSCRIPTION TRAP: no cancel button here, it hides behind "Manage benefits"
    if (P.subscriptionTrap) return `<h1>Account</h1><p>You are a <b>${MEMBERSHIP.name}</b> member (${rs(MEMBERSHIP.price)}/month).</p><a class="btn ghost small" href="#/benefits">Manage benefits</a>`;
    return `<h1>Account</h1><p>You are a <b>${MEMBERSHIP.name}</b> member (${rs(MEMBERSHIP.price)}/month).</p><button class="btn" id="cancel">Cancel membership</button>`;
  },
  benefits() { return `<h1>Your benefits</h1><p>Free shipping, early access, members-only drops.</p><a class="btn small" href="#/">Keep shopping</a> <a class="note" href="#/leave">I want to leave</a>`; },
  leave() { return `<h1>Before you go…</h1><p>Members save ₹1,200 a year on average.</p><a class="btn small" href="#/account">Stay a member</a> <a class="note" href="#/leave2">Continue</a>`; },
  leave2() { return `<h1>Tell us why</h1><p class="note">Pick a reason to continue.</p><a class="note" href="#/leave3">It's too expensive</a> · <a class="note" href="#/leave3">I don't use it</a>`; },
  leave3() { return `<h1>Last step</h1><p>To cancel, please call our member care line between 10am and 4pm on weekdays: <b>1800-000-0000</b>.</p>`; },
  cancelled() { return `<h1 class="ok">Membership cancelled</h1><p>You will not be charged again.</p>`; },
};

function render() {
  const [, route = '', arg] = location.hash.split('/');
  const html = route === 'p' ? views.product(arg) : (views[route || 'home'] || views.home)();
  $('#app').innerHTML = html;
  startClock();
  document.querySelectorAll('[data-add]').forEach((b) => (b.onclick = () => addToCart(b.dataset.add)));
  const plan = $('#plan');
  if (plan) plan.onchange = () => { setCart(plan.checked ? [...cart, { id: 'plan', qty: 1 }] : cart.filter((l) => l.id !== 'plan')); render(); };
  if ($('#join')) $('#join').onclick = () => { member = true; save('kt-member', true); location.hash = '#/account'; render(); };
  if ($('#decline')) $('#decline').onclick = () => { $('#decline').closest('.offer').remove(); };
  if ($('#create')) $('#create').onclick = () => {
    const email = $('#email').value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email) || $('#pw').value.length < 8) { $('.note').textContent = 'Enter an email and a password of at least 8 characters.'; return; }
    account = { email }; save('kt-account', account); location.hash = '#/payment';
  };
  if ($('#pay')) $('#pay').onclick = () => { location.hash = '#/done'; };
  if ($('#cancel')) $('#cancel').onclick = () => { member = false; save('kt-member', false); location.hash = '#/cancelled'; };
  setCart(cart);
}
window.addEventListener('hashchange', render);
render();
