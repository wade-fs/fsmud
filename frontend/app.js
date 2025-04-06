// frontend/app.js
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
    let output = document.getElementById("output");
    var rawData = event.data;
    var data;

    try {
        data = JSON.parse(rawData);
    } catch (e) {
        console.log("收到非 JSON 資料:", rawData);
        output.textContent += rawData + "\n";
        return;
    }

    switch (data.type) {
        case "command_result":
        case "broadcast":
        case "global_broadcast":
            output.textContent += tryParseJsonMessage(data.message) + "\n";
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
        case "stats":
            document.getElementById("player-info").innerHTML = formatPlayerInfo(data.data);
            break;
        case "two":
            let twoDivId = "two-obj";
            let div = document.getElementById(twoDivId);
            if (!twoInstances[twoDivId]) {
                twoInstances[twoDivId] = new Two({ width: div.offsetWidth, height: div.offsetHeight }).appendTo(div);
            }
            let two = twoInstances[twoDivId];
            renderShape(data.data, two);
            two.update();
            break;
        default:
            if (data.message) {
                output.textContent += tryParseJsonMessage(data.message) + "\n";
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
