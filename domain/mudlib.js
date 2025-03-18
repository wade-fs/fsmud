let players = {};
let cache = {
    rooms: {},
    npcs: {},
    items: {},
    methods: {},
    players: {}
};
let timers = {};
let commandAliases = {
    "take": "get",
    "pickup": "get",
    "exit": "quit"
};
let weather = "sunny";
let isDay = true;
let messages = {};

const races = {
    "Human": { hp: 100, mana: 50, int: 10, spi: 10, luck: 10, attackBonus: 0, desc: "Balanced and adaptable." },
    "Dragon": { hp: 120, mana: 30, int: 5, spi: 15, luck: 5, attackBonus: 3, desc: "Powerful and fearsome." },
    "Beastman": { hp: 110, mana: 20, int: 5, spi: 10, luck: 15, attackBonus: 1, desc: "Strong and wild." },
    "Elf": { hp: 90, mana: 80, int: 15, spi: 15, luck: 10, attackBonus: 0, desc: "Graceful and wise." },
    "Insect": { hp: 80, mana: 40, int: 10, spi: 5, luck: 20, attackBonus: 0, desc: "Small but resilient." },
    "Dwarf": { hp: 105, mana: 30, int: 10, spi: 10, luck: 10, attackBonus: 1, desc: "Sturdy and tough." }
};

function i18n(key, params = {}) {
    let msg = messages[key] || key;
    for (let [param, value] of Object.entries(params)) {
        msg = msg.replace(`{${param}}`, value);
    }
    return msg;
}

function loadLanguage() {
    let langData = loadFile("domain/lang/zh_TW.json");
    if (langData) {
        messages = langData;
    } else {
        log("Failed to load language file, using default messages.");
    }
}

function updateWeatherAndTime() {
    setInterval(() => {
        weather = Math.random() > 0.5 ? "sunny" : "rainy";
        isDay = !isDay;
        let time = isDay ? "day" : "night";
        broadcastGlobal(i18n("weather_update", { weather, time }));
    }, 30000);
}

function preloadCache() {
    let roomFiles = fileLists.rooms;
    let npcFiles = fileLists.npcs;
    let itemFiles = fileLists.items;
    let playerFiles = fileLists.players;
    log("roomFiles", roomFiles);
    log("npcFiles", npcFiles);
    log("itemFiles", itemFiles);
    log("playerFiles", playerFiles);

    const { rooms = [], npcs = [], items = [], players = [] } = fileLists;

    rooms.forEach(name => {
        cache.rooms[name] = loadObject("rooms", name);
    });
    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name);
    });
    items.forEach(name => {
        cache.items[name] = loadObject("items", name);
    });

	if (playerFiles != null) {
	    playerFiles.forEach(id => {
            log("loadObject(players)", id);
	        let savedData = loadObject("players", id);
	        if (savedData) {
	            players[id] = new Player(id, savedData.race);
	            players[id].room = savedData.room;
	            players[id].hp = savedData.hp;
	            players[id].mana = savedData.mana;
	            players[id].int = savedData.int;
	            players[id].spi = savedData.spi;
	            players[id].luck = savedData.luck;
	            players[id].inventory = savedData.inventory;
	            players[id].admin = savedData.admin || false;
	            players[id].nickname = savedData.nickname;
	            players[id].bio = savedData.bio;
	            log(`${id} preloaded from saved data.`);
	        }
	    });
	}
}

function loadObject(type, name) {
    let filePath = `domain/${type}/${name}.json`;
    log("loadObject", "cache", type, cache[type]);
    if (!cache[type][name]) {
        log("loadObject", type, name, filePath);
        cache[type][name] = loadFile(filePath);
        if (!cache[type][name]) {
            log(`Failed to load ${type}/${name}`);
            return null;
        }
	} else {
        log("loadObject", "cache", JSON.stringify(cache[type][name])); 
    }
    return JSON.parse(JSON.stringify(cache[type][name]));
}

function saveObject(type, name, obj) {
    let filePath = `${type}/${name}.json`;
    saveFile(filePath, obj);
    cache[type][name] = obj;
}

