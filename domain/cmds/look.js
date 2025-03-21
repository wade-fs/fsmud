// domain/cmds/look.js

function look(player, args) {
    let room = Room.load(player.room);
    if (!room) {
        return "You are in a void.";
    }
    let description = room.description;
    if (args) {
        let item = room.items.find(i => i.name === args);
        if (item) {
            description = item.description;
        } else {
            description = "You don't see that here.";
        }
    } else {
        // Append exits to the default description
        const exits = Object.keys(room.exits).length > 0
            ? "出口: " + Object.keys(room.exits).join(", ")
            : "沒有明顯的出口。";
        description += `\n${exits}`;
    }
    return description;
}
