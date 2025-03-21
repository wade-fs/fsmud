// domain/item.js

class Item {
    constructor(data) {
        this.id = data.id || "unknown";
        this.name = data.name || "Unnamed Item";
        this.desc = data.desc || "A plain item.";
        this.weight = data.weight || 1;
        this.value = data.value || 0;
        this.usable = data.usable || false; // 是否可使用
        this.effect = data.effect || null; // 使用效果，例如 { type: "heal", amount: 20 }
    }

    // 描述物品
    describe() {
        return i18n("look_item", {
            item: this.name,
            desc: this.desc,
            weight: this.weight,
            value: this.value
        });
    }

    // 使用物品
    use(player) {
        if (!this.usable) {
            return `${this.name} cannot be used.`;
        }
        if (this.effect) {
            switch (this.effect.type) {
                case "heal":
                    player.hp = Math.min(player.hp + this.effect.amount, races[player.race].hp);
                    return `${player.id} used ${this.name} and restored ${this.effect.amount} HP.`;
                case "mana":
                    player.mana = Math.min(player.mana + this.effect.amount, races[player.race].mana);
                    return `${player.id} used ${this.name} and restored ${this.effect.amount} mana.`;
                default:
                    return `Unknown effect for ${this.name}.`;
            }
        }
        return `${player.id} used ${this.name}.`;
    }

    // 複製實例
    clone() {
        return new Item({
            id: this.id,
            name: this.name,
            desc: this.desc,
            weight: this.weight,
            value: this.value,
            usable: this.usable,
            effect: this.effect ? { ...this.effect } : null
        });
    }

    // 序列化為 JSON
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            desc: this.desc,
            weight: this.weight,
            value: this.value,
            usable: this.usable,
            effect: this.effect
        };
    }
}
// domain/objects.js

function loadObject(type, name) {
    let filePath = `domain/${type}/${name}.json`;
    if (!cache[type][name]) {
        const rawData = loadFile(filePath);
        if (typeof rawData !== 'string' || rawData.trim() === '') {
            log(`Failed to load ${type}/${name} from ${filePath} (received: '${rawData}', type: ${typeof rawData})`);
            cache[type][name] = null;
            return null;
        }
        
        try {
            const data = JSON.parse(rawData);
            // 根據類型創建對應的 class 實例
            switch (type) {
                case "rooms":
                    cache[type][name] = new Room(data);
                    break;
                case "items":
                    cache[type][name] = new Item(data);
                    break;
                case "npcs":
                    cache[type][name] = new NPC(data);
                    break;
                default:
                    cache[type][name] = data; // 其他類型保持原始數據
            }
        } catch (e) {
            log(`Failed to parse ${filePath} as JSON: ${e.message}`);
            cache[type][name] = null;
            return null;
        }
    }
    
    // 返回深拷貝的實例
    return cache[type][name] ? cache[type][name].clone() : null;
}

function saveObject(type, name, obj) {
    let filePath = `${type}/${name}.json`;
    // 只儲存屬性數據，不包括方法
    const data = obj.toJSON ? obj.toJSON() : obj;
    saveFile(filePath, JSON.stringify(data, null, 2));
    cache[type][name] = obj;
}
// domain/player.js

let players = {};
const races = {
    "Human": { hp: 100, mana: 50, int: 10, spi: 10, luck: 10, attackBonus: 0, desc: "Balanced and adaptable." },
    "Dragon": { hp: 120, mana: 30, int: 5, spi: 15, luck: 5, attackBonus: 3, desc: "Powerful and fearsome." },
    "Beastman": { hp: 110, mana: 20, int: 5, spi: 10, luck: 15, attackBonus: 1, desc: "Strong and wild." },
    "Elf": { hp: 90, mana: 80, int: 15, spi: 15, luck: 10, attackBonus: 0, desc: "Graceful and wise." },
    "Insect": { hp: 80, mana: 40, int: 10, spi: 5, luck: 20, attackBonus: 0, desc: "Small but resilient." },
    "Dwarf": { hp: 105, mana: 30, int: 10, spi: 10, luck: 10, attackBonus: 1, desc: "Sturdy and tough." }
};

