// domain/cmds/say.js
function say(player, args) {
    if (!args) {
        return i18n(player.lang, "say_empty");
    }
    let broadcastMsg = i18n(player.lang, "say_broadcast", { id: player.username, message: args });
    broadcastToRoom(broadcastMsg, player.room, player.id);
    return i18n(player.lang, "say_self", { message: args });
}
