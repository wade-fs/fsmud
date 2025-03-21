// domain/cmds/priv.js
function priv(player, args) {
    if (!player.isAdmin) {
        broadcastToRoom("You don't have permission to use this command.", player.room, false, player.id);
        return;
    }

    if (!args) {
        broadcastToRoom("Usage: priv <player>", player.room, false, player.id);
        return;
    }

    let target = Player.load(args); // args 是 username
    if (!target) {
        broadcastToRoom("No such player found.", player.room, false, player.id);
        return;
    }

    // 切換目標玩家的 isAdmin 狀態
    target.isAdmin = !target.isAdmin;
    target.save(); // 更新檔案

    // 檢查目標玩家是否在線，若在線則同步更新
    for (let playerId in players) {
        if (players[playerId].username === target.username) {
            players[playerId].isAdmin = target.isAdmin;
            broadcastToRoom(`${player.username} has ${target.isAdmin ? "granted" : "revoked"} admin privileges for ${target.username}.`, players[playerId].room, false, "");
            break;
        }
    }

    broadcastToRoom(`Admin status of ${target.username} changed to ${target.isAdmin}.`, player.room, false, player.id);
}
