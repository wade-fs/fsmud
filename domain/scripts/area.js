// domain/scripts/area.js

class Area {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.width = data.width;
        this.height = data.height;
        this.grid = data.grid;
        this.items = data.items || [];
    }

    static load(id) {
        let data = loadFile(`domain/areas/${id}.json`);
        if (!data) return null;
        data = data.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
        try {
            return new Area(JSON.parse(data));
        } catch (e) {
            log(`Failed to parse Area ${id}: ${e.message}`);
            return null;
        }
    }

    isPassable(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        return this.grid[y][x] !== "XX";
    }

    getTerrain(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return this.grid[y][x];
    }
    addItem(item, x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            log(`Cannot place item ${item.id}, position (${x},${y}) is out of bounds.`);
            return false;
        }
        this.items.push({ id: item.id, name:item.name, x, y });
        return true;
    }

    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
    }

    getItemsAt(x, y) {
        log(`getItemsAt(${x},${y})`, JSON.stringify(this.items));
        return this.items.filter(item => item.x === x && item.y === y);
    }
    clone() {
        return new Area({
            id: this.id,
            name: this.name,
            width: this.width,
            height: this.height,
            grid: this.grid.map(row => row.slice()),
            items: this.items.map(item => ({ ...item }))
        });
    }
}

let currentArea = Area.load("entrance");
