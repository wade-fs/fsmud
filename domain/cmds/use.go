function use(itemName) {
    let itemIndex = this.inventory.indexOf(itemName);
    if (itemIndex !== -1) {
        let item = cache.items[itemName];
        let result = item.use(this);
        saveObject("players", this.id, this);
        broadcastToRoom(i18n("use_success", { id: this.id, item: item.name }), this.room, "");
        return result;
    }
    return i18n("use_fail");
}
