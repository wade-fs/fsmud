
function describe(player, args) {
    if (args === "-h" || args === "--help") {
        return { type: "message", message: i18n(player.lang, "finishCreation_help") };
    }

    if (player.area !== "character creation") {
        return { type: "error", message: i18n(player.lang, "not_in_character_creation") };
    }

    let requiredFields = ["nickname", "race", "bio", "lang"];
    let missingFields = [];

    for (let f of requiredFields) {
        if (!player[f]) {
            missingFields.push(f);
        }
    }

    if (missingFields.length > 0) {
        return { type: "error", message: i18n(player.lang, "missing_fields", { fields: missingFields.join(", ") }) };
    }

    player.area = "entrance";
    Player.save(player);
    return { type: "message", message: i18n(player.lang, "character_creation_complete") };
}
