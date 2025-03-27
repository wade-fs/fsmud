// domain/scripts/cache.js

let cache = {
    terrains: {},
    npcs: {},
    items: {},
    cmds: {},
    areas: {},
    players: {}
};

let currentTime = "noon";

function preloadCache() {
    let {
        terrains = [],
        npcs = [],
        items = [],
        cmds = [],
        areas = [],
        players = []
    } = fileLists || {};
/*
    log("Preloading cache...");
    log("Terrains:", terrains);
    log("NPCs:", npcs);
    log("Items:", items);
    log("Players:", players);
    log("Areas:", areas);
    log("Cmds:", cmds);
*/
    cache.cmds = cmds;

    let terrainsData = loadFile("domain/configs/terrains.json");
    if (terrainsData) {
        cache.terrains = JSON.parse(
            terrainsData.split('\n')
                .filter(line => !line.trim().startsWith('//'))
                .join('\n')
        );
    } else {
        log("Error", "Failed to load terrains.json");
    }

    areas.forEach(name => {
        if (name.startsWith("domain/areas/")) {
            const parts = name.split('/');
            const lastPart = parts[parts.length - 1];
            name = lastPart.split('.')[0];
        }
        cache.areas[name] = loadObject("areas", name);
    });

    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name);
    });

    items.forEach(name => {
        cache.items[name] = loadObject("items", name);
    });

    if (players !== null) {
        players.forEach(name => {
            log("Info", "players", name);
            cache.players[name] = loadObject("players", name);
        });
    }
}
