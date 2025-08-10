(() => {
    const el = document.currentScript;

    // ====== Par�metros ======
    const avatar = el.getAttribute("data-avatar") || "/bot-avatar.png";
    const chatUrl = el.getAttribute("data-chat-url") || null; // ej: /chat-embed.html?src=...
    const title = el.getAttribute("data-title") || "Abrir chat";
    const size = Number(el.getAttribute("data-size") || 64); // px launcher
    const zBase = Number(el.getAttribute("data-z-index") || 2147483600);

    const pos = el.getAttribute("data-position") || "bottom-right"; // "bottom-right" | "bottom-left"
    const offset = Number(el.getAttribute("data-offset") || 24);       // px respecto a borde
    const pWidth = el.getAttribute("data-panel-width") || "380px";
    const pHeight = el.getAttribute("data-panel-height") || "560px";

    const overlay = (el.getAttribute("data-overlay") || "true") !== "false";
    const escClose = (el.getAttribute("data-close-on-esc") || "true") !== "false";
    const badgeStr = el.getAttribute("data-badge") || ""; // "", "auto" o n�mero "3"
    const iframeTitle = el.getAttribute("data-iframe-title") || "Chat";

    // ====== Launcher (bot�n) ======
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
            btn.style.position = "fixed"; // asegurar posicionamiento
            btn.appendChild(badge);
        }
        badge.textContent = String(n);
        badge.style.display = n > 0 ? "inline-block" : "none";
    };
    if (badgeStr && !isNaN(Number(badgeStr))) setBadge(Number(badgeStr));

    // ====== Overlay (click fuera) ======
    const ov = document.createElement("div");
    ov.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,.12); display:none; z-index:${zBase};
  `;

    // ====== Panel (dialog accesible) ======
    const panel = document.createElement("div");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Chat");
    panel.style.cssText = `
    position:fixed; ${pos.includes("left") ? "left" : "right"}:${offset}px; bottom:${offset + size + 12}px;
    width:${pWidth}; height:${pHeight}; background:white; border:1px solid #e5e7eb; border-radius:16px;
    box-shadow:0 10px 30px rgba(0,0,0,.15); overflow:hidden; display:none; z-index:${zBase + 2};
  `;

    // Responsive r�pido
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

    // Contenido del panel (iframe o placeholder)
    if (chatUrl) {
        const frame = document.createElement("iframe");
        frame.src = chatUrl;
        frame.title = iframeTitle;
        frame.loading = "eager";
        frame.style.cssText = "width:100%; height:100%; border:0;";
        panel.appendChild(frame);
    } else {
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:flex;align-items:center;justify-content:center;height:100%;color:#6b7280;font:14px system-ui, sans-serif;text-align:center;padding:16px;";
        wrap.innerHTML = `
      <div>
        <img src="${avatar}" alt="Bot" style="width:80px;height:80px;border-radius:50%;object-fit:cover;display:block;margin:0 auto 8px"/>
        <div>Configura <code>data-chat-url</code> en el script del widget.</div>
      </div>`;
        panel.appendChild(wrap);
    }

    // ====== abrir/cerrar ======
    const open = () => {
        if (overlay) ov.style.display = "block";
        panel.style.display = "block";
        btn.setAttribute("aria-expanded", "true");
        // Si el badge es "auto", al abrir lo ocultamos
        if (badgeStr === "auto") setBadge(0);
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

    // ====== montar ======
    document.body.appendChild(btn);
    if (overlay) document.body.appendChild(ov);
    document.body.appendChild(panel);

    // ====== (Opcional) contador "auto": escucha mensajes del iframe para notificaciones ======
    // Desde dentro del chat (en tu widget), puedes hacer:
    // window.parent.postMessage({ type: "chat:badge", count: 3 }, "*")
    if (badgeStr === "auto") {
        window.addEventListener("message", (ev) => {
            try {
                const { type, count } = ev.data || {};
                if (type === "chat:badge" && typeof count === "number") {
                    // si el panel est� cerrado, muestra el contador
                    const isOpen = panel.style.display === "block";
                    setBadge(isOpen ? 0 : count);
                }
            } catch { }
        });
    }
})();