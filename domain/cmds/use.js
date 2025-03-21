function use(itemName) {
    let itemIndex = this.inventory.indexOf(itemName);
    if (itemIndex !== -1) {
        let item = cache.items[itemName];
        let result = item.use(this); // 調用 Item 的 use 方法
        saveObject("players", this.id, this); // 保存玩家狀態
        broadcastToRoom(`${this.id} used ${item.name}.`, this.room, "");
        return result;
    }
    return "You don't have that item.";
}
