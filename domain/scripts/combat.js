// domain/scripts/combat.js

function processCombatTurn(npcId, roomId) {
    let queue = combatQueues[npcId];
    if (!queue || queue.length === 0) {
        delete combatQueues[npcId];
        return;
    }

    let player = queue.shift();
    if (!player.isCombat || player.combatTarget !== npcId) {
        processCombatTurn(npcId, roomId);
        return;
    }

    let npc = cache.npcs[npcId]; // 直接從 cache 取 NPC 實例
    if (npc.hp > 0) {
        let result = npc.attackPlayer(player);
        player.combatLog.push(result);
        broadcastToRoom(result, roomId, "");

        if (player.hp <= 0) {
            broadcastToRoom(`${player.id} has been defeated by ${npc.name}!`, roomId, "");
            player.isCombat = false;
            player.combatTarget = null;
        } else {
            queue.push(player);
            broadcastToRoom(i18n("attack_continue", { npc: npc.name, hp: npc.hp, id: player.id }), roomId, "");
        }
    }

    saveObject("npcs", npcId, npc);
    saveObject("players", player.uuid, player);

    if (queue.length > 0 && npc.hp > 0) {
        setTimeout(() => processCombatTurn(npcId, roomId), 2000);
    } else {
        delete combatQueues[npcId];
        for (let p of Object.values(players)) {
            if (p.combatTarget === npcId) {
                p.isCombat = false;
                p.combatTarget = null;
            }
        }
    }
}
