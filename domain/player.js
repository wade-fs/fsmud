// domain/player.js

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
        this.combatLog = [];
    }
}

let players = {};

function addPlayer(id, username = null) {
    if (!username) return "Please enter your username";
    if (!players[id]) {
        let savedData = loadObject("players", id);
        if (savedData) {
            players[id] = new Player(id, username, savedData.race);
            Object.assign(players[id], savedData);
            broadcastToRoom(`${id} has rejoined the game`, players[id].room);
        } else {
            let raceList = Object.keys(races);
            let randomRace = raceList[Math.floor(Math.random() * raceList.length)];
            players[id] = new Player(id, username, randomRace);
            broadcastToRoom(`${id} has joined the game as a ${randomRace}`, players[id].room);
        }
    }
    return `Welcome, ${username}!`;
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