class Player {
    constructor(id, username, race = "Human") {
        this.id = id;
        this.username = username;
        this.room = "entrance";
        this.virtualRoom = null;
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
        this.combatLog = [];
        loadPlayerMethods(this);
    }
}

function addPlayer(id, username = null) {
    if (!username) return i18n("please_enter_username");
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
            players[id].combatLog = savedData.combatLog || [];
            broadcastToRoom(i18n("rejoined_game", { id }), players[id].room, "");
        } else {
            let raceList = Object.keys(races);
            let randomRace = raceList[Math.floor(Math.random() * raceList.length)];
            players[id] = new Player(id, randomRace);
            broadcastToRoom(i18n("joined_game", { id:username, race: randomRace }), players[id].room, "");
        }
    } else {
        broadcastToRoom(i18n("rejoined_game", { id:username }), players[id].room, "");
    }
}

function removePlayer(id) {
    let player = players[id];
    if (player && player.isCombat) {
        clearTimeout(player.combatTimer);
        player.isCombat = false;
        player.combatTarget = null;
    }
    let room = players[id] ? players[id].room : "";
    delete players[id];
    broadcastToRoom(`${id} has left the game`, room, "");
}

function loadPlayerMethods(player) {
    let global = this;
    if (fileLists && fileLists.cmds && Array.isArray(fileLists.cmds)) {
        fileLists.cmds.forEach(cmd => {
            if (typeof global[cmd] === "function") {
                player[cmd] = global[cmd].bind(player);
            } else {
                log(`Command ${cmd} is not a function or not loaded.`);
            }
        });
    } else {
        log("fileLists.cmds is not available or not an array.");
    }
}
// domain/commands.js

const commandAliases = {
	"e": "go east",
	"n": "go north",
	"s": "go south",
	"w": "go west",
    "take": "get",
    "pickup": "get",
    "exit": "quit"
};

function processCommand(playerID, cmd) {
    if (!players[playerID]) {
        addPlayer(playerID, cmd);
		return i18n("welcome", { username: cmd });
    }

    let player = players[playerID];
    if (!player) return i18n("player_not_found");

    if (commandAliases[cmd]) {
        cmd = commandAliases[cmd];
	}

	if (cmd.startsWith("'")) {
        let message = cmd.slice(1);
        return player.say(message);
    }

    let parts = cmd.split(" ");
    let action = parts[0].toLowerCase();

    if (commandAliases[action]) {
        action = commandAliases[action];
    }

    if (player.inCombat && !["attack", "flee", "cast", "combatlog", "quit", "stats"].includes(action)) {
        return i18n("combat_restrict");
    }

    // Check for room-specific command using hide_exits[0].cmd
    let room = loadObject("rooms", player.room);
    if (room.hide_exits && room.hide_exits[0] && room.hide_exits[0].cmd === action) {
        return executeRoomCommand(player, action);
    }

    switch (action) {
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
                    broadcastToRoom(i18n("kick_broadcast", { id: parts[1], admin: playerID }), targetRoom, this.id);
                    return i18n("kick_success", { id: parts[1] });
                }
                return i18n("kick_fail");
            }
            return i18n("kick_permission");
        case "set":
            if (parts.length < 2) {
                return i18n("unknown_command");
            }
            let subcommand = parts[1].toLowerCase();
            let value = parts.slice(2).join(" ");
            switch (subcommand) {
                case "lang":
                    return player.setlang(value);
                case "nick":
                    return player.setnick(value);
                case "bio":
                    return player.setbio(value);
                case "weather":
                    if (player.admin) {
                        weather = value.toLowerCase();
                        broadcastGlobal(i18n("weather_broadcast", { weather, id: playerID }));
                        return i18n("weather_success", { weather });
                    }
                    return i18n("weather_permission");
                default:
                    return i18n("unknown_command");
            }
        case "genmap":
            if (!player.admin) {
                return i18n("genmap_permission");
            }
            if (parts.length < 3) {
                return i18n("genmap_syntax", { syntax: "genmap <area> <mapfile>" });
            }
            let areaName = parts[1];
            let mapFile = parts[2];
            try {
                generateMap(areaName, mapFile);
                broadcastGlobal(i18n("genmap_success", { area: areaName, id: playerID }));
                return i18n("genmap_success_admin", { area: areaName });
            } catch (e) {
                log(`Error generating map for ${areaName} from ${mapFile}: ${e}`);
                return i18n("genmap_error", { error: e.message });
            }
    }

    if (player[action] && typeof player[action] === "function") {
        try {
            return player[action](parts.slice(1).join(" "));
        } catch (e) {
            log(`Error executing ${action}: ${e}`);
            return i18n("unknown_command");
        }
    }
    return i18n("unknown_command");
}

