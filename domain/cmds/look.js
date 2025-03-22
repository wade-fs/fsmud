// domain/cmds/look.js

function look(player, args) {
    let description = "";
    if (player.room) {
        let room = Room.load(player.room);
        if (!room) return "You are in an invalid room.";
        description = room.description;
        let exits = Object.keys(room.exits).join(", ");
        description += exits ? `\n${i18n(player.lang, "look_exits", { exits })}` : `\n${i18n(player.lang, "look_no_exits")}`;
        if (room.items.length) description += `\n${i18n(player.lang, "look_items", { items: room.items.map(i => i.name).join(", ") })}`;
        if (room.npcs.length) description += `\n${i18n(player.lang, "look_npcs", { npcs: room.npcs.map(n => n.name).join(", ") })}`;
    } else if (player.location && player.location.map) {
        let map = GameMap.load(player.location.map);
        if (!map) return i18n(player.lang, "look_void");
        let cell = map.getCell(player.location.x, player.location.y);
        if (!cell) return i18n(player.lang, "look_lost");
        description = `${map.description}\n${cell.description}`;
        let exits = [];
        if (map.isPassable(player.location.x, player.location.y - 1)) exits.push("north");
        if (map.isPassable(player.location.x, player.location.y + 1)) exits.push("south");
        if (map.isPassable(player.location.x + 1, player.location.y)) exits.push("east");
        if (map.isPassable(player.location.x - 1, player.location.y)) exits.push("west");
        if (cell.exit && !exits.includes(cell.exit.direction)) exits.push(cell.exit.direction);
        description += exits.length ? `\n${i18n(player.lang, "look_exits", { exits: exits.join(", ") })}` : `\n${i18n(player.lang, "look_no_exits")}`;
    } else {
        return i18n(player.lang, "look_void");
    }
    return description;
}
