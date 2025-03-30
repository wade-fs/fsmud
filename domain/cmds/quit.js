// domain/cmds/quit.js

function quit(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "quit_help", {
            usage: "quit",
            description: "Save your progress and exit the game."
        });
    }

    player.save();
    log("Player data saved for:", JSON.stringify(player, null, 2));
    removePlayer(player.id);
    log("Player removed:", player.id);
    return "goodbye";
}
