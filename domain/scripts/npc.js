// domain/scripts/npc.js

class NPC {
    constructor(id, name, hp, defense) {
        this.id = id;
        this.name = name;
        this.hp = hp;
        this.defense = defense;
    }

    static load(id) {
        let data = loadFile(`domain/npcs/${id}.json`);
        if (!data) return null;
        data = data.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
        try {
            return new NPC(JSON.parse(data));
        } catch (e) {
            log(`Failed to parse NPC ${id}: ${e.message}`);
            return null;
        }
    }
    clone() {
        return new NPC({
            id: this.id,
            name: this.name,
            hp: this.hp,
            defense: this.defense
        })
    }
}
