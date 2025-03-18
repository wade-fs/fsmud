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
let currentLang = "en";

const races = {
    "Human": { hp: 100, mana: 50, int: 10, spi: 10, luck: 10, attackBonus: 0, desc: "Balanced and adaptable." },
    "Dragon": { hp: 120, mana: 30, int: 5, spi: 15, luck: 5, attackBonus: 3, desc: "Powerful and fearsome." },
    "Beastman": { hp: 110, mana: 20, int: 5, spi: 10, luck: 15, attackBonus: 1, desc: "Strong and wild." },
    "Elf": { hp: 90, mana: 80, int: 15, spi: 15, luck: 10, attackBonus: 0, desc: "Graceful and wise." },
    "Insect": { hp: 80, mana: 40, int: 10, spi: 5, luck: 20, attackBonus: 0, desc: "Small but resilient." },
    "Dwarf": { hp: 105, mana: 30, int: 10, spi: 10, luck: 10, attackBonus: 1, desc: "Sturdy and tough." }
};

const defaultMessage = {
    "welcome": "Welcome to the MUD! Type commands to play.",
    "player_not_found": "Player not found.",
    "unknown_command": "Unknown command.",
    "joined_game": "{id} has joined the game as a {race}.",
    "rejoined_game": "{id} has rejoined the game.",
    "left_game": "{id} has left the game.",
    "goodbye": "Goodbye.",
    "look_room": "[{area}] {desc} (Weather: {weather}, Time: {time}) Exits: {exits}",
    "look_items": " Items: {items}",
    "look_npcs": " NPCs: {npcs}",
    "look_players": " Players here: {players}",
    "look_player": "{id}{nick} [{race}]{bio}\nHP: {hp}, Mana: {mana}, Int: {int}, Spi: {spi}, Luck: {luck}",
    "look_item": "{item}: {desc}",
    "look_no_target": "No such target here.",
    "go_success": "{desc}",
    "go_fail": "You can't go that way!",
    "get_success": "You got {item}.",
    "get_broadcast": "{id} got {item}.",
    "get_fail": "No such item here.",
    "drop_success": "You dropped {item}. It will vanish in 10 seconds.",
    "drop_broadcast": "{id} dropped {item}.",
    "drop_vanish": "{item} has vanished from {room}.",
    "drop_fail": "You don't have that item.",
    "attack_no_mana": "You don't have enough mana to attack!",
    "attack_hit": "{id} attacked {npc} for {damage} damage!",
    "attack_critical": " (Critical Hit!)",
    "attack_defeat": "{npc} is defeated!",
    "attack_continue": "{npc} has {hp} HP left. It hits you for {attack} damage! Your HP: {hp}, Mana: {mana}",
    "attack_fail": "No such target here.",
    "save_success": "Your progress has been saved.",
    "setnick_success": "Nickname set to {nick}.",
    "setnick_broadcast": "{id} has set their nickname to {nick}.",
    "setnick_fail": "Invalid nickname. Must be 1-20 characters.",
    "setbio_success": "Bio updated.",
    "setbio_broadcast": "{id} has updated their bio.",
    "setbio_fail": "Invalid bio. Must be 1-100 characters.",
    "shutdown_permission": "You don't have permission to do that.",
    "shutdown_success": "Shutting down the system...",
    "kick_permission": "You don't have permission or invalid syntax. Use: kick <player_id>",
    "kick_success": "You kicked {id}.",
    "kick_broadcast": "{id} has been kicked by {admin}.",
    "kick_fail": "Player not found.",
    "weather_permission": "You don't have permission or invalid syntax. Use: weather set <sunny/rainy>",
    "weather_success": "Weather set to {weather}.",
    "weather_broadcast": "The weather has been set to {weather} by {id}.",
    "weather_update": "The weather is now {weather} and it is {time}.",
    "setlang_success": "Language set to {lang}.",
    "setlang_fail": "Invalid language choice. Available languages: en, zh",
    "please_enter_username": "請輸入您的用戶名：",
    "please_enter_username": "Please enter username:",
    "welcome_user": "welcome user."
}

function i18n(key, params = {}) {
    let msg = messages[key] || defaultMessage[key] || key;

    const conditionRegex = /{([^|]+)\|([^}]+)}/g;
    let match;
    while ((match = conditionRegex.exec(msg)) !== null) {
        const [fullMatch, conditionVar, options] = match;
        const conditionPairs = options.split("|").map(opt => opt.split(":"));
        const value = params[conditionVar];
        const replacement = conditionPairs.find(pair => pair[0] === value)?.[1] || "";
        msg = msg.replace(fullMatch, replacement);
    }

    for (let [param, value] of Object.entries(params)) {
        msg = msg.replace(`{${param}}`, value);
    }
    return msg;
}
function loadLanguage(lang = "en") {
    let langData = loadFile(`domain/lang/${lang}.json`);
    if (langData) {
        messages = langData;
        currentLang = lang;
        log(`Loaded language: ${lang}`);
    } else {
        messages = defaultMessages;
        currentLang = "en";
        log(`Failed to load ${lang} language file, using default English.`);
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
    if (!cache[type][name]) {
        cache[type][name] = loadFile(filePath);
        if (!cache[type][name]) {
            log(`Failed to load ${type}/${name}`);
            return null;
        }
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
    constructor(id, username, race = "Human") {
        this.id = id;
        this.username = username;
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
        this.isCombat = false;
        this.combatTarget = null;
        this.combatTimer = null;
        loadPlayerMethods(this);
    }
}

function addPlayer(id, username = null) {
    if (!username) {
        return i18n("please_enter_username");
    }

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
            broadcastToRoom(i18n("joined_game", { id:username, race: randomRace }), players[id].room);
        }
    } else {
        broadcastToRoom(i18n("rejoined_game", { id:username }), players[id].room);
    }
}

function removePlayer(id) {
    let player = players[id];
    if (player && player.inCombat) {
        clearTimeout(player.combatTimer);
        player.inCombat = false;
        player.combatTarget = null;
    }
    let room = players[id] ? players[id].room : "";
    delete players[id];
    broadcastToRoom(i18n("left_game", { id }), room);
}

function processCommand(playerID, cmd) {
    if (!players[playerID]) {
        addPlayer(playerID, cmd);
		return i18n("welcome_user", { username: cmd });
    }

    let player = players[playerID];
    if (!player) return i18n("player_not_found");

    let parts = cmd.split(" ");
    let action = parts[0].toLowerCase();

    if (commandAliases[action]) {
        action = commandAliases[action];
    }

    if (player.inCombat && !["attack", "quit"].includes(action)) {
        return i18n("combat_restrict");
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
        case "setlang":
            return player.setlang(parts[1]);
        default:
            return i18n("unknown_command");
    }
}

loadLanguage("en");
preloadCache();
updateWeatherAndTime();
