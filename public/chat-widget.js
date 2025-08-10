// public/chat-widget.js
(() => {
  const el = document.currentScript;

  // ====== Parámetros ======
  const avatar = el.getAttribute("data-avatar") || "/bot-avatar.png";
  const chatUrl = el.getAttribute("data-chat-url") || "";
  const title = el.getAttribute("data-title") || "Abrir chat";
  const size = Number(el.getAttribute("data-size") || 64);
  const zBase = Number(el.getAttribute("data-z-index") || 2147483600);
  const pos = el.getAttribute("data-position") || "bottom-right";
  const offset = Number(el.getAttribute("data-offset") || 24);
  const pWidth = el.getAttribute("data-panel-width") || "380px";
  const pHeight = el.getAttribute("data-panel-height") || "560px";
  const overlay = (el.getAttribute("data-overlay") || "true") !== "false";
  const escClose = (el.getAttribute("data-close-on-esc") || "true") !== "false";
  const badgeStr = el.getAttribute("data-badge") || ""; // "", "auto" o "3"
  const iframeTitle = el.getAttribute("data-iframe-title") || "Chat";

  // Seguridad iframe
  const iframeAllow = el.getAttribute("data-allow") || "clipboard-write";
  const iframeSandbox =
    el.getAttribute("data-sandbox") ||
    "allow-scripts allow-forms allow-same-origin allow-popups";
  const allowedOrigins = (el.getAttribute("data-allowed-origins") || "")
    .split(",").map((s) => s.trim()).filter(Boolean);

  // ====== Estado accesibilidad (persistente) ======
  const LS_KEY = "ctv_widget_settings";
  let state = { theme: "light", contrast: false, lang: "es" };
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (saved && typeof saved === "object") state = { ...state, ...saved };
  } catch {}

  // ====== Launcher ======
  const btn = document.createElement("button");
  btn.type = "button";
  btn.setAttribute("aria-label", title);
  btn.setAttribute("title", title);
  btn.setAttribute("aria-expanded", "false");
  btn.style.cssText = `
    position:fixed; ${pos.includes("left") ? "left" : "right"}:${offset}px; bottom:${offset}px;
    width:${size}px; height:${size}px; border-radius:50%; border:none; padding:0; cursor:pointer;
    background:#fff; box-shadow:0 10px 20px rgba(0,0,0,.15); z-index:${zBase + 1};
  `;
  const img = document.createElement("img");
  img.src = avatar;
  img.alt = "Chatbot";
  img.style.cssText = `width:${size}px; height:${size}px; border-radius:50%; object-fit:cover; display:block;`;
  btn.appendChild(img);

  // Badge opcional
  let badge;
  const setBadge = (n) => {
    if (!badge) {
      badge = document.createElement("span");
      badge.style.cssText = `
        position:absolute; ${pos.includes("left") ? "left" : "right"}:-6px; top:-6px;
        min-width:18px; height:18px; padding:0 4px; border-radius:999px; background:#ef4444;
        color:white; font: 11px/18px system-ui, sans-serif; text-align:center;
      `;
      btn.style.position = "fixed";
      btn.appendChild(badge);
    }
    badge.textContent = String(n);
    badge.style.display = n > 0 ? "inline-block" : "none";
  };
  if (badgeStr && !isNaN(Number(badgeStr))) setBadge(Number(badgeStr));

  // ====== Overlay ======
  const ov = document.createElement("div");
  ov.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,.12); display:none; z-index:${zBase};
  `;

  // ====== Panel ======
  const panel = document.createElement("div");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  panel.setAttribute("aria-label", "Chat");
  panel.style.cssText = `
    position:fixed; ${pos.includes("left") ? "left" : "right"}:${offset}px; bottom:${offset + size + 12}px;
    width:${pWidth}; height:${pHeight}; background:white; border:1px solid #e5e7eb; border-radius:16px;
    box-shadow:0 10px 30px rgba(0,0,0,.15); overflow:hidden; display:none; z-index:${zBase + 2};
  `;

  // Header accesibilidad
  const header = document.createElement("div");
  header.style.cssText = `
    height:40px; background:#0f172a; color:#fff; display:flex; align-items:center; justify-content:space-between;
    padding:0 8px; font:13px/1 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Arial;
  `;
  header.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <img src="${avatar}" alt="Bot" style="width:22px;height:22px;border-radius:50%;object-fit:cover"/>
      <strong style="font-weight:600">Chatbot Tutor Virtual</strong>
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">
        <input type="checkbox" id="wgt-theme" /> <span>Tema oscuro</span>
      </label>
      <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">
        <input type="checkbox" id="wgt-contrast" /> <span>Alto contraste</span>
      </label>
      <select id="wgt-lang" aria-label="Idioma" style="background:#111827;color:#fff;border:1px solid #374151;border-radius:6px;padding:2px 6px">
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
      <button id="wgt-close" title="Cerrar" aria-label="Cerrar"
        style="background:transparent;color:#fff;border:0;font-size:18px;cursor:pointer;line-height:1">×</button>
    </div>
  `;
  panel.appendChild(header);

  // Contenido (iframe o placeholder)
  const content = document.createElement("div");
  content.style.cssText = "width:100%; height:calc(100% - 40px);";
  panel.appendChild(content);

  // Responsive móvil
  const mq = window.matchMedia("(max-width: 480px)");
  const applyMobile = () => {
    if (mq.matches) {
      panel.style.width = "94vw";
      panel.style.height = "70vh";
      panel.style[pos.includes("left") ? "left" : "right"] = "3vw";
    } else {
      panel.style.width = pWidth;
      panel.style[pos.includes("left") ? "left" : "right"] = `${offset}px`;
    }
  };
  applyMobile();
  mq.addEventListener?.("change", applyMobile);

  let frame;
  if (chatUrl) {
    frame = document.createElement("iframe");
    frame.src = chatUrl;
    frame.title = iframeTitle;
    frame.loading = "eager";
    frame.referrerPolicy = "no-referrer";
    frame.allow = iframeAllow;
    frame.sandbox = iframeSandbox;
    frame.style.cssText = "width:100%; height:100%; border:0;";
    content.appendChild(frame);
  } else {
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "display:flex;align-items:center;justify-content:center;height:100%;color:#6b7280;font:14px system-ui, sans-serif;text-align:center;padding:16px;";
    wrap.innerHTML = `
      <div>
        <img src="${avatar}" alt="Bot" style="width:80px;height:80px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 8px"/>
        <div>Configura <code>data-chat-url</code> en el script del widget.</div>
      </div>`;
    content.appendChild(wrap);
  }

  // abrir/cerrar
  const open = () => {
    if (overlay) ov.style.display = "block";
    panel.style.display = "block";
    btn.setAttribute("aria-expanded", "true");
    if (badgeStr === "auto") setBadge(0);
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "chat:settings", ...state }, "*");
    }
  };
  const close = () => {
    if (overlay) ov.style.display = "none";
    panel.style.display = "none";
    btn.setAttribute("aria-expanded", "false");
  };
  btn.addEventListener("click", () => {
    const isOpen = panel.style.display === "block";
    isOpen ? close() : open();
  });
  if (overlay) {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) close();
    });
  }
  if (escClose) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });
  }

  // montar
  document.body.appendChild(btn);
  if (overlay) document.body.appendChild(ov);
  document.body.appendChild(panel);

  // toggles header
  const themeToggle = header.querySelector("#wgt-theme");
  const contrastToggle = header.querySelector("#wgt-contrast");
  const langSelect = header.querySelector("#wgt-lang");
  const closeBtn = header.querySelector("#wgt-close");

  // init con estado guardado
  themeToggle.checked = state.theme === "dark";
  contrastToggle.checked = !!state.contrast;
  langSelect.value = state.lang;

  const persist = () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch {}
  };

  const applyPanelSkin = () => {
    if (state.theme === "dark") {
      panel.style.background = "#0f172a";
      panel.style.borderColor = "#1f2937";
      header.style.background = "#0b1220";
      ov.style.background = "rgba(0,0,0,.35)";
      panel.style.color = "#e5e7eb";
    } else {
      panel.style.background = "#ffffff";
      panel.style.borderColor = "#e5e7eb";
      header.style.background = "#0f172a";
      ov.style.background = "rgba(0,0,0,.12)";
      panel.style.color = "#111827";
    }
    panel.style.borderWidth = state.contrast ? "2px" : "1px";
  };

  const applyAndNotify = () => {
    applyPanelSkin();
    persist();
    if (frame && frame.contentWindow) {
      frame.contentWindow.postMessage({ type: "chat:settings", ...state }, "*");
    }
  };

  themeToggle.addEventListener("change", () => {
    state.theme = themeToggle.checked ? "dark" : "light";
    applyAndNotify();
  });
  contrastToggle.addEventListener("change", () => {
    state.contrast = contrastToggle.checked;
    applyAndNotify();
  });
  langSelect.addEventListener("change", () => {
    state.lang = langSelect.value || "es";
    applyAndNotify();
  });
  closeBtn.addEventListener("click", close);

  applyPanelSkin();

  // badge "auto"
  if (badgeStr === "auto") {
    window.addEventListener("message", (ev) => {
      try {
        if (allowedOrigins.length && !allowedOrigins.includes(ev.origin)) return;
        const { type, count } = ev.data || {};
        if (type === "chat:badge" && typeof count === "number") {
          const isOpen = panel.style.display === "block";
          setBadge(isOpen ? 0 : count);
        }
      } catch {}
    });
  }

  if (frame) {
    frame.addEventListener("load", () => {
      try { frame.contentWindow.postMessage({ type: "chat:settings", ...state }, "*"); } catch {}
    });
  }
})();