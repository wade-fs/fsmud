function use(itemName) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "use_help", {
            usage: "use <item_name>",
            description: "Use an item from your inventory.",
            examples: "use potion"
        });
    }

    let itemIndex = this.inventory.indexOf(itemName);
    if (itemIndex !== -1) {
        let item = cache.items[itemName];
        let result = item.use(this);
        saveObject("players", this.uuid, this);
        broadcastToArea(i18n("use_success", { id: this.id, item: item.name }), this.x, this.y, "");
        return result;
    }
    return i18n("use_fail");
}
