// domain/scripts/broadcast.js

function broadcastToArea(message, x, y, excludeId) {
    for (let p of Object.values(cache.players)) {
        if (Math.abs(p.x - x) <= 2 && Math.abs(p.y - y) <= 2 && p.id !== excludeId) {
            if (p.connectionType === "websocket") {
                msg = JSON.stringify({ type: "broadcast", message: msg });
            }
            sendToPlayer(p.id, message);
        }
    }
}

function broadcastGlobal(key, params) {
    for (let playerId in players) {
        if (!playerId.startsWith("temp_")) continue;
        let player = players[playerId];
        let msg = i18n(player.lang, key, params);
        if (player.connectionType === "websocket") {
            msg = JSON.stringify({ type: "global_broadcast", message: msg });
        }
        sendToPlayer(playerId, msg);
    }
}
