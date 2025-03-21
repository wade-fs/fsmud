// domain/cmds/stats.js

function stats(player, args) {
    let stats = `Level: ${player.level}, HP: ${player.hp}, MP: ${player.mp}, Strength: ${player.strength}, Agility: ${player.agility}`;
    broadcastToRoom(stats, player.room, false, player.id);
}
