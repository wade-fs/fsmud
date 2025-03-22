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

/*
    players.forEach(name => {
        cache.items[name] = loadObject("players", name);
    });
    if (players.length > 0) {
        log("players", JSON.stringify(players));
        players.forEach(id => {
            let savedData = loadObject("players", id);
            if (savedData) {
                players[id] = new Player(id, savedData.race);
                Object.assign(players[id], savedData); // 直接賦值屬性
                log(`${id} preloaded from saved data.`);
            }
        });
    }
*/
}
