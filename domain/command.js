// domain/command.js
function processCommand(playerId, input) {
    let player = players[playerId]; // 優先從全局 players 獲取
    if (!player) {
        // 如果 players 中沒有，創建一個臨時玩家，但不再嘗試從 playerId 載入檔案
        player = new Player({ id: playerId });
    }

    let parts = input.trim().split(" ");
    let cmd = parts[0];
    let args = parts.slice(1).join(" ");

    // 未登入時限制命令
    if (!player.username) {
        if (cmd !== "login") {
            return "Please login first using: login <username> <password>";
        }
    }

    if (player.username && !players[playerId]) {
        players[playerId] = player;
        players[player.uuid] = player; // 添加 uuid 索引
    }

    // 檢查玩家自訂別名
    if (player.aliases[cmd]) {
        cmd = player.aliases[cmd];
    }

    if (typeof this[cmd] === "function") {
        let adminCommands = ["shutdown", "priv"];
        if (adminCommands.includes(cmd) && !player.isAdmin) {
            return "You are not authorized to use this command.";
        }

        if (cmd === "shutdown") {
            if (player.isAdmin) {
                broadcastGlobal("System shutting down...");
                shutdown();
            }
            return "";
        }

        log("processCommand", player.username, cmd);
        let result = this[cmd](player, args);
        // 在執行命令後將玩家存入全局 players（特別是登入後）
        if (player.username && !players[playerId]) {
            players[playerId] = player;
        }
        return result;
    } else {
        log("processCommand", "Unknown command:", cmd);
        return "Unknown command";
    }
}
