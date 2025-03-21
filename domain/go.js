// domain/go.js

commands.go = function(player, direction) {
    let room = Room.load(player.room);
    if (room.exits[direction]) {
        player.room = room.exits[direction];
        player.save();
        broadcastToRoom(`${player.username} moved to ${player.room}`, player.room, false, player.id);
        commands.look(player, ""); // 進入新房間後自動看房間
    } else {
        broadcastToRoom("No exit in that direction", player.room, false, player.id);
    }
};
