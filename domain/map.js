// domain/map.js
class GameMap {
	static cache = new Map();
    constructor(id, description, width, height) {
        this.id = id;
        this.description = description;
        this.width = width;
        this.height = height;
        this.grid = [];
    }

    initializeGrid(gridData) {
        if (!gridData || !Array.isArray(gridData) || gridData.length !== this.height) {
            log(`Invalid grid data for map ${this.id}, initializing default grid`);
            this.grid = [];
            for (let y = 0; y < this.height; y++) {
                this.grid[y] = [];
                for (let x = 0; x < this.width; x++) {
                    this.grid[y][x] = {
                        description: "An empty space.",
                        passable: true,
                        items: [],
                        npcs: []
                    };
                }
            }
        } else {
            this.grid = gridData;
            // 驗證 grid 結構
            for (let y = 0; y < this.height; y++) {
                if (!Array.isArray(this.grid[y]) || this.grid[y].length !== this.width) {
                    log(`Grid row ${y} in map ${this.id} is invalid, resetting`);
                    this.grid[y] = [];
                    for (let x = 0; x < this.width; x++) {
                        this.grid[y][x] = {
                            description: "An empty space.",
                            passable: true,
                            items: [],
                            npcs: []
                        };
                    }
                }
            }
        }
        log(`Initialized grid for ${this.id}: ${JSON.stringify(this.grid)}`);
    }

    getCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[y][x] || null;
        }
        return null;
    }

    isPassable(x, y) {
        let cell = this.getCell(x, y);
        return cell ? cell.passable : false;
    }

    static load(id) {
        log(`Attempting to load map: domain/maps/${id}.json`);
        if (GameMap.cache.has(id)) {
            log(`Returning cached map: ${id}`);
            return GameMap.cache.get(id).clone(); // 返回深拷貝
        }

        let data = loadFile(`domain/maps/${id}.json`);
        if (!data) {
            log(`Failed to load map file: domain/maps/${id}.json - No data returned`);
            return null;
        }
        log(`Raw map data: ${data}`);
        data = data.split('\n')
            .filter(line => !line.trim().startsWith('//'))
            .join('\n');
        try {
            let mapData = JSON.parse(data);
            let map = new GameMap(mapData.id, mapData.description, mapData.width, mapData.height);
            map.initializeGrid(mapData.grid);
            GameMap.cache.set(id, map);
            return map;
        } catch (e) {
            log(`Error parsing map ${id}: ${e.message}`);
            return null;
        }
    }

    clone() {
        let clonedMap = new GameMap(this.id, this.description, this.width, this.height);
        clonedMap.grid = JSON.parse(JSON.stringify(this.grid)); // 深拷貝網格
        return clonedMap;
    }
}