function parseRoomPath(roomPath) {
    let parts = roomPath.split("/");
    return {
        area: parts[0],
        room: parts[1]
    };
}

function loadPlayerMethods(player) {
    let global = this;
    if (fileLists && fileLists.methods && Array.isArray(fileLists.methods)) {
        fileLists.methods.forEach(method => {
            if (typeof global[method] === "function") {
                player[method] = global[method].bind(player);
            }
        });
    } else {
        log("fileLists.methods is not available or not an array.");
    }
}

class Player {
    constructor(id, race = "Human") {
        this.id = id;
        this.room = "area1/room1";
        this.race = races[race] ? race : "Human";
        this.hp = races[this.race].hp;
        this.mana = races[this.race].mana;
        this.int = races[this.race].int;
        this.spi = races[this.race].spi;
        this.luck = races[this.race].luck;
        this.inventory = [];
        this.admin = (id === "player_1");
        this.nickname = "";
        this.bio = "";
        loadPlayerMethods(this);
    }
}

function addPlayer(id) {
    if (!players[id]) {
        let savedData = loadObject("players", id);
        if (savedData) {
            players[id] = new Player(id, savedData.race);
            players[id].room = savedData.room;
            players[id].hp = savedData.hp;
            players[id].mana = savedData.mana;
            players[id].int = savedData.int;
            players[id].spi = savedData.spi;
            players[id].luck = savedData.luck;
            players[id].inventory = savedData.inventory;
            players[id].admin = savedData.admin || false;
            players[id].nickname = savedData.nickname;
            players[id].bio = savedData.bio;
            broadcastToRoom(i18n("rejoined_game", { id }), players[id].room);
        } else {
            let raceList = Object.keys(races);
            let randomRace = raceList[Math.floor(Math.random() * raceList.length)];
            players[id] = new Player(id, randomRace);
            broadcastToRoom(i18n("joined_game", { id, race: randomRace }), players[id].room);
        }
    } else {
        broadcastToRoom(i18n("rejoined_game", { id }), players[id].room);
    }
}

function removePlayer(id) {
    let room = players[id] ? players[id].room : "";
    delete players[id];
    broadcastToRoom(i18n("left_game", { id }), room);
}

function processCommand(playerID, cmd) {
    if (!players[playerID]) {
        addPlayer(playerID);
    }

    let player = players[playerID];
    if (!player) return i18n("player_not_found");

    let parts = cmd.split(" ");
    let action = parts[0].toLowerCase();

    if (commandAliases[action]) {
        action = commandAliases[action];
    }

    switch (action) {
        case "look":
            return player.look(parts[1]);
        case "go":
            return player.go(parts[1]);
        case "get":
            return player.get(parts[1]);
        case "drop":
            return player.drop(parts[1]);
        case "attack":
            return player.attack(parts[1]);
        case "save":
            return player.save();
        case "quit":
            removePlayer(playerID);
            return i18n("goodbye");
        case "shutdown":
            if (player.admin) {
                shutdown();
                return i18n("shutdown_success");
            }
            return i18n("shutdown_permission");
        case "kick":
            if (player.admin && parts[1]) {
                if (players[parts[1]]) {
                    let targetRoom = players[parts[1]].room;
                    removePlayer(parts[1]);
                    broadcastToRoom(i18n("kick_broadcast", { id: parts[1], admin: playerID }), targetRoom);
                    return i18n("kick_success", { id: parts[1] });
                }
                return i18n("kick_fail");
            }
            return i18n("kick_permission");
        case "weather":
            if (player.admin && parts[1] === "set" && parts[2]) {
                weather = parts[2].toLowerCase();
                broadcastGlobal(i18n("weather_broadcast", { weather, id: playerID }));
                return i18n("weather_success", { weather });
            }
            return i18n("weather_permission");
        case "setnick":
            return player.setnick(parts[1]);
        case "setbio":
            return player.setbio(parts.slice(1).join(" "));
        default:
            return i18n("unknown_command");
    }
}

loadLanguage();
preloadCache();
updateWeatherAndTime();
