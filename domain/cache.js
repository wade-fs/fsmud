// domain/cache.js
let cache = {
    rooms: {},
    npcs: {},
    items: {},
    cmds: {},
    players: {}
};

function preloadCache() {
    let roomFiles = fileLists.rooms;
    let npcFiles = fileLists.npcs;
    let itemFiles = fileLists.items;
    let playerFiles = fileLists.players;
    log("roomFiles", roomFiles);
    log("npcFiles", npcFiles);
    log("itemFiles", itemFiles);
    log("playerFiles", playerFiles);

    const { rooms = [], npcs = [], items = [], players = [] } = fileLists;

    rooms.forEach(name => {
        cache.rooms[name] = loadObject("rooms", name);
    });
    npcs.forEach(name => {
        cache.npcs[name] = loadObject("npcs", name);
    });
    items.forEach(name => {
        cache.items[name] = loadObject("items", name);
    });

	if (playerFiles != null) {
	    playerFiles.forEach(id => {
            log("loadObject(players)", id);
	        let savedData = loadObject("players", id);
	        if (savedData) {
	            players[id] = new Player(id, savedData.race);
	            players[id].room = savedData.room;
	            players[id].hp = savedData.hp;
	            players[id].mana = savedData.mana;
	            players[id].int = savedData.int;
	            players[id].spi = savedData.spi;
	            players[id].luck = savedData.luck;
	            players[id].inventory = savedData.inventory;
	            players[id].admin = savedData.admin || false;
	            players[id].nickname = savedData.nickname;
	            players[id].bio = savedData.bio;
	            log(`${id} preloaded from saved data.`);
	        }
	    });
	}
}
