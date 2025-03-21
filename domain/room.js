// domain/room.js

class Room {
    constructor(id, description) {
        this.id = id;
        this.description = description;
        this.exits = {}; // 出口方向與目標房間
        this.npcs = [];  // 房間內的 NPC
        this.items = []; // 房間內的物品
    }

    static load(id) {
        let data = loadFile(`domain/rooms/${id}.json`);
        if (data) {
            // Remove single-line comments (//) before parsing
            data = data.split('\n')
                .filter(line => !line.trim().startsWith('//')) // Remove lines starting with //
                .join('\n');
            try {
                let roomData = JSON.parse(data);
                let room = new Room(roomData.id, roomData.description);
                Object.assign(room, roomData);
                return room;
            } catch (e) {
                console.log(`Error parsing room ${id}: ${e}`);
                return null;
            }
        }
        return null;
    }
}
