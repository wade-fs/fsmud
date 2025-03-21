// domain/cmds/look.js
function look(player, args) {
    let room = Room.load(player.room);
    if (room) {
        let description = room.description;
        let exits = Object.keys(room.exits).join(", ");
        if (exits) {
            description += `\nExits: ${exits}`;
        } else {
            description += "\nNo obvious exits.";
        }
        if (room.items.length > 0) {
            description += `\nItems: ${room.items.join(", ")}`;
        }
        if (room.npcs.length > 0) {
            description += `\nNPCs: ${room.npcs.join(", ")}`;
        }
        return description;
    }

    let map = GameMap.load(player.location.map);
    if (!map) {
        return "You are in a void.";
    }

    let cell = map.getCell(player.location.x, player.location.y);
    if (!cell) {
        return "You are lost.";
    }

    let description = `${map.description}\n${cell.description}`;
    if (!args) {
        let exits = [];
        if (map.isPassable(player.location.x, player.location.y - 1)) exits.push("north");
        if (map.isPassable(player.location.x, player.location.y + 1)) exits.push("south");
        if (map.isPassable(player.location.x + 1, player.location.y)) exits.push("east");
        if (map.isPassable(player.location.x - 1, player.location.y)) exits.push("west");
        if (cell.exit && !exits.includes(cell.exit.direction)) exits.push(cell.exit.direction);
        if (exits.length > 0) {
            description += `\nExits: ${exits.join(", ")}`;
        } else {
            description += "\nNo obvious exits.";
        }
        if (cell.items.length > 0) {
            description += `\nItems: ${cell.items.join(", ")}`;
        }
        if (cell.npcs.length > 0) {
            description += `\nNPCs: ${cell.npcs.join(", ")}`;
        }
    }
    return description;
}
