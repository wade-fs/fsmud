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
    if (player && player.isCombat) {
        clearTimeout(player.combatTimer);
        player.isCombat = false;
        player.combatTarget = null;
    }
    let room = players[id] ? players[id].room : "";
    delete players[id];
    broadcastToRoom(`${id} has left the game`, room);
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
