// backend/static/widgets/widget.js
const params = new URLSearchParams(location.search);
const apiBase = params.get("api") || "/api";
const userId = params.get("user_id") || "anonimo";

const messagesDiv = document.getElementById("messages");
const inputForm = document.getElementById("input-form");
const userInput = document.getElementById("user-input");

function addMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("msg", sender);
    msgDiv.textContent = text;
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showSubmenu(name) {
    document.querySelector(".menu-buttons").style.display = "none";
    document.querySelectorAll(".submenu").forEach(el => el.style.display = "none");
    document.getElementById(`submenu-${name}`).style.display = "flex";
}
function backToMain() {
    document.querySelector(".menu-buttons").style.display = "flex";
    document.querySelectorAll(".submenu").forEach(el => el.style.display = "none");
}

inputForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";
    addMessage("⏳ Pensando...", "bot");

    try {
        const res = await fetch(apiBase + "/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-User-Id": userId },
            body: JSON.stringify({ sender: userId, message })
        });
        const data = await res.json();
        const botReply = data?.responses?.[0]?.text || "🤖 No tengo respuesta para eso todavía.";
        const bots = Array.from(document.querySelectorAll(".msg.bot"));
        if (bots.length) bots[bots.length - 1].textContent = botReply;
    } catch (err) {
        const bots = Array.from(document.querySelectorAll(".msg.bot"));
        if (bots.length) bots[bots.length - 1].textContent = "❌ Error de conexión con el chatbot.";
    }
});

function enviarSoporte() {
    const nombre = document.getElementById("soporte-nombre").value;
    const email = document.getElementById("soporte-email").value;
    const mensaje = document.getElementById("soporte-mensaje").value;

    if (!nombre || !email || !mensaje) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const payload = {
        sender: userId,
        message: `/enviar_soporte{"nombre":"${nombre}","email":"${email}","mensaje":"${mensaje}"}`
    };

    fetch(apiBase + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": userId },
        body: JSON.stringify(payload)
    });

    document.getElementById("soporte-nombre").value = "";
    document.getElementById("soporte-email").value = "";
    document.getElementById("soporte-mensaje").value = "";
    alert("✅ Formulario enviado. Te contactaremos pronto.");
}

// demo
document.getElementById("carrusel-cursos").style.display = "block";

// exportar helpers
window.showSubmenu = showSubmenu;
window.backToMain = backToMain;
window.enviarSoporte = enviarSoporte;
