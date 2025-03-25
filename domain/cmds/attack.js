// domain/cmds/attack.js
function attack(player, args) {
  let targetName = args.trim();
  if (!targetName) return "Attack what?";

  let npcsInArea = Object.values(cache.npcs).filter(npc => Math.abs(npc.x - player.x) <= 1 && Math.abs(npc.y - player.y) <= 1);
  let target = npcsInArea.find(npc => npc.name.toLowerCase() === targetName.toLowerCase());

  if (!target) return `There is no ${targetName} here.`;

  if (player.mp < 5) return "You don't have enough mp to attack.";

  player.mp -= 5;

  let baseDamage = 2;
  let attributeDamage = player.strength + Math.floor(player.level / 2);
  let totalDamage = baseDamage + attributeDamage;

  let criticalHitChance = (player.agility / 100) * 0.2;
  let isCritical = Math.random() < criticalHitChance;
  if (isCritical) {
    totalDamage = Math.floor(totalDamage * 1.5);
  }

  target.health -= totalDamage;

  if (target.health <= 0) {
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
