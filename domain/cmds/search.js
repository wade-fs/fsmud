// domain/cmds/search.js

search(player, args) {
    let room = Room.load(player.room);
    if (room.items.length > 0) {
        let items = room.items.map(i => i.name).join(", ");
        broadcastToRoom(`You found: ${items}`, player.room, false, player.id);
    } else {
        broadcastToRoom("You found nothing.", player.room, false, player.id);
    }
}
