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
        if (field === "lang") {
            if (["en", "zh"].includes(lang)) {
                player.lang = value;
                return i18n(player.lang, "setlang_success", { value });
            }
            return i18n(player.lang, "setlang_fail");
        } else if (field === "race") {
            if (["human", "dragon", "elf", "giant", "dwarf", "beastman", "demon", "animal"].includes(value.toLowerCase())) {
                this.race = value;
                this.applyRaceBonuses();
            } else { return "Invalid race."; }
        } else { player[field] = value; }
    } else {
        return i18n("unknown_command");
    }
    player.save();
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
