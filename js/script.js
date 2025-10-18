
// ====== Local Storage helpers ======
const LS = {
  get(key, def){ try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } },
  set(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
};

// ====== Dark mode ======
(function initTheme(){
  const saved = LS.get("theme","light");
  if(saved === "dark") document.documentElement.classList.add("dark");
})();

function toggleTheme(){
  const isDark = document.documentElement.classList.toggle("dark");
  LS.set("theme", isDark ? "dark" : "light");
}

// ====== Data ======
const PRODUCTS = [
  {id:"choc", name:"Chocolate", price:129, img:"images/chocolate.jpg"},
  {id:"straw", name:"Strawberry", price:119, img:"images/strawberry.jpg"},
  {id:"mango", name:"Mango", price:139, img:"images/mango.jpg"},
  {id:"van", name:"Vanilla", price:99, img:"images/vanilla.jpg"},
  {id:"butter", name:"Butterscotch", price:149, img:"images/butterscotch.jpg"},
  {id:"kulfi", name:"Kulfi", price:159, img:"images/kulfi.jpg"},
  {id:"cone", name:"Cone", price:89, img:"images/cone.jpg"},
  {id:"sundae", name:"Sundae", price:179, img:"images/sundae.jpg"},
];

// ====== Inspiration quotes ======
const QUOTES = [
  "Life is short, eat ice cream 🍦",
  "You can’t buy happiness, but you can buy ice cream — and that’s pretty close!",
  "Scoop, there it is!",
  "Keep calm and eat ice cream.",
  "We craft happiness in scoops 🍨"
];

// ====== Ratings ======
function getRatings(){ return LS.get("ratings", {}); }
function setRatings(r){ LS.set("ratings", r); }
function setRating(id, stars){
  const r = getRatings();
  r[id] = stars;
  setRatings(r);
}

// ====== Cart ======
function getCart(){ return LS.get("cart", {}); }
function setCart(c){ LS.set("cart", c); }

function addToCart(id){
  const c = getCart();
  c[id] = (c[id] || 0) + 1;
  setCart(c);
  showAddedModal(id);
  updateCartCountBadge && updateCartCountBadge();
}

function updateCartCountBadge(){
  const c = getCart();
  const count = Object.values(c).reduce((a,b)=>a+b,0);
  const el = document.getElementById("cartCount");
  if(el) el.textContent = count;
}

// ====== Modal for add to cart ======
function showAddedModal(id){
  const p = PRODUCTS.find(x=>x.id===id);
  const modal = document.getElementById("addedModal");
  if(!modal) return;
  modal.querySelector(".msg").textContent = `${p.name} added to cart!`;
  modal.classList.add("show");
  setTimeout(()=> modal.classList.remove("show"), 1400);
}

// ====== Render stars ======
function renderStars(container, id){
  const ratings = getRatings();
  const current = ratings[id] || 0;
  container.innerHTML = "";
  for(let i=1;i<=5;i++){
    const span = document.createElement("span");
    span.className = "star" + (i<=current ? " active" : "");
    span.textContent = "⭐";
    span.addEventListener("click", ()=>{
      setRating(id,i);
      renderStars(container, id);
    });
    container.appendChild(span);
  }
}

