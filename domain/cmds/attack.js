// domain/cmds/attack.js
function attack(player, args) {
  let targetName = args.trim();
  if (!targetName) return "Attack what?";

  // 找出同一座標的 NPC
  let npcsInArea = Object.values(cache.npcs).filter(npc => npc.x === player.x && npc.y === player.y);
  let target = npcsInArea.find(npc => npc.name.toLowerCase() === targetName.toLowerCase());

  if (!target) return `There is no ${targetName} here.`;

  // 簡單戰鬥邏輯：玩家造成 10 點傷害
  let damage = 10;
  target.health -= damage;

  if (target.health <= 0) {
    broadcastToArea(`${player.name} killed ${target.name}!`, player.x, player.y);
    delete cache.npcs[target.id]; // 移除被擊殺的 NPC
    return `You killed ${target.name}!`;
  } else {
    broadcastToArea(`${player.name} attacked ${target.name}, dealing ${damage} damage.`, player.x, player.y);
    return `You attacked ${target.name}, dealing ${damage} damage.`;
  }
}
