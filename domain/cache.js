// domain/cache.js
let cache = {
    rooms: {},
    npcs: {},
    items: {},
    cmds: {},
    players: {}
};

function preloadCache() {
    const { rooms = [], npcs = [], items = [], players = [] } = fileLists;
    log("Preloading cache...");
    log("Rooms:", rooms);
    log("NPCs:", npcs);
    log("Items:", items);
    log("Players:", players);

    rooms.forEach(name => {
        cache.rooms[name] = loadObject("rooms", name); // 現在返回 Room 實例
        log(`Loaded room: ${name}`, cache.rooms[name]);
    });
    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name); // 現在返回 NPC 實例
        log(`Loaded NPC: ${name}`, cache.npcs[name]);
    });
    items.forEach(name => {
        cache.items[name] = loadObject("items", name); // 現在返回 Item 實例
        log(`Loaded item: ${name}`, cache.items[name]);
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
