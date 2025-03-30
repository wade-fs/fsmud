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
let timeInterval = 0;
let magnification = 60;
let maxHB = 86400/magnification
let timeIntervalId;

function updateTime() {
    if (timeIntervalId) {
        clearInterval(timeIntervalId);
    }
    timeIntervalId = setInterval(() => {
        timeInterval++;
        if (timeInterval >= maxHB) {
            timeInterval = 0;
        }
        let hour = Math.floor((timeInterval * magnification * 24) / 86400) % 24;
        let day = "midnight";
        if (hour >= 4 && hour < 22) {
            if (hour < 9) {
                day = "morning";
            } else if (hour < 14) {
                day = "noon";
            } else if (hour < 18) {
                day = "afternoon";
            } else {
                day = "night";
            }
        }
        if (day !== currentTime) {
            currentTime = day;
		    broadcastGlobal("update_time", { time: currentTime });
        }
    }, 1000);
}

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

    updateTime();
}
