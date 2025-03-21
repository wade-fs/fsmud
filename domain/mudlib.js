// domain/mudlib.js

let fileLists = {
    rooms: ["entrance", "market"],
    items: ["fountain_water", "apple"],
    npcs: ["village_guard", "merchant"],
    players: [],
    cmds: ["say", "look", "get", "drop", "go", "use", "attack", "setnick", "setbio", "save", "stats", "setlang", "search"]
};


loadLanguage("en");
preloadCache();
updateWeatherAndTime();
