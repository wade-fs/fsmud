// domain/cmds/talk.js
function talk(player, args) {
    if (!args) {
        return i18n(player.lang, "talk_usage");
    }

    let parts = args.trim().split(" ");
    if (parts.length < 2) {
        return i18n(player.lang, "talk_usage");
    }

    let targetUsername = parts[0];
    let message = parts.slice(1).join(" ");

    // 檢查目標玩家是否存在
    let targetPlayer = null;
    for (let p of Object.values(players)) {
        if (p.username === targetUsername) {
            targetPlayer = p;
            break;
        }
    }

    if (!targetPlayer) {
        return i18n(player.lang, "talk_player_not_found", { target: targetUsername });
    }

    // 生成訊息並發送給目標玩家
    let targetMsg = i18n(targetPlayer.lang, "talk_received", {
        sender: player.username,
        message
    });

    if (typeof sendToPlayer !== 'function') {
        log("Error: sendToPlayer is not defined. Cannot send message.");
        return "Error: Unable to send message due to system configuration.";
    }

    log("Info", "talk", `sendToPlayer(${targetPlayer.id})`, targetMsg);
    sendToPlayer(targetPlayer.id, targetMsg); // 使用臨時 PlayerID

    // 返回發送者確認訊息
    return i18n(player.lang, "talk_sent", {
        target: targetUsername,
        message
    });
}
