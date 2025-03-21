// domain/objects.js

function loadObject(type, name) {
    if (!cache[type][name]) {
        let filePath = `domain/${type}/${name}.json`;
        let rawData = loadFile(filePath);
        if (typeof rawData !== 'string' || rawData.trim() === '') {
            log(`Failed to load ${type}/${name} from ${filePath} (received: '${rawData}', type: ${typeof rawData})`);
            cache[type][name] = null;
            return null;
        }
        rawData = rawData.split('\n')
            .filter(line => !line.trim().startsWith('//'))
            .join('\n');
        
        try {
            let data = JSON.parse(rawData);
            // 根據類型創建對應的 class 實例
            switch (type) {
                case "rooms":
                    cache[type][name] = new Room(data);
                    break;
                case "items":
                    cache[type][name] = new Item(data);
                    break;
                case "npcs":
                    cache[type][name] = new NPC(data);
                    break;
                case "players":
                    cache[type][name] = new Player(data);
                    break;
                case "maps":
                    cache[type][name] = new GameMap(data);
                    break;
                default:
                    cache[type][name] = data; // 其他類型保持原始數據
            }
        } catch (e) {
            log(`Failed to parse ${filePath} as JSON: ${e.message}`);
            cache[type][name] = null;
            return null;
        }
    }
    
    // 返回深拷貝的實例
    return cache[type][name] ? cache[type][name].clone() : null;
}

function saveObject(type, name, obj) {
    let filePath = `${type}/${name}.json`;
    // 只儲存屬性數據，不包括方法
    let data = obj.toJSON ? obj.toJSON() : obj;
    saveFile(filePath, JSON.stringify(data, null, 2));
    cache[type][name] = obj;
}
