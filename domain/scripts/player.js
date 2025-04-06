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

function addPlayer(playerId, area, connectionType) {
    if (!players[playerId]) {
        players[playerId] = new Player({ id: playerId, area: "character creation", connectionType });
        log("addPlayer", JSON.stringify(players[playerId]));
    } else {
        players[playerId].area = area;
        players[playerId].connectionType = connectionType;
        log("addPlayer", `Player ${playerId} already exists, updated area to ${area} and connectionType to ${connectionType}`);
    }
}

function removePlayer(playerId) {
    log(`removePlayer(${playerId})`);
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
        this.name = data.name         || '';
        this.password = data.password || '';
        this.nickname = data.nickname || '';
        this.bio = data.bio           || '';
        this.race = data.race         || '';
        this.lang = data.lang         || "en";
        this.uuid = data.uuid || generateUUID();
        this.isAdmin = data.isAdmin || false;
        this.aliases = data.aliases || {};
        this.connectionType = data.connectionType || "telnet";

        this.area = data.area || "character creation";
        this.x = data.x || 0;
        this.y = data.y || 0;
        this.level = data.level || 1;
        this.hp = data.hp || 100;
        this.mp = data.mp || 100;
        this.strength = data.strength || 10;
        this.agility = data.agility || 10;
        this.inventory = data.inventory || [];
        this.avatar = data.avatar || [];
        players[this.id] = this;
        log("Player.constructor()", JSON.stringify(this));
    }

    save() {
        let playerData = {
            uuid: this.uuid,
            name: this.name,
            password: this.password,
            nickname: this.nickname,
            bio: this.bio,
            race: this.race,
            isAdmin: this.isAdmin,
            aliases: this.aliases,
            lang: this.lang,

            area: this.area,
            x: this.x,
            y: this.y,
            level: this.level,
            hp: this.hp,
            mp: this.mp,
            strength: this.strength,
            agility: this.agility,
            inventory: this.inventory,
            avatar: this.avatar
        };
        saveObject("players", this.uuid, playerData);
        log(`Player.save()`, JSON.stringify(playerData));
    }

    static load(name) {
        for (let file of fileLists.players || []) {
            let uuid = file.split('/').pop().replace('.json', '');
            let playerData = loadObject("players", uuid); // 修正 type 為 "players"
            if (playerData && playerData.name === name) {
                log(`Found player data, call Player.load(${name})`);
                return playerData;
            }
        }
        log(`Player.load(${name}) not found player file.`);
        return null;
    }

    clone() {
        log(`Player.clone()`, JSON.stringify(this));
        return new Player({
            id: this.id,
            uuid: this.uuid,
            name: this.name,
            password: this.password,
            nickname: this.nickname,
            bio: this.bio,
            race: this.race,
            isAdmin: this.isAdmin,
            aliases: this.aliases,
            lang: this.lang,

            area: this.area,
            x: this.x,
            y: this.y,
            hp: this.hp,
            mp: this.mp,
            strength: this.strength,
            agility: this.agility,
            inventory: this.inventory.slice(),
            avatar: this.avatar
        });
    }
}