function parseRoomPath(roomPath) {
    let parts = roomPath.split("/");
    return { 
        area: parts[0],
        room: parts[1]
    };
}
// domain/i18n.js

let messages = {};
let currentLang = "en";

const defaultMessage = {
    "say_empty": "What do you want to say?",
    "say_self": "You say: {message}",
    "say_broadcast": "{id} says: {message}",
    "welcome": "Welcome to the MUD! Type commands to play.",
    "player_not_found": "Player not found.",
    "unknown_command": "Unknown command.",
    "joined_game": "{id} has joined the game as a {race}.",
    "rejoined_game": "{id} has rejoined the game.",
    "left_game": "{id} has left the game.",
    "goodbye": "Goodbye.",
    "look_room": "[{area}] {desc} (Weather: {weather}, Time: {time}) Exits: {exits}",
    "look_item": "{item}: {desc} (Weight: {weight}, Value: {value})",
    "get_success": "You got {item}.",
    "stats": "Stats for {id}{nick}:\nRace: {race}\nHP: {hp}\nMana: {mana}\nInt: {int}\nSpi: {spi}\nLuck: {luck}\nInventory: {inventory}",
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
    "attack_start": "{id} engaged {npc} in combat! Their turn begins.",
    "attack_no_mana": "You don't have enough mana to attack!",
    "attack_hit": "{id} attacked {npc} for {damage} damage!{isCritical|true: (Critical Hit!)|false:}",
    "attack_npc_turn": "{npc} hits {id} for {damage} damage! {id}'s HP: {hp}, Mana: {mana}",
    "attack_defeat": "{npc} is defeated! Combat ends.",
    "attack_flee_success": "{id} fled from combat with {npc}.",
    "attack_flee_fail": "{id} failed to flee from {npc}!",
    "attack_continue": "{npc} has {hp} HP left. {id}'s turn.",
    "attack_fail": "No such target here.",
    "attack_in_combat": "You are already in combat with {npc}!",
    "combat_restrict": "You can't do that while in combat!",
    "cast_success": "{id} cast {spell} on {npc} for {damage} damage!",
    "cast_no_mana": "Not enough mana to cast {spell}!",
    "cast_fail": "Invalid spell or target!",
    "combatlog_empty": "No combat history available.",
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
    "weather_update": "The weather is now {weather|sunny:bright and sunny|rainy: wet and rainy} and it is {time}.",
    "setlang_success": "Language set to {lang}.",
    "setlang_fail": "Invalid language choice. Available languages: en, zh"
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
    let rawData = loadFile(`domain/lang/${lang}.json`);
    let langData;
    
    if (rawData && typeof rawData === 'string') {
        try {
            langData = JSON.parse(rawData);
            messages = langData;
            currentLang = lang;
            log(`Loaded language: ${lang}`);
        } catch (e) {
            messages = defaultMessages;
            currentLang = "en";
            log(`Failed to parse ${lang} language file as JSON: ${e.message}, using default English`);
        }
    } else {
        messages = defaultMessages;
        currentLang = "en";
        log(`Failed to load ${lang} language file (received: ${rawData}), using default English`);
    }
}
// domain/weather.js

let weather = "sunny";
let isDay = true;

function updateWeatherAndTime() {
    setInterval(() => {
        weather = Math.random() > 0.5 ? "sunny" : "rainy";
        isDay = !isDay;
        let time = isDay ? "day" : "night";
        broadcastGlobal(i18n("weather_update", { weather, time }));
    }, 300000);
}
// domain/combat.js

