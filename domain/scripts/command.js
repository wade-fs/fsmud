// domain/scripts/command.js

function processCommand(playerId, input) {
	input = input.trim();
    if (input.length == 0) {
		return;
    }

    let player = players[playerId];
    let parts = input.trim().split(" ");
    let cmd = parts[0];
    let args = parts.slice(1).join(" ");

    if (!player.name && cmd !== "login") {
        return formatOutput(player, "Login usage: login <name> <password>");
    }

    log(`processCommand(${playerId}) ${input}`);
    if (typeof this[cmd] === "function") {
        // 先執行 login 命令以載入資料或創建新玩家
        if (cmd === "login") {
            let result = this[cmd](player, args);
            if (result.type === "login_success") {
                let statsResult = stats(player, "");
                let statsMessage = formatOutput(player, statsResult);
                sendToPlayer(playerId, statsMessage);
            }
            return formatOutput(player, result);
        }

        // 檢查是否在 character creation 模式，並限制命令
        if (player.area === "character creation" && !["set", "describe", "finish", "quit"].includes(cmd)) {
            return formatOutput(player, "You can only use 'set', 'describe', 'finish', and 'quit' commands in character creation mode.");
        }

        // 管理員命令限制
        let adminCommands = ["shutdown", "priv", "reloadJs", "reloadJSON"];
        if (adminCommands.includes(cmd) && !player.isAdmin) {
            return formatOutput(player, "You are not authorized to use this command.");
        }

        // 執行其他命令
        let result = this[cmd](player, args);
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