// ====== Products Page ======
function loadProducts(){
  const wrap = document.getElementById("products");
  if(!wrap) return;
  const search = document.getElementById("search");
  function draw(list){
    wrap.innerHTML = "";
    list.forEach(p=>{
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <div class="pad">
          <div class="badge">Top Pick</div>
          <h3>${p.name}</h3>
          <div class="price">₹ ${p.price}</div>
          <div class="stars" id="stars-${p.id}"></div>
          <button class="btn add-cart" data-id="${p.id}">Add to Cart</button>
        </div>
      `;
      wrap.appendChild(card);
      renderStars(card.querySelector(".stars"), p.id);
      card.querySelector(".add-cart").addEventListener("click", (e)=> addToCart(p.id));
    });
  }
  draw(PRODUCTS);

  search?.addEventListener("input", (e)=>{
    const q = e.target.value.toLowerCase();
    const filtered = PRODUCTS.filter(p=> p.name.toLowerCase().includes(q));
    draw(filtered);
  });

  document.getElementById("goToCart")?.addEventListener("click", ()=> location.href="cart.html");
  updateCartCountBadge();
}

// ====== Cart Page ======
function loadCartPage(){
  const list = document.getElementById("cartItems");
  if(!list) return;
  const totalEl = document.getElementById("cartTotal");
  const cart = getCart();

  function redraw(){
    list.innerHTML = "";
    let total = 0;
    Object.entries(cart).forEach(([id, qty])=>{
      const p = PRODUCTS.find(x=>x.id===id);
      if(!p) return;
      const item = document.createElement("div");
      item.className = "cart-item";
      item.innerHTML = `
        <img src="${p.img}" alt="${p.name}">
        <div>
          <div><strong>${p.name}</strong></div>
          <div class="small">₹ ${p.price} x <span class="q">${qty}</span></div>
        </div>
        <div class="qty">
          <button class="btn-outline minus">-</button>
          <button class="btn-outline plus">+</button>
          <button class="btn-outline remove">Remove</button>
        </div>
      `;
      item.querySelector(".minus").onclick = ()=>{ if(cart[id]>1){ cart[id]--; redraw(); } };
      item.querySelector(".plus").onclick = ()=>{ cart[id]++; redraw(); };
      item.querySelector(".remove").onclick = ()=>{ delete cart[id]; redraw(); };
      list.appendChild(item);
      total += p.price * qty;
    });
    totalEl.textContent = total.toString();
    setCart(cart);
    updateCartCountBadge();
  }
  redraw();

  document.getElementById("checkoutBtn")?.addEventListener("click", ()=>{
    // Clear cart and confetti
    runConfetti(900);
    setCart({});
    setTimeout(()=> location.href = "product.html", 1200);
  });
}

// ====== Confetti ======
function runConfetti(duration=1000){
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const pieces = Array.from({length: 120}, ()=> ({
    x: Math.random()*W, y: Math.random()*-H, r: 6+Math.random()*6, vy: 2+Math.random()*4, vx: (Math.random()-.5)*2, a: Math.random()*Math.PI
  }));
  let start = performance.now();
  function frame(t){
    ctx.clearRect(0,0,W,H);
    pieces.forEach(p=>{
      p.y += p.vy; p.x += p.vx; p.a += 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = ["#f87171","#60a5fa","#34d399","#fbbf24","#f472b6","#a78bfa"][p.y%6|0];
      ctx.fillRect(-p.r/2,-p.r/2,p.r,p.r);
      ctx.restore();
      if(p.y>H+20){ p.y = -20; p.x = Math.random()*W; }
    });
    if(t - start < duration){ requestAnimationFrame(frame); } else { canvas.remove(); }
  }
  requestAnimationFrame(frame);
}

// ====== Index page / quotes ======
function initIndex(){
  const el = document.getElementById("quote-box");
  if(el) el.textContent = QUOTES[(Math.random()*QUOTES.length)|0];
  updateCartCountBadge();
}

// ====== Login / Signup / Contact ======
function initLogin(){
  const form = document.getElementById("loginForm");
  if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const pass = document.getElementById("password").value;
    if(!email || !pass) return alert("Please enter email and password");
    LS.set("session", {email});
    location.href = "product.html";
  });
}

function initSignup(){
  const form = document.getElementById("signupForm");
  if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const email = document.getElementById("signupEmail").value.trim();
    const pass = document.getElementById("signupPassword").value;
    const confirm = document.getElementById("confirmPassword").value;
    if(pass !== confirm) return alert("Passwords do not match");
    LS.set("user:"+email, {email, pass});
    alert("Signup successful! Please login.");
    location.href = "login.html";
  });
}

function initContact(){
  const form = document.getElementById("feedbackForm");
  if(!form) return;
  form.addEventListener("submit", e=>{
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const feedback = document.getElementById("feedback").value.trim();
    const rating = document.getElementById("rating").value;
    const list = LS.get("feedback_list", []);
    list.push({name, email, feedback, rating, at: Date.now()});
    LS.set("feedback_list", list);
    alert("Thanks for your feedback!");
    form.reset();
  });
}

// ====== Global init (by page) ======
document.addEventListener("DOMContentLoaded", ()=>{
  // Nav theme toggle
  const themeBtn = document.getElementById("themeToggle");
  themeBtn?.addEventListener("click", toggleTheme);
  // Init by page
  initIndex();
  loadProducts();
  loadCartPage();
  initLogin();
  initSignup();
  initContact();
  // Close modal on click
  document.getElementById("addedModal")?.addEventListener("click", e=>{
    if(e.target.classList.contains("modal")) e.currentTarget.classList.remove("show");
  });
});
