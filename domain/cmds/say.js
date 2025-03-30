// domain/cmds/say.js
function say(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "say_help", {
            usage: "say <message>",
            description: "Broadcast a message to all players in your current room.",
            examples: "say Hello everyone!"
        });
    }

    if (!args) {
        return i18n(player.lang, "say_empty");
    }
    broadcastToArea("say_broadcast", { id: player.name, message: args }, player.x, player.y, player.id);
    return i18n(player.lang, "say_self", { message: args });
}
