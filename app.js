/* =========================================================
   FUNNY LOVE GA4 LAB
   1) Cambia measurementId por tu ID real: G-XXXXXXXXXX
   2) Acepta analítica en el banner
   3) Abre DevTools > Console para inspeccionar los eventos
   ========================================================= */

const ANALYTICS_CONFIG = {
  measurementId: "G-XXXXXXXXXX",
  debug: true
};

const products = [
  {id:"FL-001", name:"Aura", category:"premium", categoryLabel:"Premium", price:1299, badge:"Bestseller", shape:"#e93572", rotate:"14deg"},
  {id:"FL-002", name:"Velvet", category:"bienestar", categoryLabel:"Bienestar", price:899, badge:"Nuevo", shape:"#2b2024", rotate:"-10deg"},
  {id:"FL-003", name:"Silk Care", category:"cuidado", categoryLabel:"Cuidado", price:349, badge:"Esencial", shape:"#bd8f9f", rotate:"8deg"},
  {id:"FL-004", name:"Noir", category:"premium", categoryLabel:"Premium", price:1599, badge:"Premium", shape:"#181416", rotate:"-5deg"},
  {id:"FL-005", name:"Bloom", category:"bienestar", categoryLabel:"Bienestar", price:749, badge:"Popular", shape:"#d88aaa", rotate:"11deg"},
  {id:"FL-006", name:"Pure", category:"cuidado", categoryLabel:"Cuidado", price:289, badge:"Suave", shape:"#9e7687", rotate:"-13deg"},
  {id:"FL-007", name:"Muse", category:"premium", categoryLabel:"Premium", price:1799, badge:"Selección", shape:"#6f3650", rotate:"6deg"},
  {id:"FL-008", name:"Calm", category:"bienestar", categoryLabel:"Bienestar", price:649, badge:"Favorito", shape:"#c45e88", rotate:"-8deg"}
];

let cart = [];
let currentProducts = [...products];

function money(n){ return new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n); }

function loadGA4(){
  if (!ANALYTICS_CONFIG.measurementId.startsWith("G-") || ANALYTICS_CONFIG.measurementId === "G-XXXXXXXXXX"){
    console.warn("[GA4 LAB] Reemplaza G-XXXXXXXXXX por tu Measurement ID real.");
    return;
  }
  if (window.gtag) return;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.measurementId}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){ dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", ANALYTICS_CONFIG.measurementId, {debug_mode: ANALYTICS_CONFIG.debug});
  console.info("[GA4 LAB] GA4 cargado:", ANALYTICS_CONFIG.measurementId);
}

function gaItem(p, index=0){
  return {
    item_id:p.id,
    item_name:p.name,
    item_category:p.categoryLabel,
    price:p.price,
    quantity:1,
    index
  };
}

function track(eventName, params={}){
  const payload = { ...params };
  console.groupCollapsed(`%cGA4 EVENT → ${eventName}`,"font-weight:bold;color:#e93572");
  console.log(payload);
  console.groupEnd();
  if (typeof window.gtag === "function"){
    gtag("event", eventName, payload);
  }
}

function renderProducts(list=currentProducts){
  const grid = document.getElementById("productGrid");
  grid.innerHTML = "";
  list.forEach((p,index)=>{
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = p.id;
    card.innerHTML = `
      <div class="product-image" style="--shape:${p.shape};--rotate:${p.rotate}">
        <span class="badge">${p.badge}</span>
      </div>
      <div class="product-info">
        <small>${p.categoryLabel}</small>
        <h3>${p.name}</h3>
        <div class="product-meta">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" data-add="${p.id}">Agregar</button>
        </div>
      </div>`;
    card.addEventListener("click",(e)=>{
      if(e.target.matches("[data-add]")){
        e.stopPropagation();
        addToCart(p);
      } else {
        track("select_item",{
          item_list_id:"home_catalog",
          item_list_name:"Catálogo principal",
          items:[gaItem(p,index)]
        });
        openProduct(p);
      }
    });
    grid.appendChild(card);
  });

  track("view_item_list",{
    item_list_id:"home_catalog",
    item_list_name:"Catálogo principal",
    items:list.map((p,i)=>gaItem(p,i))
  });
}

function openProduct(p){
  track("view_item",{currency:"MXN",value:p.price,items:[gaItem(p)]});
  document.getElementById("modalContent").innerHTML = `
    <div class="modal-product">
      <div class="modal-art" style="--shape:${p.shape};--rotate:${p.rotate}"></div>
      <div class="modal-copy">
        <span class="eyebrow">${p.categoryLabel.toUpperCase()}</span>
        <h2>${p.name}</h2>
        <p>Producto demostrativo para practicar medición e-commerce. La ficha prioriza claridad, confianza y una llamada a la acción visible.</p>
        <p class="price">${money(p.price)}</p>
        <button class="btn primary full" id="modalAdd">Agregar al carrito</button>
      </div>
    </div>`;
  document.getElementById("modalAdd").onclick = ()=>addToCart(p);
  document.getElementById("productModal").showModal();
}

