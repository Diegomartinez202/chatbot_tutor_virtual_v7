/* public/chat-widget.js — launcher moderno (recomendado) */
(function () {
    const LS_KEY = "ctv_widget_settings";
    const ONE = 1;

    const DEFAULTS = {
        iconUrl: "/bot-avatar.png",
        title: "Abrir chat",
        buttonPosition: "bottom-right",
        size: 64,
        offset: 24,
        zIndex: 2147483600,
        iframeSrc: "/chat-embed.html?embed=1",
        panelWidth: "380px",
        panelHeight: "560px",
        overlay: true,
        escClose: true,
        iframeTitle: "Chat",
        allow: "clipboard-write",
        sandbox: "allow-scripts allow-forms allow-same-origin allow-popups",
        allowedOrigins: [], // p.ej. ["https://tu-dominio.com"]
        badge: "",          // "", "auto" o "N"
        autoinit: true,
    };

    const toBool = (val, def) => {
        if (val === undefined || val === null || val === "") return !!def;
        const s = String(val).toLowerCase();
        if (["true", "1", "yes"].includes(s)) return true;
        if (["false", "0", "no"].includes(s)) return false;
        return !!def;
    };
    const clampInt = (v, fb) => Number.isFinite(Number(v)) ? Number(v) : fb;
    const str = (v, fb) => (v == null || v === "" ? fb : String(v));
    const arr = (v) => String(v || "").split(",").map(s => s.trim()).filter(Boolean);

    function readAttrsFromScript(el) {
        return {
            iconUrl: str(el.getAttribute("data-avatar"), DEFAULTS.iconUrl),
            title: str(el.getAttribute("data-title"), DEFAULTS.title),
            buttonPosition: str(el.getAttribute("data-position"), DEFAULTS.buttonPosition),
            size: clampInt(el.getAttribute("data-size"), DEFAULTS.size),
            offset: clampInt(el.getAttribute("data-offset"), DEFAULTS.offset),
            zIndex: clampInt(el.getAttribute("data-z-index"), DEFAULTS.zIndex),
            iframeSrc: str(el.getAttribute("data-chat-url"), DEFAULTS.iframeSrc),
            panelWidth: str(el.getAttribute("data-panel-width"), DEFAULTS.panelWidth),
            panelHeight: str(el.getAttribute("data-panel-height"), DEFAULTS.panelHeight),
            overlay: toBool(el.getAttribute("data-overlay"), DEFAULTS.overlay),
            escClose: toBool(el.getAttribute("data-close-on-esc"), DEFAULTS.escClose),
            iframeTitle: str(el.getAttribute("data-iframe-title"), DEFAULTS.iframeTitle),
            allow: str(el.getAttribute("data-allow"), DEFAULTS.allow),
            sandbox: str(el.getAttribute("data-sandbox"), DEFAULTS.sandbox),
            allowedOrigins: arr(el.getAttribute("data-allowed-origins")),
            badge: str(el.getAttribute("data-badge"), DEFAULTS.badge),
            autoinit: toBool(el.getAttribute("data-autoinit"), DEFAULTS.autoinit),
        };
    }

    function getSavedSettings() {
        let state = { theme: "light", contrast: false, lang: "es" };
        try {
            const saved = JSON.parse(localStorage.getItem(LS_KEY) || "null");
            if (saved && typeof saved === "object") state = { ...state, ...saved };
        } catch { }
        return state;
    }
    const saveSettings = (s) => { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { } };

    function applyPanelSkin({ panel, header, overlay, state }) {
        if (state.theme === "dark") {
            panel.style.background = "#0f172a";
            panel.style.borderColor = "#1f2937";
            header.style.background = "#0b1220";
            if (overlay) overlay.style.background = "rgba(0,0,0,.35)";
            panel.style.color = "#e5e7eb";
        } else {
            panel.style.background = "#ffffff";
            panel.style.borderColor = "#e5e7eb";
            header.style.background = "#0f172a";
            if (overlay) overlay.style.background = "rgba(0,0,0,.12)";
            panel.style.color = "#111827";
        }
        panel.style.borderWidth = state.contrast ? "2px" : "1px";
    }

    function buildInstance(cfg) {
        const state = getSavedSettings();

        // Button
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", cfg.title);
        btn.setAttribute("title", cfg.title);
        btn.setAttribute("aria-expanded", "false");
        btn.style.cssText = `
      position:fixed;
      ${cfg.buttonPosition.includes("left") ? "left" : "right"}:${cfg.offset}px;
      bottom:${cfg.offset}px;
      width:${cfg.size}px; height:${cfg.size}px; border-radius:50%;
      border:none; padding:0; cursor:pointer; background:#fff;
      box-shadow:0 10px 20px rgba(0,0,0,.15);
      z-index:${cfg.zIndex + ONE};
    `;
        const img = document.createElement("img");
        img.src = cfg.iconUrl;
        img.alt = "Chatbot";
        img.style.cssText = `width:${cfg.size}px;height:${cfg.size}px;border-radius:50%;object-fit:cover;display:block;`;
        btn.appendChild(img);

        // Badge
        let badge;
        const setBadge = (n) => {
            if (!badge) {
                badge = document.createElement("span");
                badge.style.cssText = `
          position:absolute; ${cfg.buttonPosition.includes("left") ? "left" : "right"}:-6px; top:-6px;
          min-width:18px; height:18px; padding:0 4px; border-radius:999px; background:#ef4444;
          color:white; font: 11px/18px system-ui, sans-serif; text-align:center;
        `;
                btn.appendChild(badge);
            }
            badge.textContent = String(n);
            badge.style.display = n > 0 ? "inline-block" : "none";
        };
        if (cfg.badge && !isNaN(Number(cfg.badge))) setBadge(Number(cfg.badge));

        // Overlay
        const ov = document.createElement("div");
        ov.style.cssText = `
      position:fixed; inset:0; background:rgba(0,0,0,.12); display:none; z-index:${cfg.zIndex};
    `;

        // Panel
        const panel = document.createElement("div");
        panel.setAttribute("role", "dialog");
        panel.setAttribute("aria-modal", "true");
        panel.setAttribute("aria-label", "Chat");
        panel.style.cssText = `
      position:fixed;
      ${cfg.buttonPosition.includes("left") ? "left" : "right"}:${cfg.offset}px;
      bottom:${cfg.offset + cfg.size + 12}px;
      width:${cfg.panelWidth}; height:${cfg.panelHeight};
      background:white; border:1px solid #e5e7eb; border-radius:16px;
      box-shadow:0 10px 30px rgba(0,0,0,.15); overflow:hidden; display:none;
      z-index:${cfg.zIndex + ONE + ONE};
    `;

        // Header
        const header = document.createElement("div");
        header.style.cssText = `
      height:40px; background:#0f172a; color:#fff; display:flex; align-items:center; justify-content:space-between;
      padding:0 8px; font:13px/1 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Arial;
    `;
        header.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px">
        <img src="${cfg.iconUrl}" alt="Bot" style="width:22px;height:22px;border-radius:50%;object-fit:cover"/>
        <strong style="font-weight:600">${cfg.title || "Chat"}</strong>
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

        // Body
        const content = document.createElement("div");
        content.style.cssText = "width:100%; height:calc(100% - 40px);";
        panel.appendChild(content);

        // Responsive móvil
        const mq = window.matchMedia("(max-width: 480px)");
        const applyMobile = () => {
            if (mq.matches) {
                panel.style.width = "94vw";
                panel.style.height = "70vh";
                panel.style[cfg.buttonPosition.includes("left") ? "left" : "right"] = "3vw";
            } else {
                panel.style.width = cfg.panelWidth;
                panel.style.height = cfg.panelHeight;
                panel.style[cfg.buttonPosition.includes("left") ? "left" : "right"] = `${cfg.offset}px`;
            }
        };
        applyMobile();
        mq.addEventListener?.("change", applyMobile);

        // Iframe
        let frame;
        if (cfg.iframeSrc) {
            frame = document.createElement("iframe");
            frame.src = cfg.iframeSrc;
            frame.title = cfg.iframeTitle || "Chat";
            frame.loading = "eager";
            frame.referrerPolicy = "no-referrer";
            frame.allow = cfg.allow;
            frame.sandbox = cfg.sandbox;
            frame.style.cssText = "width:100%; height:100%; border:0;";
            content.appendChild(frame);
        }

        // Abrir/cerrar
        const open = () => {
            if (cfg.overlay) ov.style.display = "block";
            panel.style.display = "block";
            btn.setAttribute("aria-expanded", "true");
            if (cfg.badge === "auto") setBadge(0);
            if (frame && frame.contentWindow) {
                const target = (cfg.allowedOrigins && cfg.allowedOrigins[0]) || "*";
                frame.contentWindow.postMessage({ type: "chat:settings", ...state }, target);
                frame.contentWindow.postMessage({ type: "chat:visibility", open: true }, target);
            }
        };
        const close = () => {
            if (cfg.overlay) ov.style.display = "none";
            panel.style.display = "none";
            btn.setAttribute("aria-expanded", "false");
            if (frame && frame.contentWindow) {
                const target = (cfg.allowedOrigins && cfg.allowedOrigins[0]) || "*";
                frame.contentWindow.postMessage({ type: "chat:visibility", open: false }, target);
            }
        };

        btn.addEventListener("click", () => {
            const isOpen = panel.style.display === "block";
            isOpen ? close() : open();
        });
        if (cfg.overlay) {
            ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
        }
        if (cfg.escClose) {
            document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
        }

        // Montaje
        document.body.appendChild(btn);
        if (cfg.overlay) document.body.appendChild(ov);
        document.body.appendChild(panel);

        // Controles header
        const themeToggle = header.querySelector("#wgt-theme");
        const contrastToggle = header.querySelector("#wgt-contrast");
        const langSelect = header.querySelector("#wgt-lang");
        const closeBtn = header.querySelector("#wgt-close");

        // Estado inicial
        themeToggle.checked = state.theme === "dark";
        contrastToggle.checked = !!state.contrast;
        langSelect.value = state.lang || "es";

        const applyAndNotify = () => {
            applyPanelSkin({ panel, header, overlay: ov, state });
            saveSettings(state);
            if (frame && frame.contentWindow) {
                const target = (cfg.allowedOrigins && cfg.allowedOrigins[0]) || "*";
                frame.contentWindow.postMessage({ type: "chat:settings", ...state }, target);
            }
        };
        applyAndNotify();

        themeToggle.addEventListener("change", () => { state.theme = themeToggle.checked ? "dark" : "light"; applyAndNotify(); });
        contrastToggle.addEventListener("change", () => { state.contrast = contrastToggle.checked; applyAndNotify(); });
        langSelect.addEventListener("change", () => { state.lang = langSelect.value || "es"; applyAndNotify(); });
        closeBtn.addEventListener("click", close);

        // Badge "auto" (postMessage del iframe)
        if (cfg.badge === "auto") {
            window.addEventListener("message", (ev) => {
                try {
                    if (cfg.allowedOrigins.length && !cfg.allowedOrigins.includes(ev.origin)) return;
                    const { type, count } = ev.data || {};
                    if (type === "chat:badge" && typeof count === "number") {
                        const isOpen = panel.style.display === "block";
                        setBadge(isOpen ? 0 : count);
                    }
                } catch { }
            });
        }

        if (frame) {
            frame.addEventListener("load", () => {
                try {
                    const target = (cfg.allowedOrigins && cfg.allowedOrigins[0]) || "*";
                    frame.contentWindow.postMessage({ type: "chat:settings", ...state }, target);
                } catch { }
            });
        }

        return {
            cfg, btn, overlay: ov, panel, iframe: frame,
            open, close,
            destroy() { try { btn.remove(); ov.remove(); panel.remove(); } catch { } }
        };
    }

    function unmount() {
        const inst = window.__ChatWidgetInstance;
        if (!inst) return;
        inst.destroy();
        window.__ChatWidgetInstance = null;
        const st = document.querySelector('style[data-chat-widget]');
        if (st) st.remove();
    }

    function mount(options = {}) {
        unmount();
        const inst = buildInstance({ ...DEFAULTS, ...options });
        window.__ChatWidgetInstance = inst;
        return inst;
    }
    function open() { window.__ChatWidgetInstance?.open?.(); }
    function close() { window.__ChatWidgetInstance?.close?.(); }

    window.ChatWidget = { mount, unmount, open, close };

    // Auto-mount por data-attrs
    try {
        const el = document.currentScript;
        if (!el) return;
        const cfgFromAttrs = readAttrsFromScript(el);
        if (!cfgFromAttrs.autoinit) return;
        const hasAnyData = [
            "data-chat-url", "data-avatar", "data-title", "data-position", "data-panel-width", "data-panel-height"
        ].some(a => el.hasAttribute(a));
        if (hasAnyData) {
            mount({
                iconUrl: cfgFromAttrs.iconUrl,
                title: cfgFromAttrs.title,
                buttonPosition: cfgFromAttrs.buttonPosition,
                size: cfgFromAttrs.size,
                offset: cfgFromAttrs.offset,
                zIndex: cfgFromAttrs.zIndex,
                iframeSrc: cfgFromAttrs.iframeSrc,
                panelWidth: cfgFromAttrs.panelWidth,
                panelHeight: cfgFromAttrs.panelHeight,
                overlay: cfgFromAttrs.overlay,
                escClose: cfgFromAttrs.escClose,
                iframeTitle: cfgFromAttrs.iframeTitle,
                allow: cfgFromAttrs.allow,
                sandbox: cfgFromAttrs.sandbox,
                allowedOrigins: cfgFromAttrs.allowedOrigins,
                badge: cfgFromAttrs.badge,
            });
        }
    } catch { }
})();