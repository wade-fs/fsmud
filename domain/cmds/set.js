// domain/cmds/set.js
function set(player, args) {
    if (args === "" || args === "-h" || args === "--help") {
        return i18n(player.lang, "set_help", {
            usage: "set <field> <value>",
            description: "Set various properties like lang, nickname, bio, race.",
            examples: "set lang en, set nickname Hero"
        });
    }
    if (player.area != "character creation") {
        return { type: "error", message: "你只能在角色創建期間使用 'set' 命令。" };
    }

    let parts = args.split(" ");
    if (parts.length < 2) { return i18n("unknown_command"); }

    let field = parts[0].toLowerCase();
    let value = parts.slice(1).join(" ");

    if (["nickname", "race", "bio", "lang"].includes(field)) {
        if (field === "lang" && !["en", "zh"].includes(value)) {
            return { type: "error", message: "Invalid language. Choose 'en' or 'zh'." };
        }
        if (field === "race" && !["human", "dragon", "elf", "giant", "dwarf", "beastman", "demon", "animal"].includes(value.toLowerCase())) {
            return { type: "error", message: "Invalid race. Choose: human, dragon, elf, giant, dwarf, beastman, demon, animal" };
        }
        player[field] = value;
        if (field === "race") {
            applyRaceBonuses(player); // 應用種族加成
        }
        player.save();
        return { type: "message", message: `Set ${field} to ${value}.` };
    } else {
        return { type: "error", message: "Invalid field. Use 'nickname', 'race', 'bio', or 'lang'." };
    }
}

function applyRaceBonuses() {
    switch (this.race) {
        case "dragon":
            this.strength += 3;
            break;
        case "dwarf":
        case "beastman":
            this.strength += 1;
            break;
        case "elf":
            this.agility += 2;
            break;
        default:
            break;
    }
}
