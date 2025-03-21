// domain/cmds/say.js

function say(player, args) {
    if (!args) {
        return "Say what?";
    }
    return `${player.username} says: ${args}`;
}
