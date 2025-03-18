function get(itemName) {
    let room = loadObject("rooms", this.room);
    let itemIndex = room.items.indexOf(itemName);
    if (itemIndex !== -1) {
        let item = loadObject("items", itemName);
        room.items.splice(itemIndex, 1);
        this.inventory.push(itemName);
        saveObject("rooms", this.room, room);
        broadcastToRoom(i18n("get_broadcast", { id: this.id, item: itemName }), this.room);
        return i18n("get_success", { item: `${itemName} (Weight: ${item.weight}, Value: ${item.value})` });
    }
    return i18n("get_fail");
}
