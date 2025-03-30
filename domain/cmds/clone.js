// domain/cmds/clone.js

function clone(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "clone_help", {
            usage: "clone <item_name>",
            description: "Clone an item into the current room (admin only).",
            examples: "clone sword"
        });
    }

    if (!player.isAdmin) {
        return "You do not have permission to use this command.";
    }

    let itemName = args.trim();
    if (!itemName) {
        return "Clone what?";
    }

    let item = Object.values(cache.items).find(i => i.name.toLowerCase() === itemName.toLowerCase());
    if (!item) {
        return `Item ${itemName} not found.`;
    }

    let newItem = item.clone();
    newItem.id = generateUUID();
    newItem.owner = null;

    let area = cache.areas[player.area];
    if (!area.addItem(newItem, player.x, player.y)) {
        return "Failed to clone item: invalid position.";
    }

    cache.items[newItem.id] = newItem;

    broadcastToArea(`${player.name} cloned ${newItem.name} into the room.`, player.x, player.y, player.id);

    return `You cloned ${newItem.name} into the room.`;
}
