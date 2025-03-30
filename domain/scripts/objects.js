// domain/scripts/objects.js

function loadObject(type, name) {
    if (!cache[type]) {
        cache[type] = {}; // 初始化 type 的快取
    }
    if (!cache[type][name]) {
        if (name.startsWith(`domain/${type}/`)) {
            const parts = name.split('/');
            const lastPart = parts[parts.length - 1];
            name = lastPart.split('.')[0];
        }
        let filePath = `domain/${type}/${name}.json`; // 假設檔案路徑
        let rawData = loadFile(filePath);
        if (typeof rawData !== 'string' || rawData.trim() === '') {
            log(`Failed to load ${type}/${name} from ${filePath}`);
            cache[type][name] = null;
            return null;
        }
        rawData = rawData.split('\n')
            .filter(line => !line.trim().startsWith('//'))
            .join('\n');
        
        try {
            let data = JSON.parse(rawData);
            switch (type) {
                case "items":
                    cache[type][name] = new Item(data);
                    break;
                case "npcs":
                    cache[type][name] = new NPC(data);
                    break;
                case "players":
                    cache[type][name] = new Player(data); // 為 "players" 創建 Player 實例
                    break;
                case "areas":
                    cache[type][name] = new Area(data);
                    break;
                default:
                    log(`Unknown type: ${type}, caching raw data`);
                    cache[type][name] = data; // 未知類型儲存原始資料
                    break;
            }
        } catch (e) {
            log(`Failed to parse ${filePath} as JSON: ${e.message}`);
            cache[type][name] = null;
            return null;
        }
    }
    
    if (cache[type][name] && typeof cache[type][name].clone === 'function') {
        return cache[type][name].clone();
    } else {
        log(`Error: cache[${type}][${name}] does not have a clone method`);
        return cache[type][name];
    }
}

function saveObject(type, name, obj) {
    let filePath = `domain/${type}/${name}.json`;
    let data = obj.toJSON ? obj.toJSON() : obj;
    saveFile(filePath, JSON.stringify(data, null, 2));
    cache[type][name] = obj;
}
