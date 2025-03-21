// domain/cmds/go.js
function go(player, direction) {
    if (player.room) {
        let room = Room.load(player.room);
        if (!room) {
            return "You are in an invalid room.";
        }
        let exit = room.exits[direction];
        if (!exit) {
            return "No exit in that direction.";
        }
        if (typeof exit === "string") {
            player.room = exit;
            player.location = null;
        } else if (exit.map) {
            player.room = null;
            player.location = { map: exit.map, x: exit.x || 0, y: exit.y || 0 };
            let newMap = GameMap.load(exit.map);
            if (!newMap) {
                return `Failed to enter ${exit.map}. The map is inaccessible.`;
            }
        } else {
            return "Invalid exit configuration.";
        }
        player.save();
        broadcastToRoom(`${player.username} moved ${direction}.`, room.id, false, player.id);
        return this.look(player, "");
    }

    if (!player.location || !player.location.map) {
        return "You are lost in a void.";
    }

    let map = GameMap.load(player.location.map);
    if (!map) {
        return "You are lost in a void.";
    }

    let { x, y } = player.location;
    let newX = x;
    let newY = y;

    // 計算新坐標（僅適用於標準方向）
    switch (direction) {
        case "north": newY--; break;
        case "south": newY++; break;
        case "east": newX++; break;
        case "west": newX--; break;
        case "up": case "down": break; // 特殊方向不改變坐標
        default: return "Invalid direction.";
    }

    // 檢查當前格子的出口（優先處理）
    let currentCell = map.getCell(x, y);
    if (currentCell && currentCell.exit && currentCell.exit.direction === direction) {
        let exit = currentCell.exit.target;
        if (typeof exit === "string") {
            player.room = exit;
            player.location = null;
            let newRoom = Room.load(exit);
            if (!newRoom) {
                return `Failed to enter ${exit}. The room is inaccessible.`;
            }
        } else if (exit.map) {
            player.location = { map: exit.map, x: exit.x || 0, y: exit.y || 0 };
            let newMap = GameMap.load(exit.map);
            if (!newMap) {
                return `Failed to enter ${exit.map}. The map is inaccessible.`;
            }
        } else {
            return "Invalid exit configuration.";
        }
        player.save();
        broadcastToRoom(`${player.username} left to ${player.location ? player.location.map : player.room}.`, map.id, false, player.id);
        return `You leave ${map.id} and enter ${player.location ? player.location.map : player.room}.`;
    }

    // 檢查格子間移動（僅適用於標準方向）
    if (direction === "north" || direction === "south" || direction === "east" || direction === "west") {
        if (newX >= 0 && newX < map.width && newY >= 0 && newY < map.height) {
            if (map.isPassable(newX, newY)) {
                player.location.x = newX;
                player.location.y = newY;
                player.save();
                broadcastToRoom(`${player.username} moved ${direction}.`, map.id, false, player.id);
                return this.look(player, "");
            } else {
                return "You cannot go that way.";
            }
        } else {
            return "You cannot go that way.";
        }
    }

    // 如果方向無效或無出口
    return "You cannot go that way.";
}
