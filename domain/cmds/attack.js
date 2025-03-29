// domain/cmds/attack.js
function attack(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "attack_help", {
            usage: "attack <target_name>",
            description: "Attack an NPC within one tile of your current position. Costs 5 MP.",
            examples: "attack goblin"
        });
    }

    let targetName = args.trim();
    if (!targetName) return "Attack what?";

    let npcsInArea = Object.values(cache.npcs).filter(npc => Math.abs(npc.x - player.x) <= 1 && Math.abs(npc.y - player.y) <= 1);
    let target = npcsInArea.find(npc => npc.name.toLowerCase() === targetName.toLowerCase());

    if (!target) return `There is no ${targetName} here.`;

    if (player.mp < 5) return "You don't have enough mp to attack.";

    player.mp -= 5;

    let baseDamage = 2;
    let attributeDamage = player.strength;
    // 种族加成，根据 race 添加力量或敏捷加成
    switch (player.race) {
        case "Dragon":
            attributeDamage += 3; // 增加力量
            break;
        case "Dwarf":
        case "Beastman":
            attributeDamage += 1; // 增加力量
            break;
        case "Elf":
            player.agility += 2; // 增加敏捷
            break;
        // 其他种族可根据需要添加
        default:
            break;
    }
    let totalDamage = baseDamage + attributeDamage + Math.floor(player.level / 2);

    let criticalHitChance = (player.agility / 100) * 0.2;
    let isCritical = Math.random() < criticalHitChance;
    if (isCritical) {
        totalDamage = Math.floor(totalDamage * 1.5);
    }

    target.hp -= totalDamage;

    if (target.hp <= 0) {
        let message = `${player.name} killed ${target.name}!`;
        broadcastToArea(message, player.x, player.y);
        delete cache.npcs[target.id];
        return `You killed ${target.name}!`;
    } else {
        let broadcastMessage = `${player.name} attacked ${target.name}, dealing ${totalDamage} damage.`;
        if (isCritical) broadcastMessage += " It was a critical hit!";
        broadcastToArea(broadcastMessage, player.x, player.y);

        let returnMessage = `You attacked ${target.name}, dealing ${totalDamage} damage.`;
        if (isCritical) returnMessage += " It was a critical hit!";
        return returnMessage;
    }
}
