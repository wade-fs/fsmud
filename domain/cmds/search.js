// domain/cmds/search.js

function search(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "search_help", {
            usage: "search",
            description: "Look for items in your current room."
        });
    }

/* TODO: use area to replace room
    let room = Room.load(player.room);
    if (room.items.length > 0) {
        let items = room.items.map(i => i.name).join(", ");
        broadcastToRoom(`You found: ${items}`, player.room, false, player.id);
    } else {
        broadcastToRoom("You found nothing.", player.room, false, player.id);
    }
*/
}
