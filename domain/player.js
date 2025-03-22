// domain/player.js

if (typeof players === "undefined") {
    var players = {};
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function addPlayer(playerId, room, connectionType) {
    if (!players[playerId]) {
        players[playerId] = new Player({ id: playerId, room, connectionType });
        log("addPlayer", `Player ${playerId} added to room ${room} with connectionType ${connectionType}`);
    } else {
        players[playerId].room = room;
        players[playerId].connectionType = connectionType;
        log("addPlayer", `Player ${playerId} already exists, updated room to ${room} and connectionType to ${connectionType}`);
    }
}

function removePlayer(playerId) {
    if (players[playerId]) {
        const uuid = players[playerId].uuid;
        delete players[playerId];
        if (uuid && players[uuid]) {
            delete players[uuid];
        }
        log("removePlayer", `Player ${playerId} removed`);
    }
}

class Player {
    constructor(data) {
        this.id = data.id;
        this.uuid = data.uuid || generateUUID();
        this.username = data.username || '';
        this.password = data.password || ''; // 應加密
        this.level = data.level || 1;
        this.hp = data.hp || 100;
        this.mp = data.mp || 50;
        this.strength = data.strength || 10;
        this.agility = data.agility || 10;
        this.room = data.room || "entrance";
        this.connectionType = data.connectionType || "telnet";
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
            uuid: this.uuid,
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
        saveObject("players", this.uuid, playerData);
        log(`Saved player ${this.username} to domain/players/${this.uuid}.json`);
    }

    static load(username) {
        for (let playerId in players) {
            if (players[playerId].username === username) {
                return players[playerId];
            }
        }
        for (let file of fileLists.players || []) {
            let playerData = loadObject("players", file.split('/').pop().replace('.json', ''));
            if (playerData && playerData.username === username) {
                return playerData;
            }
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
