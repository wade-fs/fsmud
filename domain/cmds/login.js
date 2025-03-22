// domain/cmds/login.js
function login(player, args) {
    if (player.username) {
        return i18n(player.lang, "already_logged_in");
    }
    let parts = args.trim().split(" ");
    if (parts.length < 2) {
        return i18n(player.lang, "login_usage");
    }
    let username = parts[0];
    let password = parts[1];

    let playerData = Player.load(username);
    if (playerData) {
        if (playerData.password !== password) {
            return i18n(player.lang, "incorrect_password");
        }
        const tempId = player.id; // 保存 Go 注入的臨時 PlayerID
        Object.assign(player, playerData);
        player.id = tempId; // 保留臨時 PlayerID
        if (player.location) {
            player.room = null;
        } else if (!player.room) {
            player.room = "entrance";
        }
        players[player.id] = player; // 使用臨時 PlayerID
        players[player.uuid] = player; // 使用永久 UUID
        broadcastToRoom("player_logged_in", { username: player.username }, player.room || player.location.map, "");
        return i18n(player.lang, "welcome_back", { username: player.username });
    } else {
        player.username = username;
        player.password = password;
        player.room = "entrance";
        player.location = null;
        players[player.id] = player; // 使用臨時 PlayerID
        players[player.uuid] = player; // 使用永久 UUID
        broadcastToRoom("player_joined", { username: player.username }, player.room, "");
        return i18n(player.lang, "welcome_new", { username });
    }
}
