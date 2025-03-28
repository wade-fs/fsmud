// static/app.js
let ws = new WebSocket("ws://localhost:8080/ws");

ws.onmessage = function(event) {
    let data = JSON.parse(event.data);
    let output = document.getElementById("output");
    switch (data.type) {
        case "command_result":
        case "broadcast":
        case "global_broadcast":
            // 如果 message 是 JSON 字串，嘗試解析
            let message = data.message;
            try {
                if (typeof message === "string" && message.startsWith("{")) {
                    message = JSON.parse(message).description || data.message;
                }
            } catch (e) {
                // 如果解析失敗，直接使用原始 message
            }
            output.textContent += message + "\n";
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
        default:
            // 處理未知的 type
            if (data.message) {
                let defaultMessage = data.message;
                try {
                    if (typeof defaultMessage === "string" && defaultMessage.startsWith("{")) {
                        defaultMessage = JSON.parse(defaultMessage).description || data.message;
                    }
                } catch (e) {
                    // 如果解析失敗，直接使用原始 message
                }
                output.textContent += defaultMessage + "\n";
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
    return `
        <p>Name: ${data.name || "Unknown"}</p>
        <p>Level: ${data.level}</p>
        <p>HP: ${data.hp}</p>
        <p>MP: ${data.mp}</p>
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
