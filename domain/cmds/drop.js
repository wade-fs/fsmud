// domain/cmds/drop.js

function drop(player, args) {
    if (!args) {
        broadcastToRoom("Drop what?", player.room, false, player.id);
        return;
    }
    player.inventory = player.inventory || [];
    let itemIndex = player.inventory.findIndex(i => i.name === args);
    if (itemIndex === -1) {
        broadcastToRoom("You don't have that item.", player.room, false, player.id);
        return;
    }
    let item = player.inventory.splice(itemIndex, 1)[0];
    let room = Room.load(player.room);
    room.items.push(item);
    player.save();
    room.save();
    broadcastToRoom(`${player.username} dropped ${item.name}.`, player.room, false, player.id);
}
