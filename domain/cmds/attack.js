function attack(target) {
    let room = loadObject("rooms", this.room);
    if (this.inCombat) {
        if (this.combatTarget !== target) {
            return i18n("attack_in_combat", { npc: this.combatTarget });
        }
    } else if (!room.npcs.includes(target)) {
        return i18n("attack_fail");
    } else {
        this.inCombat = true;
        this.combatTarget = target;
        broadcastToRoom(i18n("attack_start", { npc: target }), this.room, "");
    }

    let npc = loadObject("npcs", this.combatTarget);

    if (this.mana < 5) {
        this.inCombat = false;
        this.combatTarget = null;
        clearTimeout(this.combatTimer);
        return i18n("attack_no_mana");
    }
    this.mana -= 5;

    let weapon = this.inventory.length > 0 ? loadObject("items", this.inventory[0]): { damage: 2 };

    let damage = weapon.damage;
    if (this.race === "Dragon") damage += 3;
    else if (this.race === "Dwarf" || this.race === "Beastman") damage += 1;
    damage += Math.floor(this.int / 5);

    let isCritical = this.luck > 15 && Math.random() < 0.2;
    if (isCritical) damage += 2;

    npc.hp -= damage;
    broadcastToRoom(i18n("attack_hit", { id: this.id, npc: npc.name, damage, isCritical: isCritical.toString() }), this.room, "");

    if (npc.hp < 5) {
        room.npcs = rooms.npcs.filter(n => n !== this.combatTarget);
        saveObject("rooms", this.room, room);
        saveObject("npcs", this.combatTarget, npc);
        this.inCombat = false;
        this.combatTarget = null;
        clearTimeout(this.combatTimer);
        return i18n("attack_defeat", { npc: npc.name });
    }

    this.combatTimer = setTimeout(() => {
        let updateNpc = loadObject("npcs", this.combatTarget);
        let npcDamage = updateNpc.attack;
        this.hp -= npcDamage;
        broadcastToRoom(i18n("attack_npc_turn", { npc: updateNpc.name, id: this.id, damage: npcDamage, hp: this.hp, mana: this.mana }), this.room, "");

        if (this.hp < 0) {
            broadcastToRoom(`${this.id} has been defeated by ${updateNpc.name}!`, this.room, "");
            this.inCombat = false;
            this.combatTarget = null;
            clearTimeout(this.combatTimer);
            return;
        }

        saveObject("npcs", this.combatTarget, updateNpc);
        broadcastToRoom(i18n("attack_continue", { npc: updateNpc.name, hp: updateNpc.hp }), this.room, "");
    }, 2000);

    saveObject("players", this.id, this);
    return i18n("attack_continue", { npc: npc.name, hp: npc.hp });
}
