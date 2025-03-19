// domain/objects.js

function loadObject(type, name) {
    let filePath = `domain/${type}/${name}.json`;
    if (!cache[type][name]) {
        cache[type][name] = loadFile(filePath);
        if (!cache[type][name]) {
            log(`Failed to load ${type}/${name}`);
            return null;
        }
    }
    return JSON.parse(JSON.stringify(cache[type][name]));
}

function saveObject(type, name, obj) {
    let filePath = `${type}/${name}.json`;
    saveFile(filePath, obj);
    cache[type][name] = obj;
}
