// domain/cmds/drop.js

function drop(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "drop_help", {
            usage: "drop <item_name>",
            description: "Drop an item from your inventory to your current location.",
            examples: "drop sword"
        });
    }

    let itemName = args.trim();
    if (!itemName) return "Drop what?";

    let itemIndex = player.inventory.findIndex(itemId => cache.items[itemId.toLowerCase()].name.toLowerCase() === itemName.toLowerCase());
    if (itemIndex === -1) return `You don't have ${itemName}.`;
    log(`Cmd drop ${args}`, itemIndex, JSON.stringify(player.inventory));

    let itemId = player.inventory[itemIndex].toLowerCase();
    let item = cache.items[itemId];

    // 從玩家背包移除物品
    player.inventory.splice(itemIndex, 1);
    player.save(); // 保存玩家狀態

    // 設定物品的新位置
    item.owner = null;
    item.x = player.x;
    item.y = player.y;

    // 加入當前區域的 items 陣列
    let currentArea = cache.areas[player.area];
    currentArea.items.push(item);

    broadcastToArea(`${player.name} dropped ${item.name}.`, player.x, player.y, player.id);
    return `You dropped ${item.name}.`;
}

