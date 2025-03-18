// domain/combat.js

function processCombatTurn(npcId, roomId) {
    let npc = loadObject("npcs", npcId);
    let player = Object.values(players).find(p => p.combatTarget === npcId && p.isCombat);
    if (!player || !npc || npc.hp <= 0) return;

    let npcDamage = npc.attack;
    player.hp -= npcDamage;
    broadcastToRoom(`${npc.name} hits ${player.id} for ${npcDamage} damage!`, roomId);

    if (player.hp <= 0) {
        broadcastToRoom(`${player.id} has been defeated by ${npc.name}!`, roomId);
        player.isCombat = false;
        player.combatTarget = null;
    }

    saveObject("npcs", npcId, npc);
    saveObject("players", player.id, player);
}
