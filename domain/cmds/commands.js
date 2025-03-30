// domain/cmds/commands.js

function commands(player, args) {
    log("Info", "commands", cache.cmds.join(", "));
    return cache.cmds.join(", ");
}
