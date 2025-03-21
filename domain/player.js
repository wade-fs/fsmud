// domain/player.js
function generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
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
        this.isAdmin = data.isAdmin || false;
        this.aliases = data.aliases || {};
        this.inventory = data.inventory || [];
    }

    save() {
        if (this.username) {
            saveFile(`domain/players/${this.username}.json`, JSON.stringify(this));
        }
        // 未登入的臨時玩家不儲存
    }

    static load(username) {
        let data = loadFile(`domain/players/${username}.json`);
        if (data) {
            data = data.split('\n')
                .filter(line => !line.trim().startsWith('//'))
                .join('\n');
            try {
                const playerData = JSON.parse(data);
                return new Player(playerData);
            } catch (e) {
                log("Error parsing player data for username", username, ":", e.message);
                return null;
            }
        }
        log("No player data found for username:", username);
        return null;
    }
}
