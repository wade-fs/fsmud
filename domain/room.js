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
        let room = loadObject("rooms", id);
        if (room) {
            return room;
        }
        return null;
    }
}
