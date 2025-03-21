// domain/cmds/attack.js
function attack(player, args) {
    if (!args) {
        let msg = i18n(player.lang, "attack_empty");
        broadcastToRoom(msg, player.room, player.id);
        return;
    }
    let room = Room.load(player.room);
    let npc = room.npcs.find(n => n.name === args);
    if (!npc) {
        let msg = i18n(player.lang, "attack_fail");
        broadcastToRoom(msg, player.room, player.id);
        return;
    }
    let damage = player.strength - npc.defense;
    npc.hp -= damage > 0 ? damage : 0;
    let damageMsg = i18n(player.lang, "attack_hit", { id: player.username, npc: npc.name, damage });
    broadcastToRoom(damageMsg, player.room, player.id);
    if (npc.hp <= 0) {
        let defeatMsg = i18n(player.lang, "attack_defeat", { npc: npc.name });
        broadcastToRoom(defeatMsg, player.room, player.id);
        room.npcs = room.npcs.filter(n => n.id !== npc.id);
        room.save();
    }
}
