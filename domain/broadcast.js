// domain/broadcast.js
function broadcastToRoom(key, params, roomId, excludeId) {
    for (let playerId in players) {
        if (!playerId.startsWith("temp_")) continue; // 只處理臨時 PlayerID
        let player = players[playerId];
        if (player.room === roomId && playerId !== excludeId) {
            let msg = i18n(player.lang, key, params);
            sendToPlayer(playerId, msg);
        }
    }
}

function broadcastGlobal(key, params) {
    for (let playerId in players) {
        if (!playerId.startsWith("temp_")) continue; // 只處理臨時 PlayerID
        let player = players[playerId];
        let msg = i18n(player.lang, key, params);
        sendToPlayer(playerId, msg);
    }
}
