// domain/cmds/login.js
function login(player, args) {
    if (player.username) {
        return "You are already logged in!";
    }
    let parts = args.trim().split(" ");
    if (parts.length < 2) {
        return "Please use: login <username> <password>";
    }
    let username = parts[0];
    let password = parts[1];

    let playerData = Player.load(username); // 嘗試載入現有玩家
    if (playerData) {
        // 帳號存在，驗證密碼
        if (playerData.password !== password) {
            return "Incorrect password!";
        }
        // 登入成功
        Object.assign(player, playerData);
        player.save();
        players[player.id] = player;
        broadcastToRoom(`${player.username} has logged in!`, player.room, false, "");
        return `Welcome back, ${player.username}! Type 'look' to start.`;
    } else {
        // 帳號不存在，自動註冊
        player.username = username;
        player.password = password; // 注意：應加密
        player.save(); // 儲存到 domain/players/<username>.json
        players[player.id] = player;
        broadcastToRoom(`${player.username} has joined the game!`, player.room, false, "");
        return `Welcome, ${username}! You are now registered and logged in. Type 'look' to start.`;
    }
}
