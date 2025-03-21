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
        // 清除預設位置，根據載入資料設置
        player.room = null;
        player.location = null;
        Object.assign(player, playerData);
        // 優先使用 location，如果不存在則使用 room
        if (player.location) {
            player.room = null; // 確保 room 不干擾
        } else if (!player.room) {
            player.room = "entrance"; // 預設位置
        }
        players[player.id] = player;
        broadcastToRoom(`${player.username} has logged in!`, player.room || player.location.map, false, "");
        return `Welcome back, ${player.username}! Type 'look' to start.`;
    } else {
        // 帳號不存在，自動註冊
        player.username = username;
        player.password = password; // 注意：應加密
        player.room = "entrance"; // 新玩家預設在 entrance
        player.location = null;
        players[player.id] = player;
        broadcastToRoom(`${player.username} has joined the game!`, player.room, false, "");
        return `Welcome, ${username}! You are now registered and logged in. Type 'look' to start.`;
    }
}
