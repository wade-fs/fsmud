// domain/generateMap.js

function generateMap(areaName, mapFile) {
    let { map, desc: descMap, null: nullPoints } = loadMapData(areaName, mapFile);

    let rows = map.length;
    if (rows === 0) throw new Error("Empty map data");
    let cols = map[0].length;

    // Generate room objects
    let rooms = {};
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let symbol = map[y][x];
            if (nullPoints.has(symbol)) continue;

            let roomId = `${areaName}/${y+1}-${x+1}`;
            let room = {
                desc: descMap[symbol] || "未知區域",
                exits: {},
                items: [],
                npcs: []
            };

            // Add exits
            if (x > 0 && !nullPoints.has(map[y][x-1])) {
                room.exits.west = `${areaName}/${y+1}-${x}`;
            }
            if (x < cols-1 && !nullPoints.has(map[y][x+1])) {
                room.exits.east = `${areaName}/${y+1}-${x+2}`;
            }
            if (y > 0 && !nullPoints.has(map[y-1][x])) {
                room.exits.north = `${areaName}/${y}-${x+1}`;
            }
            if (y < rows-1 && !nullPoints.has(map[y+1][x])) {
                room.exits.south = `${areaName}/${y+2}-${x+1}`;
            }

            rooms[roomId] = room;
        }
    }

    // Save room files
    for (let roomId in rooms) {
        let filePath = `domain/rooms/${roomId}.json`;
        saveFile(filePath, JSON.stringify(rooms[roomId], null, 2));
    }
}
