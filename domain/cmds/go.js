// domain/cmds/go.js

function go(player, direction) {
    if (direction === "-h" || direction === "--help") {
        return i18n(player.lang, "go_help", {
            usage: "go <direction>",
            description: "Move to an adjacent tile in the specified direction (north, south, east, west).",
            examples: "go north, go east"
        });
    }

    let newX = player.x;
    let newY = player.y;

    switch (direction) {
        case "north": newY--; break;
        case "south": newY++; break;
        case "east": newX++; break;
        case "west": newX--; break;
        default: return "Invalid direction.";
    }

    if (currentArea.isPassable(newX, newY)) {
        player.x = newX;
        player.y = newY;
        player.save();
        broadcastToArea(`${player.name} moved ${direction}.`, player.x, player.y, player.id);
        return look(player, ""); // 顯示新位置的描述
    } else {
        return "You cannot go that way.";
    }
}

function broadcastToArea(message, x, y, excludeId) {
    for (let p of Object.values(players)) {
        if (p.x === x && p.y === y && p.id !== excludeId) {
            sendToPlayer(p.id, message);
        }
    }
}
