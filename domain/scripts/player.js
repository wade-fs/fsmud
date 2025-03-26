// domain/scripts/player.js

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
        this.name = data.name || '';
        this.password = data.password || '';
        this.isAdmin = data.isAdmin || false;
        this.aliases = data.aliases || {};
        this.inventory = data.inventory || [];
        this.connectionType = data.connectionType || "telnet";
        this.lang = data.lang || "en";

        this.area = "entrance";
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.level = data.level || 1;
        this.hp = data.hp || 100;
        this.mp = data.mp || 100;
        this.strength = data.strength || 10;
        this.agility = data.agility || 10;
        this.race = data.race || "Human";
    }

    save() {
        log("player.save()", JSON.stringify(this));
        let playerData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            password: this.password,
            area: this.area,
            isAdmin: this.isAdmin,
            x: this.x,
            y: this.y,
            health: this.health,
            inventory: this.inventory,
            lang: this.lang
        };
        saveObject("domain/players", this.uuid, playerData);
    }

    static load(name) {
        for (let file of fileLists.players || []) {
            let playerData = loadObject("domain/players", file.split('/').pop().replace('.json', ''));
            if (playerData && playerData.name === name) {
                return new Player(playerData);
            }
        }
        return null;
    }
    clone() {
        return new Player({
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            password: this.password,
            area: this.area,
            x: this.x,
            y: this.y,
            health: this.health,
            inventory: this.inventory.slice(), // 深拷貝陣列
            connectionType: this.connectionType,
            lang: this.lang
        });
    }
}
