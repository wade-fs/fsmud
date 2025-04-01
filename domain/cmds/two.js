// domain/cmds/two.js
function two(player, args) {
    if (!args || args === "-h" || args === "--help") {
        return i18n(player.lang, "two_help", {
            usage: "two <JSON>",
            description: "draw two object.",
            examples: `two {'hair':{'shapes':[{'type':'ellipse','center_x':50,'center_y':20,'width':80,'height':40,'fill':'#3B2F2F','stroke':'#2A1E1E','linewidth':2}]}}`
        });
    }

    let str = args.replace(/'/g, '"')
    sendToPlayer(player.id, JSON.stringify({ type: "two", data: JSON.parse(str)}));
    return "cmd two";
}
