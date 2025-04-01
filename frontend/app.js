// static/app.js
let ws = new WebSocket("ws://localhost:8080/ws");

function tryParseJsonMessage(message) {
    try {
        if (typeof message === "string" && message.startsWith("{")) {
            return JSON.parse(message).description || message;
        }
    } catch (e) {
        // 解析失敗，返回原始訊息
    }
    return message;
}

ws.onmessage = function(event) {
    let data = JSON.parse(event.data);
    let output = document.getElementById("output");
    switch (data.type) {
        case "command_result":
        case "broadcast":
        case "global_broadcast":
            output.textContent += output.textContent += tryParseJsonMessage(data.message) + "\n";
            break;
        case "stats":
            document.getElementById("player-info").innerHTML = formatPlayerInfo(data.data);
            break;
        case "player_update":
            document.getElementById("player-info").innerHTML = formatPlayerInfo(data.player);
            break;
        case "room_update":
            document.getElementById("room-info").innerHTML = formatRoomInfo(data.room);
            break;
        case "error":
            output.textContent += `Error: ${data.message}\n`;
            break;
        case "login_success":
            output.textContent += `${data.message}\n`;
            break;
        case "two":
            renderShapes(data.data, "two-obj");
            break;
        default:
            if (data.message) {
                output.textContent += output.textContent += tryParseJsonMessage(data.message) + "\n";
            } else {
                output.textContent += "收到未定義的訊息類型: " + JSON.stringify(data) + "\n";
            }
            break;
    }
};

function sendCommand() {
    let cmd = document.getElementById("command").value;
    if (cmd !== "") {
        ws.send(cmd);
        document.getElementById("command").value = "";
    }
}

function formatPlayerInfo(data) {
    renderShapes(data.avatar, "player-avatar");
    return `
        <p>Name: ${data.name || "Unknown"}</p>
        <p>Level: ${data.level}</p>
        <p>HP: ${data.hp}</p>
        <p>MP: ${data.mp}</p>
        <p>SP: ${data.strength}</p>
        <p>AP: ${data.agility}</p>
        <p>WT: ${data.weight}</p>
    `;
}

function formatRoomInfo(room) {
    return `
        <p>Room: ${room.id}</p>
        <p>Description: ${room.description}</p>
    `;
}

document.getElementById("command").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendCommand();
    }
});
