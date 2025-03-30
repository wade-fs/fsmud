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
    let room_desc = terrainData["name"]+": "+terrainData[currentTime] || terrainData["noon"];

    let exits = [];

    if (currentArea.isPassable(player.x + 1, player.y)) exits.push(i18n(player.lang, "east"));
    if (currentArea.isPassable(player.x - 1, player.y)) exits.push(i18n(player.lang, "west"));
    if (currentArea.isPassable(player.x, player.y + 1)) exits.push(i18n(player.lang, "south"));
    if (currentArea.isPassable(player.x, player.y - 1)) exits.push(i18n(player.lang, "north"));


    let area = cache.areas[player.area];
    let items = area.getItemsAt(player.x, player.y);
    let items_desc = "";
    if (items.length > 0) {
        let itemNames = items.map(item => item.name).join(", ");
        items_desc = `${i18n(player.lang, "items_here")}: ${itemNames}`;
    }
    // "look_room": "[{area}] {desc} (Time: {time}) Exits: {exits}"
    description = i18n(player.lang, "look_room", { area:area.name, desc:room_desc, items:items_desc, exits:exits, time:currentTime });

    return description;
}
