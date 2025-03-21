// domain/cmds/quit.js

function quit(player, args) {
    player.save();
    removePlayer(player.id);
    return "goodbye";
}
