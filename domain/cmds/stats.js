// domain/cmds/stats.js

function stats(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "stats_help", {
            usage: "stats",
            description: "Display your character's current stats (level, HP, MP, strength, agility, weight)."
        });
    }

    log("stats", JSON.stringify(player.inventory));
    let totalWeight = player.inventory.reduce((sum, itemId) => {
        let item = cache.items[itemId];
        log("stats", "ITEM", JSON.stringify(item));
        return sum + (item?.weight || 0);
    }, 0);

    let statsData = {
        level: player.level,
        hp: player.hp,
        mp: player.mp,
        strength: player.strength,
        agility: player.agility,
        weight: totalWeight,
    };

    if (player.connectionType === "websocket") {
        return { type: "stats", data: statsData };
    }

    return `Level: ${player.level}, HP: ${player.hp}, MP: ${player.mp}, Strength: ${player.strength}, Agility: ${player.agility}, Weight: ${totalWeight}`;
}

