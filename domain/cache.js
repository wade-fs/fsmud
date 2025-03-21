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
        log(`Loaded room: ${name}`, cache.rooms[name]);
    });
    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name);
        log(`Loaded NPC: ${name}`, cache.npcs[name]);
    });
    items.forEach(name => {
        cache.items[name] = loadObject("items", name);
        log(`Loaded item: ${name}`, cache.items[name]);
    });
    players.forEach(name => {
        cache.items[name] = loadObject("players", name);
        log(`Loaded player: ${name}`, cache.players[name]);
    });
    maps.forEach(name => {
        cache.maps[name] = loadObject("maps", name);
        log(`Loaded game map: ${name}`, cache.maps[name]);
    });

    if (players.length > 0) {
        players.forEach(id => {
            let savedData = loadObject("players", id);
            if (savedData) {
                players[id] = new Player(id, savedData.race);
                Object.assign(players[id], savedData); // 直接賦值屬性
                log(`${id} preloaded from saved data.`);
            }
        });
    }
}
