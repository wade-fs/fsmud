// domain/objects.js

function loadObject(type, name) {
    let filePath = `domain/${type}/${name}.json`;
    if (!cache[type][name]) {
        const rawData = loadFile(filePath);
        if (typeof rawData !== 'string' || rawData.trim() === '') {
            log(`Failed to load ${type}/${name} from ${filePath} (received: '${rawData}', type: ${typeof rawData})`);
            cache[type][name] = null; // Cache the failure to avoid repeated attempts
            return null;
        }
        
        try {
            cache[type][name] = JSON.parse(rawData);
        } catch (e) {
            log(`Failed to parse ${filePath} as JSON: ${e.message}`);
            cache[type][name] = null;
            return null;
        }
    }
    
    // Return a deep copy of the cached object, or null if loading failed
    return cache[type][name] ? JSON.parse(JSON.stringify(cache[type][name])) : null;
}

function saveObject(type, name, obj) {
    let filePath = `${type}/${name}.json`;
    saveFile(filePath, JSON.stringify(obj, null, 2));
    cache[type][name] = obj;
}
