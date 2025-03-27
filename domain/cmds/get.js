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

    let area = cache.areas[player.area];
    let itemsInArea = area.getItemsAt(player.x, player.y);
    log("get", JSON.stringify(itemsInArea));

    let item = itemsInArea.find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) return `There is no ${itemName} here.`;

    // 將物品加入玩家背包
    player.inventory.push(item.name);
    log("cmd get", JSON.stringify(player.inventory));
    item.owner = player.id;
    item.x = null;
    item.y = null;

    // 從區域中移除該物品
    area.removeItem(item.id);

    player.save(); // 保存玩家狀態
    broadcastToArea(`${player.name} picked up ${item.name}.`, player.x, player.y, player.id);
    return `You picked up ${item.name}.`;
}

