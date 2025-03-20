function go(direction) {
    if (this.virtualRoom) {
        return moveInVirtualMap(this, direction);
    }
    let room = loadObject("rooms", this.room);
    if (room.exits[direction]) {
        this.room = room.exits[direction];
        let { area } = parseRoomPath(this.room);
        broadcastToRoom(`${this.id} moved to ${area}`, this.room, "");
        return this.look();
    }
    return i18n("go_fail");
}

// Function to handle virtual map movement
function moveInVirtualMap(player, direction) {
    let [roomId, cmd, coords] = player.virtualRoom.split("/");
    let [x, y] = coords.split(",").map(Number);
    let room = loadObject("rooms", roomId);
    let hideExit = room.hide_exits[0]; // Use only the first hide_exits entry
    let map = hideExit.map.split(";"); // 3x3 map rows
    let syms = hideExit.syms;

    // Calculate new position
    if (direction === "north" && x > 0) x--;
    else if (direction === "south" && x < 2) x++;
    else if (direction === "east" && y < 2) y++;
    else if (direction === "west" && y > 0) y--;
    else return "You can't go that way!";

    let newPos = `${x},${y}`;
    let row = map[x];
    let sym = row[y];

    broadcastToRoom(`newPos(${x}, ${y}): '${sym}'`, roomId, "");
    // Check for exit
    if (sym === "x") {
        player.virtualRoom = null;
        return `You exit the hidden area and return to ${room.desc}.`;
    }

    player.virtualRoom = `${roomId}/${cmd}/${newPos}`;
    let desc = syms[sym] || "An undefined area.";
    return `You move to a ${desc}.`;
}

// Updated executeRoomCommand to use hide_exits[0].cmd
function executeRoomCommand(player, cmd) {
    let room = loadObject("rooms", player.room);
    if (!room.hide_exits || !room.hide_exits[0] || player.virtualRoom) {
        return i18n("unknown_command"); // No hidden exits or already in virtual map
    }

    let hideExit = room.hide_exits[0]; // Explicitly use the first hide_exits entry
    if (hideExit.cmd !== cmd) {
        return i18n("unknown_command"); // Command doesn't match hide_exits[0].cmd
    }

    if (cmd === hideExit.cmd) {
        let map = hideExit.map.split(";"); // 3x3 map rows
        let startX, startY;

        // Find starting position (*)
        for (let i = 0; i < 3; i++) {
            let row = map[i];
            let j = row.indexOf("*");
            if (j !== -1) {
                startX = i;
                startY = j;
                break;
            }
        }

        player.virtualRoom = `${player.room}/${hideExit.cmd}/${startX},${startY}`;
        let syms = hideExit.syms;
        let desc = syms[map[startX][startY]] || "An undefined area.";
        return `You ${hideExit.cmd} and enter a ${desc}.`;
    }

    return i18n("unknown_command"); // Default for unrecognized room commands
}
