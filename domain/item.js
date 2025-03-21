// domain/item.js

class Item {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    static load(id) {
        let data = loadFile(`domain/items/${id}.json`);
        data = data.split('\n')
                .filter(line => !line.trim().startsWith('//')) // Remove lines starting with //
                .join('\n');
        if (data) {
            let itemData = JSON.parse(data);
            return new Item(itemData.id, itemData.name, itemData.description);
        }
        return null;
    }
}
