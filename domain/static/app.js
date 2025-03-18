const ws = new WebSocket("ws://localhost:8080/ws");

ws.onmessage = function(event) {
    document.getElementById("output").textContent += event.data + "\n";
};

function sendCommand() {
    const cmd = document.getElementById("command").value;
    ws.send(cmd);
}

