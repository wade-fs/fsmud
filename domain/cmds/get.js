// domain/cmds/get.js

function get(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "get_help", {
            usage: "get <item_name>",
            description: "Pick up an unowned item at your current location.",
            examples: "get potion"
        });
    }
    let itemName = args.trim();
    if (!itemName) return "Get what?";

    // 找出同一座標的無主物品
    let itemsInArea = Object.values(cache.items).filter(item => item.x === player.x && item.y === player.y && item.owner === null);
    let item = itemsInArea.find(item => item.name.toLowerCase() === itemName.toLowerCase());

    if (!item) return `There is no ${itemName} here.`;

    // 將物品加入玩家背包
    player.inventory.push(item.id);
    item.owner = player.id;
    item.x = null; // 物品離開地圖
    item.y = null;
    player.save(); // 保存玩家狀態
    broadcastToArea(`${player.name} picked up ${item.name}.`, player.x, player.y, player.id);
    return `You picked up ${item.name}.`;
}
