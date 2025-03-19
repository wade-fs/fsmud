function search() {
    let room = loadObject("rooms", this.room);
    if (room.hide_exits && room.hide_exits.length > 0) {
        return room.hide_exits[0].desc; // Display the first hide_exits description
    }
    return "You search around but find nothing of interest.";
}
