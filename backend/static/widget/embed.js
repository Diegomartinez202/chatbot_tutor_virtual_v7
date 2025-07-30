(function () {
    const iframeUrl = "https://tu-dominio.com/static/widget/widget.html";
    const widgetId = "chatbot-tutor-widget";

    const userId =
        window.ZAJUNA_USER?.id ||
        localStorage.getItem("user_id") ||
        "anonimo";

    // Crear botón flotante
    const button = document.createElement("div");
    button.id = "chatbot-button";
    button.innerHTML = "💬 Tutor Zajuna";
    Object.assign(button.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "60px",
        height: "60px",
        backgroundColor: "#007bff",
        color: "white",
        borderRadius: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "24px",
        cursor: "pointer",
        zIndex: "9998",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
    });

    // Crear iframe oculto
    const iframe = document.createElement("iframe");
    iframe.id = widgetId;
    iframe.src = iframeUrl + "?user_id=" + encodeURIComponent(userId);
    Object.assign(iframe.style, {
        position: "fixed",
        bottom: "90px",
        right: "20px",
        width: "360px",
        height: "500px",
        border: "none",
        borderRadius: "10px",
        display: "none",
        zIndex: "9999",
        boxShadow: "0 0 15px rgba(0,0,0,0.2)"
    });

    // 👇 Función para marcar como leídos
    async function marcarMensajesLeidos(userId) {
        try {
            const res = await fetch(`https://tu-dominio.com/api/logs/mark_read?user_id=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const data = await res.json();
            console.log("Mensajes marcados como leídos:", data.updated_count);
            document.getElementById("chatbot-badge")?.classList.add("hidden");
        } catch (err) {
            console.error("Error al marcar como leídos:", err);
        }
    }

    // Mostrar/ocultar iframe al hacer clic
    button.addEventListener("click", () => {
        const isVisible = iframe.style.display === "block";
        iframe.style.display = isVisible ? "none" : "block";
        if (!isVisible) {
            marcarMensajesLeidos(userId); // ✅ Llama cuando se abre
            const badge = document.getElementById("chatbot-badge");
            if (badge) badge.style.display = "none";
        }
    });

    // Agregar elementos al DOM
    document.body.appendChild(button);
    document.body.appendChild(iframe);

    // Mostrar automáticamente si se accede con #abrir-bot
    if (window.location.hash === "#abrir-bot") {
        iframe.style.display = "block";
        marcarMensajesLeidos(userId); // ✅ También desde URL directa
    }

    // 🔁 Polling cada 30 segundos para ver si hay nuevos mensajes 
    setInterval(async () => {
        try {
            const response = await fetch(`https://tu-dominio.com/api/logs/unread_count?user_id=${userId}`);
            const data = await response.json();
            const hasUnread = data.unread > 0;

            if (hasUnread && !document.getElementById("chatbot-badge")) {
                const badge = document.createElement("div");
                badge.id = "chatbot-badge";
                Object.assign(badge.style, {
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "red",
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "2px solid white"
                });
                button.appendChild(badge);
            } else if (!hasUnread) {
                const existing = document.getElementById("chatbot-badge");
                if (existing) existing.remove();
            }
        } catch (err) {
            console.error("Error en polling:", err);
        }
    }, 30000);
})();