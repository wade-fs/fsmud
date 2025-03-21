// domain/cmds/get.js

function get(player, args) {
    if (!args) {
        broadcastToRoom("Get what?", player.room, false, player.id);
        return;
    }
    let room = Room.load(player.room);
    let itemIndex = room.items.findIndex(i => i.name === args);
    if (itemIndex === -1) {
        broadcastToRoom("That item is not here.", player.room, false, player.id);
        return;
    }
    let item = room.items.splice(itemIndex, 1)[0];
    player.inventory = player.inventory || [];
    player.inventory.push(item);
    player.save();
    room.save();
    broadcastToRoom(`${player.username} picked up ${item.name}.`, player.room, false, player.id);
}
