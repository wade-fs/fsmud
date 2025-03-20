// domain/commands.js

const commandAliases = {
    "take": "get",
    "pickup": "get",
    "exit": "quit"
};

function processCommand(playerID, cmd) {
    if (!players[playerID]) {
        addPlayer(playerID, cmd);
		return i18n("welcome", { username: cmd });
    }

    let player = players[playerID];
    if (!player) return i18n("player_not_found");

	if (cmd.startsWith("'")) {
        let message = cmd.slice(1);
        return player.say(message);
    }

    let parts = cmd.split(" ");
    let action = parts[0].toLowerCase();

    if (commandAliases[action]) {
        action = commandAliases[action];
    }

    if (player.inCombat && !["attack", "flee", "cast", "combatlog", "quit", "stats"].includes(action)) {
        return i18n("combat_restrict");
    }

    // Check for room-specific command using hide_exits[0].cmd
    let room = loadObject("rooms", player.room);
    if (room.hide_exits && room.hide_exits[0] && room.hide_exits[0].cmd === action) {
        return executeRoomCommand(player, action);
    }

    switch (action) {
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
        case "set":
            if (parts.length < 2) {
                return i18n("unknown_command");
            }
            let subcommand = parts[1].toLowerCase();
            let value = parts.slice(2).join(" ");
            switch (subcommand) {
                case "lang":
                    return player.setlang(value);
                case "nick":
                    return player.setnick(value);
                case "bio":
                    return player.setbio(value);
                case "weather":
                    if (player.admin) {
                        weather = value.toLowerCase();
                        broadcastGlobal(i18n("weather_broadcast", { weather, id: playerID }));
                        return i18n("weather_success", { weather });
                    }
                    return i18n("weather_permission");
                default:
                    return i18n("unknown_command");
            }
    }

    if (player[action] && typeof player[action] === "function") {
        try {
            return player[action](parts.slice(1).join(" "));
        } catch (e) {
            log(`Error executing ${action}: ${e}`);
            return i18n("unknown_command");
        }
    }
    return i18n("unknown_command");
}

function parseRoomPath(roomPath) {
    let parts = roomPath.split("/");
    return { 
        area: parts[0],
        room: parts[1]
    };
}
