// domain/scripts/command.js

function processCommand(playerId, input) {
    let player = players[playerId];
    if (!player) {
        player = new Player({ id: playerId });
    }

    let parts = input.trim().split(" ");
    let cmd = parts[0];
    let args = parts.slice(1).join(" ");
    if (!player.name) {
        cmd = "login";
        args = input;
    }

    if (!player.name && cmd !== "login") {
        return formatOutput(player, "Please login first using: login <name> <password>");
    }

    if (player.name && !players[playerId]) {
        players[playerId] = player;
        players[player.uuid] = player;
    }

    if (typeof this[cmd] === "function") {
        let adminCommands = ["shutdown", "priv", "reloadJs", "reloadJSON"];
        if (adminCommands.includes(cmd)) {
            if (!player.isAdmin) {
                log("Info", "player is not admin");
                return formatOutput(player, "You are not authorized to use this command.");
            }
            if (cmd !== "priv") {
                log("Info", "player is admin, cmd", cmd);
                this[cmd]();
                return formatOutput(player, "");
            }
        } else {
            log("Info", "normal cmd ", cmd);
        }

        log("processCommand", player.name, cmd);
        let result = this[cmd](player, args);
        // 在執行命令後將玩家存入全局 players（特別是登入後）
        if (player.name && !players[playerId]) {
            players[playerId] = player;
        }
        if (cmd === "login" && result.type === "login_success") {
            let statsResult = stats(player, "");
            let statsMessage = formatOutput(player, statsResult);
            sendToPlayer(playerId, statsMessage); // 使用臨時 ID 發送
        }
        return formatOutput(player, result);
    } else {
        log("processCommand", "Unknown command:", cmd);
        return formatOutput(player, "Unknown command");
    }
}

// Helper function to format output based on connectionType
function formatOutput(player, result) {
    if (player.connectionType === "websocket") {
        if (typeof result === "object") {
            return JSON.stringify(result); // Already structured
        }
        return JSON.stringify({ type: "command_result", message: result });
    }
    return typeof result === "string" ? result : result.message || "Unknown response";
}
