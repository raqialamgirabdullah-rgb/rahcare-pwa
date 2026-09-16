// payment-method.js
// Reusable "Payment Method" dropdown component (name + icon), meant to be hosted
// on GitHub Pages and imported by any page with a single <script type="module"> import.
//
// Usage in a page:
//
//   import { initPaymentDropdown } from "https://YOUR_GH_USERNAME.github.io/YOUR_REPO/payment-method.js";
//
//   const pm = initPaymentDropdown({
//     container: document.getElementById("pmSlot"), // an empty <div id="pmSlot"></div>
//     selected: "Cash",
//     onChange: (method) => {
//       // method = { id, label, color }
//       console.log("Selected:", method.id);
//     }
//   });
//
//   // Later, read/set the value from your own code:
//   pm.getValue();        // "Cash"
//   pm.setValue("Bikash"); // change selection programmatically
//
// NOTE ON ICONS: These are simple generic inline SVG icons (not the exact brand
// logos of bKash/Nagad), so there are no trademark/asset-licensing concerns and
// nothing external needs to load. If you have real logo images later, see the
// "customLogos" option below — you can swap any icon for an <img> without
// touching any other file that imports this module.

const DEFAULT_METHODS = [
  {
    id: "Cash",
    label: "Cash",
    color: "#2e7d32",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.6"/>
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" stroke-width="1.6"/>
      <path d="M5 9V9.01M19 15V15.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "Bikash",
    label: "Bikash",
    color: "#e2136e",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#e2136e"/>
      <text x="12" y="16.5" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="#fff">b</text>
    </svg>`
  },
  {
    id: "Bank",
    label: "Bank",
    color: "#3f51b5",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10L12 4L21 10" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M5 10V19M9.5 10V19M14.5 10V19M19 10V19" stroke="currentColor" stroke-width="1.6"/>
      <path d="M3 19H21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`
  },
  {
    id: "Nagad",
    label: "Nagad",
    color: "#f7941d",
    icon: `<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#f7941d"/>
      <text x="12" y="16.5" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="#fff">N</text>
    </svg>`
  }
];

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    .pmw-wrap{position:relative;display:inline-block;font-family:inherit}
    .pmw-btn{display:flex;align-items:center;gap:6px;cursor:pointer;padding:0 10px;height:28px;
      border:1px solid var(--border,#ddd);border-radius:var(--radius-sm,6px);background:#fafafa;font-size:11px}
    .pmw-btn.pmw-selected{background:#fff;border-color:var(--primary,#2e7d32)}
    .pmw-btn svg{flex-shrink:0}
    .pmw-menu{display:none;position:absolute;top:34px;right:0;left:auto;width:150px;background:#fff;
      border:1px solid var(--border,#ddd);border-radius:var(--radius-sm,6px);box-shadow:0 4px 14px rgba(0,0,0,.12);
      z-index:50;padding:4px;grid-template-rows:repeat(2,1fr);grid-auto-flow:column;gap:2px}
    .pmw-menu.pmw-open{display:grid}
    .pmw-item{display:flex;align-items:center;gap:6px;padding:6px 8px;font-size:12px;border-radius:4px;cursor:pointer}
    .pmw-item:hover{background:var(--primary-light,#eef6ef)}
    .pmw-item svg{flex-shrink:0}
  `;
  document.head.appendChild(style);
}

/**
 * Build and wire up a payment-method dropdown inside `container`.
 * @param {Object} opts
 * @param {HTMLElement} opts.container - empty element to render into
 * @param {string} [opts.selected] - initially selected method id
 * @param {Function} [opts.onChange] - called with the full method object on change
 * @param {Array} [opts.methods] - override the default method list entirely
 * @param {Object} [opts.customLogos] - e.g. { Bikash: "<img src='...'>' } to replace one icon
 */
export function initPaymentDropdown({
  container,
  selected = "Cash",
  onChange,
  methods = DEFAULT_METHODS,
  customLogos = {}
} = {}) {
  if (!container) throw new Error("initPaymentDropdown: container is required");
  injectStyles();

  const list = methods.map(m =>
    customLogos[m.id] ? { ...m, icon: customLogos[m.id] } : m
  );

  let current = list.find(m => m.id === selected) || list[0];

  const wrap = document.createElement("div");
  wrap.className = "pmw-wrap";

  const btn = document.createElement("div");
  btn.className = "pmw-btn pmw-selected";

  const menu = document.createElement("div");
  menu.className = "pmw-menu";

  function renderBtn() {
    btn.innerHTML = `${current.icon}<span>${current.label}</span>`;
  }

  function renderMenu() {
    menu.innerHTML = "";
    list.forEach(m => {
      const item = document.createElement("div");
      item.className = "pmw-item";
      item.innerHTML = `${m.icon}<span>${m.label}</span>`;
      item.onclick = (e) => {
        e.stopPropagation();
        current = m;
        renderBtn();
        closeMenu();
        onChange && onChange(current);
      };
      menu.appendChild(item);
    });
  }

  function openMenu() { menu.classList.add("pmw-open"); }
  function closeMenu() { menu.classList.remove("pmw-open"); }
  function toggleMenu(e) {
    e.stopPropagation();
    menu.classList.contains("pmw-open") ? closeMenu() : openMenu();
  }

  btn.onclick = toggleMenu;
  document.addEventListener("click", closeMenu);

  renderBtn();
  renderMenu();
  wrap.appendChild(btn);
  wrap.appendChild(menu);
  container.innerHTML = "";
  container.appendChild(wrap);

  return {
    getValue: () => current.id,
    getMethod: () => current,
    setValue: (id) => {
      const m = list.find(x => x.id === id);
      if (m) { current = m; renderBtn(); onChange && onChange(current); }
    },
    destroy: () => {
      document.removeEventListener("click", closeMenu);
      wrap.remove();
    }
  };
}

export { DEFAULT_METHODS as PAYMENT_METHODS };
