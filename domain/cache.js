// domain/cache.js
let cache = {
    rooms: {},
    npcs: {},
    items: {},
    cmds: {},
    players: {}
};

function preloadCache() {
    let { rooms = [], npcs = [], items = [], players = [] } = fileLists || {};
    rooms.forEach(name => cache.rooms[name] = loadObject("rooms", name));
    npcs.forEach(name => cache.npcs[name] = loadObject("npcs", name));
    items.forEach(name => cache.items[name] = loadObject("items", name));
}
