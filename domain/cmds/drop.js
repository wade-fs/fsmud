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

    let itemIndex = player.inventory.findIndex(itemId => cache.items[itemId].name.toLowerCase() === itemName.toLowerCase());
    if (itemIndex === -1) return `You don't have ${itemName}.`;

    let itemId = player.inventory[itemIndex];
    let item = cache.items[itemId];

    // 丟棄物品到當前座標
    item.owner = null;
    item.x = player.x;
    item.y = player.y;
    player.inventory.splice(itemIndex, 1); // 從背包移除
    player.save(); // 保存玩家狀態
    broadcastToArea(`${player.name} dropped ${item.name}.`, player.x, player.y, player.id);
    return `You dropped ${item.name}.`;
}
