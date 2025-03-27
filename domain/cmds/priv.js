// domain/cmds/priv.js
function priv(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "priv_help", {
            usage: "priv <player_name>",
            description: "Toggle admin privileges for a specified player (admin only)."
        });
    }

    if (!player.isAdmin) {
        broadcastToArea("You don't have permission to use this command.", player.x, player.y, false, player.id);
        return;
    }

    if (!args) {
        broadcastToArea("Usage: priv <player>", player.x, player.y, false, player.id);
        return;
    }

    let target = Player.load(args); // args 是 name
    if (!target) {
        broadcastToArea("No such player found.", player.x, player.y, false, player.id);
        return;
    }

    // 切換目標玩家的 isAdmin 狀態
    target.isAdmin = !target.isAdmin;
    target.save(); // 更新檔案

    // 檢查目標玩家是否在線，若在線則同步更新
    for (let playerId in players) {
        if (players[playerId].name === target.name) {
            players[playerId].isAdmin = target.isAdmin;
            broadcastToArea(`${player.name} has ${target.isAdmin ? "granted" : "revoked"} admin privileges for ${target.name}.`, players[playerId].x, players[playerId].y, false, "");
            break;
        }
    }

    broadcastToArea(`Admin status of ${target.name} changed to ${target.isAdmin}.`, player.x, player.y, false, player.id);
}
