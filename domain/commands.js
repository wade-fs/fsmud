// domain/commands.js

const commandAliases = {
    "take": "get",
    "pickup": "get",
    "exit": "quit"
};

function processCommand(playerID, cmd) {
    if (!players[playerID]) {
        addPlayer(playerID, cmd);
		return i18n("welcome_user", { username: cmd });
    }

    let player = players[playerID];
    if (!player) return i18n("player_not_found");

    let parts = cmd.split(" ");
    let action = parts[0].toLowerCase();

    if (commandAliases[action]) {
        action = commandAliases[action];
    }

    if (player.inCombat && !["attack", "flee", "cast", "combatlog", "quit", "stats"].includes(action)) {
        return i18n("combat_restrict");
    }

    switch (action) {
        case "look":
            return player.look(parts[1]);
        case "go":
            return player.go(parts[1]);
        case "get":
            return player.get(parts[1]);
        case "drop":
            return player.drop(parts[1]);
        case "attack":
            return player.attack(parts[1]);
        case "flee":
            return player.flee(parts[1]);
        case "cast":
            return player.cast(parts[1]);
        case "combatlog":
            return player.combatlog(parts[1]);
        case "stats":
            return player.stats(parts[1]);
        case "save":
            return player.save();
        case "quit":
            removePlayer(playerID);
            return i18n("goodbye");
        case "shutdown":
            if (player.admin) {
                shutdown();
                return i18n("shutdown_success");
            }
            return i18n("shutdown_permission");
        case "kick":
            if (player.admin && parts[1]) {
                if (players[parts[1]]) {
                    let targetRoom = players[parts[1]].room;
                    removePlayer(parts[1]);
                    broadcastToRoom(i18n("kick_broadcast", { id: parts[1], admin: playerID }), targetRoom);
                    return i18n("kick_success", { id: parts[1] });
                }
                return i18n("kick_fail");
            }
            return i18n("kick_permission");
        case "weather":
            if (player.admin && parts[1] === "set" && parts[2]) {
                weather = parts[2].toLowerCase();
                broadcastGlobal(i18n("weather_broadcast", { weather, id: playerID }));
                return i18n("weather_success", { weather });
            }
            return i18n("weather_permission");
        case "setnick":
            return player.setnick(parts[1]);
        case "setbio":
            return player.setbio(parts.slice(1).join(" "));
        case "setlang":
            return player.setlang(parts[1]);
        default:
            return i18n("unknown_command");
    }
}

function parseRoomPath(roomPath) {
    let parts = roomPath.split("/");
    return { 
        area: parts[0],
        room: parts[1]
    };
}
