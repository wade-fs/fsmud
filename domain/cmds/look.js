// domain/cmds/look.js
function look(player, args) {
    let room = null;
    if ("room" in player && player.room !== null) {
        log("Info", "look", player.room);
        room = Room.load(player.room);
    }
    if (room !== null) {
        let description = room.description; // 假設 description 已根據語言儲存或動態生成
        let exits = Object.keys(room.exits).join(", ");
        if (exits) {
            description += `\n${i18n(player.lang, "look_exits", { exits })}`;
        } else {
            description += `\n${i18n(player.lang, "look_no_exits")}`;
        }
        if (room.items.length > 0) {
            let items = room.items.map(item => item.name || item).join(", "); // 假設 items 是對象或字符串
            description += `\n${i18n(player.lang, "look_items", { items })}`;
        }
        if (room.npcs.length > 0) {
            let npcs = room.npcs.map(npc => npc.name || npc).join(", "); // 假設 npcs 是對象或字符串
            description += `\n${i18n(player.lang, "look_npcs", { npcs })}`;
        }
        return description;
    } else {
        log("Error", "look", "no room");
    }

    let map = GameMap.load(player.location.map);
    if (!map) {
        return i18n(player.lang, "look_void");
    }

    let cell = map.getCell(player.location.x, player.location.y);
    if (!cell) {
        return i18n(player.lang, "look_lost");
    }

    let description = `${map.description}\n${cell.description}`; // 假設這些描述已根據語言處理
    if (!args) {
        let exits = [];
        if (map.isPassable(player.location.x, player.location.y - 1)) exits.push("north");
        if (map.isPassable(player.location.x, player.location.y + 1)) exits.push("south");
        if (map.isPassable(player.location.x + 1, player.location.y)) exits.push("east");
        if (map.isPassable(player.location.x - 1, player.location.y)) exits.push("west");
        if (cell.exit && !exits.includes(cell.exit.direction)) exits.push(cell.exit.direction);
        if (exits.length > 0) {
            description += `\n${i18n(player.lang, "look_exits", { exits: exits.join(", ") })}`;
        } else {
            description += `\n${i18n(player.lang, "look_no_exits")}`;
        }
        if (cell.items.length > 0) {
            let items = cell.items.map(item => item.name || item).join(", ");
            description += `\n${i18n(player.lang, "look_items", { items })}`;
        }
        if (cell.npcs.length > 0) {
            let npcs = cell.npcs.map(npc => npc.name || npc).join(", ");
            description += `\n${i18n(player.lang, "look_npcs", { npcs })}`;
        }
    }
    return description;
}