function processCombatTurn(npcId, roomId) {
    let queue = combatQueues[npcId];
    if (!queue || queue.length === 0) {
        delete combatQueues[npcId];
        return;
    }

    let player = queue.shift();
    if (!player.isCombat || player.combatTarget !== npcId) {
        processCombatTurn(npcId, roomId);
        return;
    }

    let npc = cache.npcs[npcId]; // 直接從 cache 取 NPC 實例
    if (npc.hp > 0) {
        const result = npc.attackPlayer(player);
        player.combatLog.push(result);
        broadcastToRoom(result, roomId, "");

        if (player.hp <= 0) {
            broadcastToRoom(`${player.id} has been defeated by ${npc.name}!`, roomId, "");
            player.isCombat = false;
            player.combatTarget = null;
        } else {
            queue.push(player);
            broadcastToRoom(i18n("attack_continue", { npc: npc.name, hp: npc.hp, id: player.id }), roomId, "");
        }
    }

    saveObject("npcs", npcId, npc);
    saveObject("players", player.id, player);

    if (queue.length > 0 && npc.hp > 0) {
        setTimeout(() => processCombatTurn(npcId, roomId), 2000);
    } else {
        delete combatQueues[npcId];
        for (let p of Object.values(players)) {
            if (p.combatTarget === npcId) {
                p.isCombat = false;
                p.combatTarget = null;
            }
        }
    }
}
function loadMapData(area, mapFile) {
    mapFile = "domain/rooms/"+area+"/"+mapFile;
    log(`Attempting to load map file: ${mapFile}`);
    const rawData = loadFile(mapFile);
    log(`Raw data from loadFile: ${rawData} (type: ${typeof rawData})`);
    
    if (!rawData || typeof rawData !== 'string') {
        throw new Error(`Failed to load or invalid map file: ${mapFile} (received: ${rawData})`);
    }

    const lines = rawData.split('\n').map(line => line.replace(/\r/g, '')).filter(line => line.trim());
    
    let currentSection = '';
    const mapData = { map: [], desc: {}, null: new Set() };

    for (const line of lines) {
        if (line.startsWith('-')) {
            currentSection = line.slice(1).trim();
            log(`Switching to section: ${currentSection}`);
        } else if (currentSection && (line.startsWith('\t') || line.startsWith(' '))) {
            const content = line.trim();
            log(`Processing line in ${currentSection}: ${content}`);
            if (currentSection === 'map') {
                mapData.map.push(content);
            } else if (currentSection === 'desc') {
                const [symbol, description] = content.split('\t').map(s => s.trim());
                if (symbol && description) {
                    mapData.desc[symbol] = description;
                } else {
                    log(`Invalid desc line: ${content}`);
                }
            } else if (currentSection === 'null') {
                mapData.null.add(content);
            }
        }
    }

    if (mapData.map.length === 0) {
        throw new Error(`No valid map data found in ${mapFile}`);
    }
    log(`Map data parsed: map=${JSON.stringify(mapData.map)}, desc=${JSON.stringify(mapData.desc)}, null=${Array.from(mapData.null)}`);
    return mapData;
}
// domain/npc.js

class NPC {
    constructor(data) {
        this.id = data.id || "unknown";
        this.name = data.name || "Nameless NPC";
        this.desc = data.desc || "An ordinary NPC.";
        this.hp = data.hp || 50;
        this.attack = data.attack || 5;
        this.dialogue = data.dialogue || "Hello, stranger."; // 對話內容
        this.isHostile = data.isHostile || false; // 是否敵對
    }

    // 描述 NPC
    describe() {
        return `${this.name}: ${this.desc} (HP: ${this.hp})`;
    }

    // 與 NPC 對話
    talk(player) {
        return `${this.name} says: "${this.dialogue}"`;
    }

    // NPC 攻擊玩家
    attackPlayer(player) {
        if (this.hp <= 0) return `${this.name} is already defeated!`;
        const damage = this.attack;
        player.hp -= damage;
        return i18n("attack_npc_turn", {
            npc: this.name,
            id: player.id,
            damage,
            hp: player.hp,
            mana: player.mana
        });
    }

    // 複製實例
    clone() {
        return new NPC({
            id: this.id,
            name: this.name,
            desc: this.desc,
            hp: this.hp,
            attack: this.attack,
            dialogue: this.dialogue,
            isHostile: this.isHostile
        });
    }

    // 序列化為 JSON
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            desc: this.desc,
            hp: this.hp,
            attack: this.attack,
            dialogue: this.dialogue,
            isHostile: this.isHostile
        };
    }
}
// domain/room.js

