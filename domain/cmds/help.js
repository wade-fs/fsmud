// domain/cmds/help.js
function help(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "help_help", {
            usage: "help [command]",
            description: "Show the list of commands or detailed help for a specific command.",
            examples: "help, help attack"
        });
    }

    if (!args) {
        return i18n(player.lang, "help_usage", { commands: cache.cmds.join(", ") });
    }

    let parts = args.trim().split(" ");
    let command = parts[0].toLowerCase();

    // 檢查命令是否存在
    if (!cache.cmds.includes(command)) {
        return i18n(player.lang, "help_not_found", { command });
    }

    // 執行命令的 help 模式
    try {
        let helpText = "";
        if (typeof this[command] === "function") {
            helpText = this[command](player, `-h`);
        }
        return helpText || i18n(player.lang, "help_no_info", { command });
    } catch (e) {
        log("Error", "help", `Failed to load help for ${command}: ${e.message}`);
        return i18n(player.lang, "help_error", { command });
    }
}
