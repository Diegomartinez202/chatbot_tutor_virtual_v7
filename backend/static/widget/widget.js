const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("user_id") || "anonimo";
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
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        const botReply = data?.responses?.[0]?.text || "🤖 No tengo respuesta para eso todavía.";
        document.querySelectorAll(".msg.bot").slice(-1)[0].textContent = botReply;
    } catch (err) {
        document.querySelectorAll(".msg.bot").slice(-1)[0].textContent = "❌ Error de conexión con el chatbot.";
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

    // Construir payload para activar acción personalizada
    const payload = {
        sender: userId,
        message: `/enviar_soporte{"nombre": "${nombre}", "email": "${email}", "mensaje": "${mensaje}"}`
    };

    fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-User-Id": userId
        },
        body: JSON.stringify(payload)
    });

    document.getElementById("soporte-nombre").value = "";
    document.getElementById("soporte-email").value = "";
    document.getElementById("soporte-mensaje").value = "";

    alert("✅ Formulario enviado. Te contactaremos pronto.");
}

// Mostrar carrusel automáticamente
document.getElementById("carrusel-cursos").style.display = "block";

// Exportar funciones
window.showSubmenu = showSubmenu;
window.backToMain = backToMain;
window.enviarSoporte = enviarSoporte;