class Room {
    constructor(data) {
        this.id = data.id || "unknown";
        this.area = data.area || "default";
        this.desc = data.desc || "An empty room.";
        this.exits = data.exits || {}; // { "north": "room2", "south": "room1" }
        this.hide_exits = data.hide_exits || []; // [{ cmd: "unlock", dest: "secret_room" }]
        this.items = data.items || []; // 房間內的物品
        this.npcs = data.npcs || []; // 房間內的 NPC
        this.weather = data.weather || "sunny";
        this.events = data.events || []; // 事件觸發器，例如 { trigger: "enter", action: "message", value: "You hear a sound." }
    }

    // 返回房間描述
    describe() {
        const exitList = Object.keys(this.exits).join(", ") || "none";
        return i18n("look_room", {
            area: this.area,
            desc: this.desc,
            weather: this.weather,
            time: isDay ? "day" : "night",
            exits: exitList
        });
    }

    // 檢查並執行進入房間時的事件
    onEnter(player) {
        this.events.forEach(event => {
            if (event.trigger === "enter") {
                if (event.action === "message") {
                    broadcastToRoom(event.value, this.id, player.id);
                }
                // 可擴展其他事件類型
            }
        });
    }

    // 複製實例
    clone() {
        return new Room({
            id: this.id,
            area: this.area,
            desc: this.desc,
            exits: { ...this.exits },
            hide_exits: [...this.hide_exits],
            items: [...this.items],
            npcs: [...this.npcs],
            weather: this.weather,
            events: [...this.events]
        });
    }

