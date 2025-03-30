
function describe(player, args) {
    if (args === "-h" || args === "--help") {
        return { type: "message", message: i18n(player.lang, "finishCreation_help") };
    }

    if (player.area !== "character creation") {
        return { type: "error", message: i18n(player.lang, "not_in_character_creation") };
    }

    let missingFields = [];

    if (!player.nickname) missingFields.push("nickname");
    if (!player.race) missingFields.push("race");
    if (!player.bio) missingFields.push("bio");
    if (!player.lang) missingFields.push("lang");

    if (missingFields.length > 0) {
        return { type: "error", message: i18n(player.lang, "missing_fields", { fields: missingFields.join(", ") }) };
    }

    return { type: "message", message: i18n(player.lang, "character_creation_complete") };
}
