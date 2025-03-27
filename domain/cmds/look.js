// domain/cmds/look.js

function look(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "look_help", {
            usage: "look",
            description: "Examine your current location, including terrain and exits."
        });
    }

    let terrainCode = currentArea.getTerrain(player.x, player.y);
    if (!terrainCode || terrainCode === "XX") {
        return i18n(player.lang, "look_void");
    }

    let terrains = cache.terrains[player.lang] || cache.terrains["en"];
    if (!terrains) {
        return i18n(player.lang, "look_no_terrain_data");
    }

    let terrain = terrains.find(t => t[terrainCode]);
    if (!terrain) {
        return i18n(player.lang, "look_unknown_terrain");
    }

    let terrainData = terrain[terrainCode];
    let description = terrainData["name"]+": "+terrainData[currentTime] || terrainData["noon"];

    let exits = [];

    if (currentArea.isPassable(player.x + 1, player.y)) exits.push(i18n(player.lang, "east"));
    if (currentArea.isPassable(player.x - 1, player.y)) exits.push(i18n(player.lang, "west"));
    if (currentArea.isPassable(player.x, player.y + 1)) exits.push(i18n(player.lang, "south"));
    if (currentArea.isPassable(player.x, player.y - 1)) exits.push(i18n(player.lang, "north"));

    let exitsString = "";
    if (exits.length === 1) {
        exitsString = exits[0];
    } else if (exits.length === 2) {
        exitsString = exits.join(` ${i18n(player.lang, "and")} `);
    } else if (exits.length > 2) {
        const lastExit = exits.pop();
        exitsString = exits.join(", ") + ` ${i18n(player.lang, "and")} ${lastExit}`;
    }

    if (exits.length > 0) {
        description += `\n${i18n(player.lang, "look_exits", { exits: exitsString })}`;
    } else {
        description += `\n${i18n(player.lang, "look_no_exits")}`;
    }

    let area = cache.areas[player.area];
    let items = area.getItemsAt(player.x, player.y);
    if (items.length > 0) {
        let itemNames = items.map(item => item.name).join(", ");
        description += `\n${i18n(player.lang, "items_here")}: ${itemNames}`;
    }

    return description;
}
