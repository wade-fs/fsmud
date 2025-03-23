// domain/cache.js
let cache = {
    rooms: {},
    npcs: {},
    items: {},
    cmds: {},
    maps: {},
    players: {}
};

function preloadCache() {
    let {
        rooms = [],
        npcs = [],
        items = [],
        cmds = [],
        maps = [],
        players = []
    } = fileLists;
    log("Preloading cache...");
    log("Rooms:", rooms);
    log("NPCs:", npcs);
    log("Items:", items);
    log("Players:", players);
    log("Maps:", maps);

    cache.cmds = cmds;
    log("Info", "Preload Cmds:", cmds);

    rooms.forEach(name => {
        cache.rooms[name] = loadObject("rooms", name);
    });
    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name);
    });
    items.forEach(name => {
        cache.items[name] = loadObject("items", name);
    });
    maps.forEach(name => {
        log("maps.forEach", name);
        if (name.startsWith("domains/map/")) {
            name = name.substring("domains/map/".length);
        }
        cache.maps[name] = loadObject("maps", name);
    });
    log("Info", "preloadCache cmds", cmds);
}
