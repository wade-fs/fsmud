// domain/player.js

if (typeof players === "undefined") {
    var players = {};
}

function addPlayer(playerId, room) {
    if (!players[playerId]) {
        players[playerId] = new Player({ id: playerId, room });
        log("addPlayer", `Player ${playerId} added to room ${room}`);
    } else {
        players[playerId].room = room; // 更新房間
        log("addPlayer", `Player ${playerId} already exists, updated room to ${room}`);
    }
}

function removePlayer(playerId) {
    if (players[playerId]) {
        delete players[playerId];
        log("removePlayer", `Player ${playerId} removed`);
    }
}

class Player {
    constructor(data) {
        this.id = data.id;
        this.username = data.username || '';
        this.password = data.password || ''; // 應加密
        this.level = data.level || 1;
        this.hp = data.hp || 100;
        this.mp = data.mp || 50;
        this.strength = data.strength || 10;
        this.agility = data.agility || 10;
        this.room = data.room || "entrance";
        this.location = data.location || null;
        this.isAdmin = data.isAdmin || false;
        this.aliases = data.aliases || {};
        this.inventory = data.inventory || [];
        this.lang = data.lang || "en";
        if (!this.id) {
            log("Player constructor", "Error: No player ID provided");
            log(JSON.stringify(data));
            throw new Error("Player ID is required");
        }
    }

    save() {
        if (!this.username) {
            log(`Can not save player ${this.id}`);
            return;
        }
        let playerData = {
            id: this.id,
            username: this.username,
            password: this.password,
            level: this.level,
            hp: this.hp,
            mp: this.mp,
            strength: this.strength,
            agility: this.agility,
            room: this.room,
            location: this.location,
            isAdmin: this.isAdmin,
            aliases: this.aliases,
            inventory: this.inventory,
            lang: this.lang
        };
        saveObject("players", this.username, playerData);
        log(`Saved player ${this.username} to domain/players/${this.username}.json`);
    }

    static load(username) {
        let player = loadObject("players", username);
        if (player) {
            return player;
        }
        return null;
    }

    clone() {
        return new Player({
            id: this.id,
            username: this.username,
            password: this.password,
            level: this.level,
            hp: this.hp,
            mp: this.mp,
            strength: this.strength,
            agility: this.agility,
            room: this.room,
            location: this.location,
            isAdmin: this.isAdmin,
            aliases: this.aliases,
            inventory: this.inventory
        });
    }
}
