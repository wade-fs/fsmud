// domain/cmds/attack.js

function attack(player, args) {
    if (!args) {
        broadcastToRoom("Attack what?", player.room, false, player.id);
        return;
    }
    let room = Room.load(player.room);
    let npc = room.npcs.find(n => n.name === args);
    if (!npc) {
        broadcastToRoom("That NPC is not here.", player.room, false, player.id);
        return;
    }
    let damage = player.strength - npc.defense;
    npc.hp -= damage > 0 ? damage : 0;
    broadcastToRoom(`${player.username} dealt ${damage} damage to ${npc.name}.`, player.room, false, player.id);
    if (npc.hp <= 0) {
        broadcastToRoom(`${npc.name} has been defeated!`, player.room, false, player.id);
        room.npcs = room.npcs.filter(n => n.id !== npc.id);
        room.save();
    }
}
