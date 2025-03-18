function attack(target) {
    let room = loadObject("rooms", this.room);
    if (room.npcs.includes(target)) {
        let npc = loadObject("npcs", target);

        if (this.mana < 5) {
            return i18n("attack_no_mana");
        }
        this.mana -= 5;

        let weapon = this.inventory.length > 0 ? loadObject("items", this.inventory[0]) : { damage: 2 };
        let damage = weapon.damage;

        if (this.race === "Dragon") damage += 3;
        else if (this.race === "Dwarf" || this.race === "Beastman") damage += 1;

        damage += Math.floor(this.int / 5);

        let isCritical = this.luck > 15 && Math.random() < 0.2;
        if (isCritical) damage *= 2;

        if (weather === "rainy") damage = Math.floor(damage * 0.8);

        npc.hp -= damage;
        broadcastToRoom(i18n("attack_hit", { id:this.id, npc: npc.name, damage, isCritical: isCritical.toString() }), this.room);

        if (npc.hp <= 0) {
            room.npcs = room.npcs.filter(n => n !== target);
            saveObject("rooms", this.room, room);
            saveObject("npcs", target, npc);
            return i18n("attack_defeat", { npc: npc.name });
        }
        this.hp -= npc.attack;
        saveObject("npcs", target, npc);
        return i18n("attack_continue", { npc: npc.name, hp: npc.hp, attack: npc.attack, hp: this.hp, mana: this.mana });
    }
    return i18n("attack_fail");
}
