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
        this.password = data.password || ''; // 應加密
        this.area = "entrance";
        this.x = data.x || 0;                // 初始 X 座標
        this.y = data.y || 0;                // 初始 Y 座標
        this.health = data.health || 100;
        this.inventory = data.inventory || [];
        this.connectionType = data.connectionType || "telnet";
        this.lang = data.lang || "en";
    }

    save() {
        let playerData = {
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            password: this.password,
            area: "entrance",
            x: this.x,
            y: this.y,
            health: this.health,
            inventory: this.inventory,
            lang: this.lang
        };
        saveObject("players", this.uuid, playerData);
    }

    static load(name) {
        for (let file of fileLists.players || []) {
            let playerData = loadObject("players", file.split('/').pop().replace('.json', ''));
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
