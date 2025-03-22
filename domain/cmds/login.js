// domain/cmds/login.js

function login(player, args) {
    // 如果玩家已登入
    if (player.username) {
        return player.connectionType === "websocket"
            ? JSON.stringify({ type: "error", message: "You are already logged in." })
            : "You are already logged in.";
    }

    // 解析參數：login <username> <password>
    let parts = args.trim().split(" ");
    if (parts.length < 2) {
        return player.connectionType === "websocket"
            ? JSON.stringify({ type: "error", message: "Usage: login <username> <password>" })
            : "Usage: login <username> <password>";
    }

    let username = parts[0];
    let password = parts[1];

    // 檢查玩家資料是否存在
    let playerData = Player.load(username);
    if (playerData) {
        if (playerData.password !== password) {
            return player.connectionType === "websocket"
                ? JSON.stringify({ type: "error", message: "Incorrect password." })
                : "Incorrect password.";
        }
        Object.assign(player, playerData);
        player.room = playerData.room;
        log("Info", "look", JSON.stringify(player));
        return player.connectionType === "websocket"
            ? JSON.stringify({ type: "login_success", message: `Welcome back, ${username}!` })
            : `Welcome back, ${username}!`;
    } else {
        log("Info", "look", "Cannot load player data.");
        player.username = username;
        player.password = password;
        player.room = "entrance";
        return player.connectionType === "websocket"
            ? JSON.stringify({ type: "login_success", message: `Welcome, new player ${username}!` })
            : `Welcome, new player ${username}!`;
    }
}
