// domain/cmds/finish.js

function finish(player, args) {
    if (args === "-h" || args === "--help") {
        return { type: "message", message: "Usage: finish\nCompletes character creation and enters the game." };
    }

    if (player.area !== "character creation") {
        return { type: "error", message: "You can only use 'finish' in character creation mode." };
    }

    if (!player.nickname || !player.race || !player.bio || !player.lang) {
        return { type: "error", message: "You must set all fields before finishing. Use 'describe' to see what's missing." };
    }

    player.area = "entrance";
    players[player.id] = player;
    players[player.uuid] = player;
    player.save();
    return { type: "message", message: "Character creation complete. Welcome to the MUD!" };
}
