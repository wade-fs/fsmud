// domain/cmds/two.js
function two(player, args) {
    if (!args || args === "-h" || args === "--help") {
        return i18n(player.lang, "two_help", {
            usage: "two <JSON> | two clear",
            description: "draw two object or clear the canvas.",
            examples: `two {'type':'ellipse','center_x':50,'center_y':20,'width':80,'height':40,'fill':'#3B2F2F','stroke':'#2A1E1E'}\ntwo clear\ntwo "M100 100 L200 200 Z"`
        });
    }

    sendToPlayer(player.id, JSON.stringify({ type: "two", data: args}));
    return "Draw two shapes done.";
}
