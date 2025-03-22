// domain/cmds/say.js
function say(player, args) {
    if (!args) {
        return i18n(player.lang, "say_empty");
    }
    broadcastToRoom("say_broadcast", { id: player.username, message: args }, player.room, player.id);
    return i18n(player.lang, "say_self", { message: args });
}