    // 序列化為 JSON
    toJSON() {
        return {
            id: this.id,
            area: this.area,
            desc: this.desc,
            exits: this.exits,
            hide_exits: this.hide_exits,
            items: this.items,
            npcs: this.npcs,
            weather: this.weather,
            events: this.events
        };
    }
}
function say(message) {
    if (!message) {
        return i18n("say_empty");
    }

    let roomId = this.virtualRoom || this.room;
    broadcastToRoom(i18n("say_broadcast", { id: this.nickname, message }), roomId, this.id);
    return i18n("say_self", { message });
}
function get(itemName) {
    let room = loadObject("rooms", this.room);
    let itemIndex = room.items.indexOf(itemName);
    if (itemIndex !== -1) {
        let item = loadObject("items", itemName);
        room.items.splice(itemIndex, 1);
        this.inventory.push(itemName);
        saveObject("rooms", this.room, room);
        broadcastToRoom(i18n("get_broadcast", { id: this.id, item: itemName }), this.room, "");
        return i18n("get_success", { item: `${itemName} (Weight: ${item.weight}, Value: ${item.value})` });
    }
    return i18n("get_fail");
}
function look(target) {
    // Check if the player is in a virtual maze
    if (this.virtualRoom) {
        let [roomId, cmd, coords] = this.virtualRoom.split("/");
        let [x, y] = coords.split(",").map(Number);
        let room = loadObject("rooms", roomId);
        let hideExit = room.hide_exits[0]; // Use hide_exits[0] as per your specification
        let map = hideExit.map.split(";"); // 3x3 map rows
        let syms = hideExit.syms;
        let sym = map[x][y];
        let desc = syms[sym] || "An undefined area.";
        let time = isDay ? "day" : "night";

        if (!target) {
            // Display maze room description
            return i18n("look_room", {
                area: `${roomId}/${cmd}`, // Use virtual room path as area
                desc: desc, // Use syms[sym] as description
                weather,
                time,
                exits: "north, south, east, west" // Assume all directions are valid in maze
            });
        }

        // Handle looking at players or items (same logic as below, no maze-specific items yet)
        let targetPlayer = Object.values(players).find(p => p.id === target && p.virtualRoom === this.virtualRoom);
        if (targetPlayer) {
            let nick = targetPlayer.nickname ? ` (${targetPlayer.nickname})` : "";
            let bio = targetPlayer.bio ? ` - ${targetPlayer.bio}` : "";
            return i18n("look_player", {
                id: targetPlayer.id,
                nick,
                race: targetPlayer.race,
                bio,
                hp: targetPlayer.hp,
                mana: targetPlayer.mana,
                int: targetPlayer.int,
                spi: targetPlayer.spi,
                luck: targetPlayer.luck
            });
        }

        if (this.inventory.includes(target)) {
            let item = loadObject("items", target);
            return i18n("look_item", {
                item: target,
                desc: item.desc || "A common item.",
                weight: item.weight || 0,
                value: item.value || 0
            });
        }

        return i18n("look_no_target");
    }

    // Original logic for non-virtual rooms
    let room = loadObject("rooms", this.room);
    let { area } = parseRoomPath(this.room);
    let time = isDay ? "day" : "night";

    if (!target) {
        let desc = i18n("look_room", {
            area,
            desc: room.desc,
            weather,
            time,
            exits: Object.keys(room.exits).join(", ")
        });
        if (room.items.length > 0) desc += i18n("look_items", { items: room.items.join(", ") });
        if (room.npcs.length > 0) desc += i18n("look_npcs", { npcs: room.npcs.join(", ") });

        let playersHere = Object.values(players).filter(p => p.room === this.room && p.id !== this.id);
        if (playersHere.length > 0) {
            let playerList = playersHere.map(p => {
                let nick = p.nickname ? ` (${p.nickname})` : "";
                let bio = p.bio ? ` - ${p.bio}` : "";
                return `${p.id}${nick} [${p.race}]${bio}`;
            }).join(", ");
            desc += i18n("look_players", { players: playerList });
        }
        return desc;
    }

    let targetPlayer = Object.values(players).find(p => p.id === target && p.room === this.room);
    if (targetPlayer) {
        let nick = targetPlayer.nickname ? ` (${targetPlayer.nickname})` : "";
        let bio = targetPlayer.bio ? ` - ${targetPlayer.bio}` : "";
        return i18n("look_player", {
            id: targetPlayer.id,
            nick,
            race: targetPlayer.race,
            bio,
            hp: targetPlayer.hp,
            mana: targetPlayer.mana,
            int: targetPlayer.int,
            spi: targetPlayer.spi,
            luck: targetPlayer.luck
        });
    }

    if (this.inventory.includes(target) || room.items.includes(target)) {
        let item = loadObject("items", target);
        return i18n("look_item", {
            item: target,
            desc: item.desc || "A common item.",
            weight: item.weight || 0,
            value: item.value || 0
        });
    }

    return i18n("look_no_target");
}
function setlang(lang) {
    if (["en", "zh"].includes(lang)) {
        loadLanguage(lang);
        return i18n("setlang_success", { lang });
    }
    return i18n("setlang_fail");
}
function go(direction) {
    if (this.virtualRoom) {
        return moveInVirtualMap(this, direction);
    }
    let room = loadObject("rooms", this.room);
    if (room.exits[direction]) {
        this.room = room.exits[direction];
        let { area } = parseRoomPath(this.room);
        broadcastToRoom(`${this.id} moved to ${area}`, this.room, "");
        return this.look();
    }
    return i18n("go_fail");
}

// Function to handle virtual map movement
function moveInVirtualMap(player, direction) {
    let [roomId, cmd, coords] = player.virtualRoom.split("/");
    let [x, y] = coords.split(",").map(Number);
    let room = loadObject("rooms", roomId);
    let hideExit = room.hide_exits[0]; // Use only the first hide_exits entry
    let map = hideExit.map.split(";"); // 3x3 map rows
    let syms = hideExit.syms;

    // Calculate new position
    if (direction === "north" && x > 0) x--;
    else if (direction === "south" && x < 2) x++;
    else if (direction === "east" && y < 2) y++;
    else if (direction === "west" && y > 0) y--;
    else return "You can't go that way!";

    let newPos = `${x},${y}`;
    let row = map[x];
    let sym = row[y];

    broadcastToRoom(`newPos(${x}, ${y}): '${sym}'`, roomId, "");
    // Check for exit
    if (sym === "x") {
        player.virtualRoom = null;
        return `You exit the hidden area and return to ${room.desc}.`;
    }

    player.virtualRoom = `${roomId}/${cmd}/${newPos}`;
    let desc = syms[sym] || "An undefined area.";
    return `You move to a ${desc}.`;
}

