// domain/cmds/quit.js

function quit(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "quit_help", {
            usage: "quit",
            description: "Save your progress and exit the game."
        });
    }

    player.save();
    removePlayer(player.id);
    return "goodbye";
}
