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

document.addEventListener("DOMContentLoaded", function() {
    // 動態創建 #graphics div 並插入 #left-panel
    var leftPanel = document.getElementById("left-panel");
    var graphicsDiv = document.createElement("div");
    graphicsDiv.id = "graphics";
    graphicsDiv.style.height = "200px"; // 設定高度以容納圖形
    // 在 #room-info 之前插入
    leftPanel.insertBefore(graphicsDiv, document.getElementById("room-info"));

    // 初始化 Two.js
    var params = { width: 280, height: 200 }; // 設定畫布大小
    var two = new Two(params).appendTo(graphicsDiv);

    // 繪製一個矩形
    var rect = two.makeRectangle(140, 100, 100, 50); // 中心點 (140, 100)，寬 100，高 50
    rect.fill = "#FF8000"; // 填充橘色
    rect.stroke = "orangered"; // 邊框為橙紅色
    rect.linewidth = 5; // 邊框寬度

    // 繪製一個圓形
    var circle = two.makeCircle(140, 100, 30); // 中心點 (140, 100)，半徑 30
    circle.fill = "#00FF00"; // 填充綠色
    circle.stroke = "green"; // 邊框為深綠色
    circle.linewidth = 3; // 邊框寬度

    // 更新畫面以顯示圖形
    two.update();
});
