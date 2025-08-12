(function () {
    const script = document.currentScript || (function () {
        const s = document.getElementsByTagName("script");
        return s[s.length - 1];
    })();

    const base = script.getAttribute("data-base") || location.origin;        // backend base
    const avatar = script.getAttribute("data-avatar") || (base + "/bot-avatar.png");
    const chatEmbed = script.getAttribute("data-embed") || (base + "/chat-embed.html"); // canónica
    const apiBase = script.getAttribute("data-api") || (base + "/api");
    const size = script.getAttribute("data-size") || "64";
    const userId = window.ZAJUNA_USER?.id || localStorage.getItem("user_id") || "anonimo";

    // botón flotante
    const btn = document.createElement("button");
    btn.setAttribute("aria-label", "Abrir chat");
    btn.style.cssText = `
    position:fixed; bottom:24px; right:24px; width:${size}px; height:${size}px;
    border:none; border-radius:50%; cursor:pointer; background:#fff;
    box-shadow:0 10px 20px rgba(0,0,0,.15); z-index:2147483647; padding:0; overflow:visible;
  `;
    const img = document.createElement("img");
    img.src = avatar; img.alt = "Chatbot";
    img.style.cssText = "width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;";
    btn.appendChild(img);

    // badge
    const badge = document.createElement("span");
    Object.assign(badge.style, {
        position: "absolute", top: "-2px", right: "-2px",
        width: "16px", height: "16px", backgroundColor: "red", color: "#fff",
        borderRadius: "50%", border: "2px solid white", display: "none",
        font: "11px/16px system-ui, sans-serif", textAlign: "center"
    });
    btn.appendChild(badge);

    // panel
    const panel = document.createElement("div");
    panel.style.cssText = `
    position:fixed; right:24px; bottom:${parseInt(size, 10) + 20}px;
    width:380px; height:560px; background:#fff; border:1px solid #e5e7eb; border-radius:16px;
    box-shadow:0 10px 30px rgba(0,0,0,.15); overflow:hidden; display:none; z-index:2147483647;
  `;

    // URL del embed + params
    const qs = new URLSearchParams();
    qs.set("embed", "1");
    qs.set("api", apiBase);
    qs.set("user_id", userId);

    const iframe = document.createElement("iframe");
    iframe.src = `${chatEmbed}?${qs.toString()}`;
    iframe.style.cssText = "width:100%; height:100%; border:0;";
    iframe.referrerPolicy = "no-referrer";
    iframe.sandbox = "allow-scripts allow-forms allow-same-origin allow-popups";
    iframe.allow = "clipboard-write";
    panel.appendChild(iframe);

    // toggle
    btn.addEventListener("click", () => {
        const visible = panel.style.display === "block";
        panel.style.display = visible ? "none" : "block";
        if (!visible) {
            marcarLeidos().catch(() => { });
            badge.style.display = "none";
        }
    });

    // cerrar haciendo click fuera (opcional)
    document.addEventListener("click", (e) => {
        if (!panel.contains(e.target) && !btn.contains(e.target)) {
            panel.style.display = "none";
        }
    });

    // DOM
    document.body.appendChild(btn);
    document.body.appendChild(panel);

    // auto‑abrir con hash
    if (location.hash === "#abrir-bot") {
        panel.style.display = "block";
        marcarLeidos().catch(() => { });
        badge.style.display = "none";
    }

    // polling de no‑leídos (si tu backend lo expone)
    async function updateBadge() {
        try {
            const r = await fetch(`${apiBase}/logs/unread_count?user_id=${encodeURIComponent(userId)}`);
            const data = await r.json();
            badge.style.display = data?.unread > 0 ? "block" : "none";
        } catch { }
    }
    async function marcarLeidos() {
        try {
            await fetch(`${apiBase}/logs/mark_read?user_id=${encodeURIComponent(userId)}`, { method: "POST" });
        } catch { }
    }
    setInterval(updateBadge, 30000);
    updateBadge();
})();