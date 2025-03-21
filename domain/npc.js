// domain/npc.js

class NPC {
    constructor(id, name, hp, defense) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.defense = defense;
    }

    static load(id) {
        let data = loadFile(`domain/npcs/${id}.json`);
        data = data.split('\n')
                .filter(line => !line.trim().startsWith('//')) // Remove lines starting with //
                .join('\n');
        if (data) return Object.assign(new NPC(), JSON.parse(data));
        return null;
    }
}

function attack(playerId, npcId) {
    let player = Player.load(playerId);
    let npc = NPC.load(npcId);
    if (!player || !npc) return;

    let damage = player.strength - npc.defense;
    npc.hp -= damage > 0 ? damage : 0;
    broadcastToRoom(`${player.username} dealt ${damage} damage to ${npc.name}`, player.room, false, "");

    if (npc.hp <= 0) {
        broadcastToRoom(`${npc.name} has been defeated!`, player.room, false, "");
    }
}
