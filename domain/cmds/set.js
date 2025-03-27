// domain/cmds/set.js
function set(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "set_help", {
            usage: "set <subcommand> <value>",
            description: "Set various properties like language, nickname, bio, or weather (admin only).",
            examples: "set lang en, set nick Hero, set weather sunny"
        });
    }

    let parts = args.split(" ");
    if (parts.length < 2) {
        return i18n("unknown_command");
    }
    let subcommand = parts[0].toLowerCase();
    let value = parts.slice(1).join(" ");
    switch (subcommand) {
        case "lang":
            let lang = value;
            if (["en", "zh"].includes(lang)) {
                loadLanguage(lang);
                player.lang = lang;
                player.save();
                return i18n(player.lang, "setlang_success", { lang });
            }
            return i18n(player.lang, "setlang_fail");
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
        case "race":
            if (["Human", "Dragon", "Elf", "Giant", "Dwarf", "Beastman", "Demon", "OtherAnimal"].includes(newRace)) {
                this.race = newRace;
                this.applyRaceBonuses();
                saveObject("players", this.id, this);
            } else {
                return "Invalid race.";
            }
        default:
            return i18n("unknown_command");
    }
}

function applyRaceBonuses() {
    switch (this.race) {
        case "Dragon":
            this.strength += 3;
            break;
        case "Dwarf":
        case "Beastman":
            this.strength += 1;
            break;
        case "Elf":
            this.agility += 2;
            break;
        default:
            break;
    }
}
