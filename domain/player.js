// domain/player.js
function generateUniqueId() {
    let timestamp = Date.now().toString(36);
    let random = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${random}`;
}

if (typeof players === "undefined") {
    var players = {};
}

function removePlayer(playerId) {
    delete players[playerId];
}

class Player {
    constructor(data) {
        this.id = data.id || generateUniqueId(); // 臨時 ID，由 Go 端傳入
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
