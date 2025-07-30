// frontend/script.js
async function sendMessage() {
    const input = document.getElementById('userInput').value;
    const responseBox = document.getElementById('response');

    const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    responseBox.textContent = JSON.stringify(data, null, 2);
}