// Updated executeRoomCommand to use hide_exits[0].cmd
function executeRoomCommand(player, cmd) {
    let room = loadObject("rooms", player.room);
    if (!room.hide_exits || !room.hide_exits[0] || player.virtualRoom) {
        return i18n("unknown_command"); // No hidden exits or already in virtual map
    }

    let hideExit = room.hide_exits[0]; // Explicitly use the first hide_exits entry
    if (hideExit.cmd !== cmd) {
        return i18n("unknown_command"); // Command doesn't match hide_exits[0].cmd
    }

    if (cmd === hideExit.cmd) {
        let map = hideExit.map.split(";"); // 3x3 map rows
        let startX, startY;

        // Find starting position (*)
        for (let i = 0; i < 3; i++) {
            let row = map[i];
            let j = row.indexOf("*");
            if (j !== -1) {
                startX = i;
                startY = j;
                break;
            }
        }

        player.virtualRoom = `${player.room}/${hideExit.cmd}/${startX},${startY}`;
        let syms = hideExit.syms;
        let desc = syms[map[startX][startY]] || "An undefined area.";
        return `You ${hideExit.cmd} and enter a ${desc}.`;
    }

    return i18n("unknown_command"); // Default for unrecognized room commands
}
function drop(itemName) {
    let itemIndex = this.inventory.indexOf(itemName);
    if (itemIndex !== -1) {
        this.inventory.splice(itemIndex, 1);
        let room = loadObject("rooms", this.room);
        room.items.push(itemName);
        saveObject("rooms", this.room, room);
        broadcastToRoom(i18n("drop_broadcast", { id: this.id, item: itemName }), this.room, "");

        let timerKey = `${this.room}/${itemName}`;
        if (timers[timerKey]) {
            clearTimeout(timers[timerKey]);
        }
        timers[timerKey] = setTimeout(() => {
            let updatedRoom = loadObject("rooms", this.room);
            let idx = updatedRoom.items.indexOf(itemName);
            if (idx !== -1) {
                updatedRoom.items.splice(idx, 1);
                saveObject("rooms", this.room, updatedRoom);
                broadcastToRoom(i18n("drop_vanish", { item: itemName, room: this.room }), this.room, "");
            }
            delete timers[timerKey];
        }, 10000);

        return i18n("drop_success", { item: itemName });
    }
    return i18n("drop_fail");
}
function attack(target) {
    let room = loadObject("rooms", this.room);
    if (this.inCombat) {
        if (this.combatTarget !== target) {
            return i18n("attack_in_combat", { npc: this.combatTarget });
        }
    } else if (!room.npcs.includes(target)) {
        return i18n("attack_fail");
    } else {
        this.inCombat = true;
        this.combatTarget = target;
        broadcastToRoom(i18n("attack_start", { npc: target }), this.room, "");
    }

    let npc = loadObject("npcs", this.combatTarget);

    if (this.mana < 5) {
        this.inCombat = false;
        this.combatTarget = null;
        clearTimeout(this.combatTimer);
        return i18n("attack_no_mana");
    }
    this.mana -= 5;

    let weapon = this.inventory.length > 0 ? loadObject("items", this.inventory[0]): { damage: 2 };

    let damage = weapon.damage;
    if (this.race === "Dragon") damage += 3;
    else if (this.race === "Dwarf" || this.race === "Beastman") damage += 1;
    damage += Math.floor(this.int / 5);

    let isCritical = this.luck > 15 && Math.random() < 0.2;
    if (isCritical) damage += 2;

    npc.hp -= damage;
    broadcastToRoom(i18n("attack_hit", { id: this.id, npc: npc.name, damage, isCritical: isCritical.toString() }), this.room, "");

    if (npc.hp < 5) {
        room.npcs = rooms.npcs.filter(n => n !== this.combatTarget);
        saveObject("rooms", this.room, room);
        saveObject("npcs", this.combatTarget, npc);
        this.inCombat = false;
        this.combatTarget = null;
        clearTimeout(this.combatTimer);
        return i18n("attack_defeat", { npc: npc.name });
    }

    this.combatTimer = setTimeout(() => {
        let updateNpc = loadObject("npcs", this.combatTarget);
        let npcDamage = updateNpc.attack;
        this.hp -= npcDamage;
        broadcastToRoom(i18n("attack_npc_turn", { npc: updateNpc.name, id: this.id, damage: npcDamage, hp: this.hp, mana: this.mana }), this.room, "");

        if (this.hp < 0) {
            broadcastToRoom(`${this.id} has been defeated by ${updateNpc.name}!`, this.room, "");
            this.inCombat = false;
            this.combatTarget = null;
            clearTimeout(this.combatTimer);
            return;
        }

        saveObject("npcs", this.combatTarget, updateNpc);
        broadcastToRoom(i18n("attack_continue", { npc: updateNpc.name, hp: updateNpc.hp }), this.room, "");
    }, 2000);

    saveObject("players", this.id, this);
    return i18n("attack_continue", { npc: npc.name, hp: npc.hp });
}
function setnick(nickname) {
    if (nickname && nickname.length <= 20) {
        this.nickname = nickname;
        broadcastToRoom(i18n("setnick_broadcast", { id: this.id, nick: nickname }), this.room, this.id);
        return i18n("setnick_success", { nick: nickname });
    }
    return i18n("setnick_fail");
}
function save() {
    let playerData = {
        id: this.id,
        room: this.room,
        hp: this.hp,
        mana: this.mana,
        int: this.int,
        spi: this.spi,
        luck: this.luck,
        inventory: this.inventory,
        admin: this.admin,
        nickname: this.nickname,
        bio: this.bio,
        race: this.race
    };
    saveObject("players", this.id, playerData);
    return i18n("save_success");
}
function stats() {
    let nick = this.nickname ? ` (${this.nickname})` : "";
    return i18n("stats", {
        id: this.id,
        nick,
        race: this.race,
        hp: this.hp,
        mana: this.mana,
        int: this.int,
        spi: this.spi,
        luck: this.luck,
        inventory: this.inventory.length > 0 ? this.inventory.join(", ") : "None"
    });
}
function setbio(bio) {
    if (bio && bio.length <= 100) {
        this.bio = bio;
        broadcastToRoom(i18n("setbio_broadcast", { id: this.id }), this.room, this.id);
        return i18n("setbio_success");
    }
    return i18n("setbio_fail");
}
function search() {
    let room = loadObject("rooms", this.room);
    if (room.hide_exits && room.hide_exits.length > 0) {
        return room.hide_exits[0].desc; // Display the first hide_exits description
    }
    return "You search around but find nothing of interest.";
}
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

    rooms.forEach(name => {
        cache.rooms[name] = loadObject("rooms", name); // 現在返回 Room 實例
    });
    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name); // 現在返回 NPC 實例
    });
    items.forEach(name => {
        cache.items[name] = loadObject("items", name); // 現在返回 Item 實例
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
function generateMap(areaName, mapFile) {
    const { map, desc: descMap, null: nullPoints } = loadMapData(areaName, mapFile);

    const rows = map.length;
    if (rows === 0) throw new Error("Empty map data");
    const cols = map[0].length;

    // Generate room objects
    let rooms = {};
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const symbol = map[y][x];
            if (nullPoints.has(symbol)) continue;

            const roomId = `${areaName}/${y+1}-${x+1}`;
            let room = {
                desc: descMap[symbol] || "未知區域",
                exits: {},
                items: [],
                npcs: []
            };

            // Add exits
            if (x > 0 && !nullPoints.has(map[y][x-1])) {
                room.exits.west = `${areaName}/${y+1}-${x}`;
            }
            if (x < cols-1 && !nullPoints.has(map[y][x+1])) {
                room.exits.east = `${areaName}/${y+1}-${x+2}`;
            }
            if (y > 0 && !nullPoints.has(map[y-1][x])) {
                room.exits.north = `${areaName}/${y}-${x+1}`;
            }
            if (y < rows-1 && !nullPoints.has(map[y+1][x])) {
                room.exits.south = `${areaName}/${y+2}-${x+1}`;
            }

            rooms[roomId] = room;
        }
    }

    // Save room files
    for (let roomId in rooms) {
        const filePath = `domain/rooms/${roomId}.json`;
        saveFile(filePath, JSON.stringify(rooms[roomId], null, 2));
    }
}
// domain/mudlib.js

loadLanguage("en");
preloadCache();
updateWeatherAndTime();
