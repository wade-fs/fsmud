// domain/cmds/stats.js

function stats(player, args) {
    let statsData = {
        level: player.level,
        hp: player.hp,
        mp: player.mp,
        strength: player.strength,
        agility: player.agility
    };
    if (player.connectionType === "websocket") {
        return { type: "stats", data: statsData };
    }
    return `Level: ${player.level}, HP: ${player.hp}, MP: ${player.mp}, Strength: ${player.strength}, Agility: ${player.agility}`;
}
