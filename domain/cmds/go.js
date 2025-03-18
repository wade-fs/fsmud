function go(direction) {
    let room = loadObject("rooms", this.room);
    if (room.exits[direction]) {
        this.room = room.exits[direction];
        let { area } = parseRoomPath(this.room);
        broadcastToRoom(`${this.id} moved to ${area}`, this.room);
        return this.look();
    }
    return i18n("go_fail");
}