function addToCart(p){
  const found = cart.find(i=>i.id===p.id);
  if(found) found.qty += 1;
  else cart.push({...p,qty:1});
  updateCart();
  track("add_to_cart",{
    currency:"MXN",
    value:p.price,
    items:[{...gaItem(p),quantity:1}]
  });
  toast(`${p.name} agregado al carrito`);
}

function updateCart(){
  document.getElementById("cartCount").textContent = cart.reduce((a,b)=>a+b.qty,0);
  document.getElementById("cartTotal").textContent = money(cart.reduce((a,b)=>a+b.price*b.qty,0));
  const wrap = document.getElementById("cartItems");
  wrap.innerHTML = cart.length ? "" : "<p style='color:#746a6e'>Tu carrito está vacío.</p>";
  cart.forEach(p=>{
    const row=document.createElement("div");
    row.className="cart-item";
    row.innerHTML=`<div><strong>${p.name}</strong><small>${p.qty} × ${money(p.price)}</small></div><button class="remove-btn">Eliminar</button>`;
    row.querySelector("button").onclick=()=>{
      track("remove_from_cart",{currency:"MXN",value:p.price*p.qty,items:[{...gaItem(p),quantity:p.qty}]});
      cart=cart.filter(x=>x.id!==p.id); updateCart();
    };
    wrap.appendChild(row);
  });
}

function openCart(){
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("drawerBackdrop").classList.add("open");
  document.getElementById("cartDrawer").setAttribute("aria-hidden","false");
  track("view_cart",{
    currency:"MXN",
    value:cart.reduce((a,b)=>a+b.price*b.qty,0),
    items:cart.map(p=>({...gaItem(p),quantity:p.qty}))
  });
}
function closeCart(){
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("drawerBackdrop").classList.remove("open");
  document.getElementById("cartDrawer").setAttribute("aria-hidden","true");
}

function toast(msg){
  const el=document.getElementById("toast"); el.textContent=msg; el.classList.add("show");
  setTimeout(()=>el.classList.remove("show"),2200);
}

document.getElementById("cartButton").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
document.getElementById("drawerBackdrop").onclick=closeCart;
document.getElementById("closeModal").onclick=()=>document.getElementById("productModal").close();
document.getElementById("closeCheckout").onclick=()=>document.getElementById("checkoutModal").close();

document.getElementById("heroShop").addEventListener("click",()=>track("select_content",{content_type:"cta",content_id:"hero_shop"}));

document.getElementById("searchInput").addEventListener("input",(e)=>{
  const q=e.target.value.trim().toLowerCase();
  const cat=document.getElementById("categoryFilter").value;
  currentProducts=products.filter(p=>(cat==="all"||p.category===cat)&&p.name.toLowerCase().includes(q));
  renderProducts(currentProducts);
});
document.getElementById("searchInput").addEventListener("change",(e)=>{
  const q=e.target.value.trim();
  if(q) track("search",{search_term:q});
});
document.getElementById("categoryFilter").addEventListener("change",(e)=>{
  const q=document.getElementById("searchInput").value.trim().toLowerCase();
  const cat=e.target.value;
  currentProducts=products.filter(p=>(cat==="all"||p.category===cat)&&p.name.toLowerCase().includes(q));
  renderProducts(currentProducts);
  track("filter_catalog",{category:cat});
});

document.getElementById("newsletterForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  track("sign_up",{method:"newsletter"});
  e.target.reset();
  toast("Registro simulado");
});

document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length){ toast("Agrega al menos un producto"); return; }
  track("begin_checkout",{
    currency:"MXN",
    value:cart.reduce((a,b)=>a+b.price*b.qty,0),
    items:cart.map(p=>({...gaItem(p),quantity:p.qty}))
  });
  closeCart();
  document.getElementById("checkoutModal").showModal();
};

document.getElementById("checkoutForm").addEventListener("submit",(e)=>{
  e.preventDefault();
  const value=cart.reduce((a,b)=>a+b.price*b.qty,0);
  track("purchase",{
    transaction_id:`DEMO-${Date.now()}`,
    currency:"MXN",
    value,
    shipping:0,
    tax:0,
    items:cart.map(p=>({...gaItem(p),quantity:p.qty}))
  });
  cart=[]; updateCart(); e.target.reset();
  document.getElementById("checkoutModal").close();
  toast("Compra simulada — revisa DebugView");
});

document.getElementById("acceptAnalytics").onclick=()=>{
  localStorage.setItem("analyticsConsent","granted");
  document.getElementById("consentBanner").classList.add("hidden");
  loadGA4();
  track("consent_update",{analytics_storage:"granted"});
};
document.getElementById("denyAnalytics").onclick=()=>{
  localStorage.setItem("analyticsConsent","denied");
  document.getElementById("consentBanner").classList.add("hidden");
  console.info("[GA4 LAB] Analítica rechazada.");
};

const consent=localStorage.getItem("analyticsConsent");
if(consent==="granted"){
  document.getElementById("consentBanner").classList.add("hidden");
  loadGA4();
} else if(consent==="denied"){
  document.getElementById("consentBanner").classList.add("hidden");
}

renderProducts();
updateCart();
