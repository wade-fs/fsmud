// domain/combat.js

function processCombatTurn(npcId, roomId) {
    let queue = combatQueues[npcId];
    if (!queue || queue.length === 0) {
        delete combatQueues[npcId];
        return;
    }

    let player = queue.shift();
    if (!player.inCombat || player.combatTarget !== npcId) {
        processCombatTurn(npcId, roomId);
        return;
    }

    let npc = loadObject("npcs", npcId);
    if (npc.hp > 0) {
        let npcDamage = npc.attack;
        player.hp -= npcDamage;
        player.combatLog.push(i18n("attack_npc_turn", { npc: npc.name, id: player.id, damage: npcDamage, hp: player.hp, mana: player.mana }));
        broadcastToRoom(i18n("attack_npc_turn", { npc: npc.name, id: player.id, damage: npcDamage, hp: player.hp, mana: player.mana }), roomId);

        if (player.hp <= 0) {
            broadcastToRoom(`${player.id} has been defeated by ${npc.name}!`, roomId);
            player.inCombat = false;
            player.combatTarget = null;
        } else {
            queue.push(player);
            broadcastToRoom(i18n("attack_continue", { npc: npc.name, hp: npc.hp, id: player.id }), roomId);
        }
    }

    saveObject("npcs", npcId, npc);
    saveObject("players", player.id, player);

    if (queue.length > 0 && npc.hp > 0) {
        setTimeout(() => processCombatTurn(npcId, roomId), 2000);
    } else {
        delete combatQueues[npcId];
        for (let p of Object.values(players)) {
            if (p.combatTarget === npcId) {
                p.inCombat = false;
                p.combatTarget = null;
            }
        }
    }
}
