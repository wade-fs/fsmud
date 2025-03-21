function loadMapData(area, mapFile) {
    mapFile = "domain/rooms/"+area+"/"+mapFile;
    log(`Attempting to load map file: ${mapFile}`);
    let rawData = loadFile(mapFile);
    log(`Raw data from loadFile: ${rawData} (type: ${typeof rawData})`);
    
    if (!rawData || typeof rawData !== 'string') {
        throw new Error(`Failed to load or invalid map file: ${mapFile} (received: ${rawData})`);
    }

    let lines = rawData.split('\n').map(line => line.replace(/\r/g, '')).filter(line => line.trim());
    
    let currentSection = '';
    let mapData = { map: [], desc: {}, null: new Set() };

    for (let line of lines) {
        if (line.startsWith('-')) {
            currentSection = line.slice(1).trim();
            log(`Switching to section: ${currentSection}`);
        } else if (currentSection && (line.startsWith('\t') || line.startsWith(' '))) {
            let content = line.trim();
            log(`Processing line in ${currentSection}: ${content}`);
            if (currentSection === 'map') {
                mapData.map.push(content);
            } else if (currentSection === 'desc') {
                let [symbol, description] = content.split('\t').map(s => s.trim());
                if (symbol && description) {
                    mapData.desc[symbol] = description;
                } else {
                    log(`Invalid desc line: ${content}`);
                }
            } else if (currentSection === 'null') {
                mapData.null.add(content);
            }
        }
    }

    if (mapData.map.length === 0) {
        throw new Error(`No valid map data found in ${mapFile}`);
    }
    log(`Map data parsed: map=${JSON.stringify(mapData.map)}, desc=${JSON.stringify(mapData.desc)}, null=${Array.from(mapData.null)}`);
    return mapData;
}
