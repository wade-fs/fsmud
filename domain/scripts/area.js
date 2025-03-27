// domain/scripts/area.js

class Area {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.width = data.width;
        this.height = data.height;
        this.grid = data.grid; // 二維陣列，元素為 "00" - "99" 或 "XX"
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
    clone() {
        return new Area({
            id: this.id,
            name: this.name,
            width: this.width,
            height: this.height,
            grid: this.grid.map(row => row.slice()) // 深拷貝二維陣列
        });
    }
}

let currentArea = Area.load("entrance");
