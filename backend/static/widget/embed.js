(function () {
    // ====== Config por atributos del <script> ======
    const script = document.currentScript || (function () {
        const scripts = document.getElementsByTagName("script");
        return scripts[scripts.length - 1];
    })();

    const base = script.getAttribute("data-base") || location.origin;      // dominio base del backend
    const avatar = script.getAttribute("data-avatar") || base + "/static/widgets/bot-avatar.png";
    const chatEmbed = script.getAttribute("data-embed") || (base + "/chat-embed.html");
    const apiBase = script.getAttribute("data-api") || (base + "/api");    // para marcar leídos / unread_count
    const size = script.getAttribute("data-size") || "64";                 // px
    const accent = script.getAttribute("data-accent") || "#007bff";

    const userId =
        window.ZAJUNA_USER?.id ||
        localStorage.getItem("user_id") ||
        "anonimo";

    // ====== Botón flotante ======
    const button = document.createElement("button");
    button.id = "chatbot-button";
    button.setAttribute("aria-label", "Abrir chat");
    button.style.cssText = `
    position:fixed; bottom:24px; right:24px;
    width:${size}px; height:${size}px; border-radius:50%;
    border:none; padding:0; cursor:pointer; background:white;
    box-shadow:0 10px 20px rgba(0,0,0,.15);
    z-index:2147483647;
  `;
    const img = document.createElement("img");
    img.src = avatar;
    img.alt = "Chatbot";
    img.style.cssText = "width:100%; height:100%; border-radius:50%; object-fit:cover;";
    button.appendChild(img);

    // Badge (no-leídos)
    const badge = document.createElement("span");
    badge.id = "chatbot-badge";
    Object.assign(badge.style, {
        position: "absolute",
        top: "-2px",
        right: "-2px",
        width: "16px",
        height: "16px",
        backgroundColor: "red",
        borderRadius: "50%",
        border: "2px solid white",
        display: "none"
    });
    button.style.position = "fixed";
    button.style.overflow = "visible";
    button.appendChild(badge);

    // ====== Panel (iframe) ======
    const panel = document.createElement("div");
    panel.style.cssText = `
    position:fixed; right:24px; bottom:${parseInt(size, 10) + 20}px;
    width:380px; height:560px; background:white;
    border:1px solid #e5e7eb; border-radius:16px;
    box-shadow:0 10px 30px rgba(0,0,0,.15);
    overflow:hidden; display:none; z-index:2147483647;
  `;

    // Construir URL del embed con params
    const srcWidget = base + "/static/widgets/widget.html";
    const chatUrl = chatEmbed
        + "?src=" + encodeURIComponent(srcWidget)
        + "&api=" + encodeURIComponent(apiBase)
        + "&user_id=" + encodeURIComponent(userId);

    const iframe = document.createElement("iframe");
    iframe.src = chatUrl;
    iframe.style.cssText = "width:100%; height:100%; border:0;";
    panel.appendChild(iframe);

    // Toggle
    button.addEventListener("click", () => {
        const visible = panel.style.display === "block";
        panel.style.display = visible ? "none" : "block";
        if (!visible) {
            marcarLeidos();
            badge.style.display = "none";
        }
    });

    // Cerrar haciendo click fuera (opc)
    document.addEventListener("click", (e) => {
        if (!panel.contains(e.target) && !button.contains(e.target)) {
            panel.style.display = "none";
        }
    });

    // Agregar al DOM
    document.body.appendChild(button);
    document.body.appendChild(panel);

    // Auto-abrir con hash
    if (location.hash === "#abrir-bot") {
        panel.style.display = "block";
        marcarLeidos();
        badge.style.display = "none";
    }

    // ====== Polling de no-leídos ======
    async function updateBadge() {
        try {
            const r = await fetch(apiBase + "/logs/unread_count?user_id=" + encodeURIComponent(userId));
            const data = await r.json();
            if (data?.unread > 0) {
                badge.style.display = "block";
            } else {
                badge.style.display = "none";
            }
        } catch (e) {
            // silencio
        }
    }

    async function marcarLeidos() {
        try {
            await fetch(apiBase + "/logs/mark_read?user_id=" + encodeURIComponent(userId), { method: "POST" });
        } catch (e) { }
    }

    setInterval(updateBadge, 30000); // cada 30s
    updateBadge();
})();