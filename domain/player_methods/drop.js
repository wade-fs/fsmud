function drop(itemName) {
    let itemIndex = this.inventory.indexOf(itemName);
    if (itemIndex !== -1) {
        this.inventory.splice(itemIndex, 1);
        let room = loadObject("rooms", this.room);
        room.items.push(itemName);
        saveObject("rooms", this.room, room);
        broadcastToRoom(i18n("drop_broadcast", { id: this.id, item: itemName }), this.room);

        let timerKey = `${this.room}/${itemName}`;
        if (timers[timerKey]) {
            clearTimeout(timers[timerKey]);
        }
        timers[timerKey] = setTimeout(() => {
            let updatedRoom = loadObject("rooms", this.room);
            let idx = updatedRoom.items.indexOf(itemName);
            if (idx !== -1) {
                updatedRoom.items.splice(idx, 1);
                saveObject("rooms", this.room, updatedRoom);
                broadcastToRoom(i18n("drop_vanish", { item: itemName, room: this.room }), this.room);
            }
            delete timers[timerKey];
        }, 10000);

        return i18n("drop_success", { item: itemName });
    }
    return i18n("drop_fail");
}
