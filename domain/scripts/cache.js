// domain/scripts/cache.js

let cache = {
    terrains: {},
    npcs: {},
    items: {},
    cmds: {},
    areas: {},
    players: {}
};

function preloadCache() {
    let {
        terrains = [],
        npcs = [],
        items = [],
        cmds = [],
        areas = [],
        players = []
    } = fileLists || {};
    log("Preloading cache...");
    log("Terrains:", terrains);
    log("NPCs:", npcs);
    log("Items:", items);
    log("Players:", players);
    log("Areas:", areas);

    cache.cmds = cmds;
    log("Info", "Preload Cmds:", cmds);

    // 載入 terrains.json
    let terrainsData = loadFile("domain/configs/terrains.json");
    if (terrainsData) {
        cache.terrains = JSON.parse(
            terrainsData.split('\n')
                .filter(line => !line.trim().startsWith('//'))
                .join('\n')
        );
        log("Info", "Preloaded terrains:", JSON.stringify(cache.terrains));
    } else {
        log("Error", "Failed to load terrains.json");
    }

    // 載入 areas
    areas.forEach(name => {
        if (name.startsWith("domain/areas/")) {
            const parts = name.split('/');
            const lastPart = parts[parts.length - 1];
            name = lastPart.split('.')[0];
        }
        cache.areas[name] = loadObject("areas", name);
    });

    // 載入 npcs
    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name);
    });

    // 載入 items
    items.forEach(name => {
        cache.items[name] = loadObject("items", name);
    });

    // 載入 players
    players.forEach(name => {
        cache.players[name] = loadObject("players", name);
    });
}
