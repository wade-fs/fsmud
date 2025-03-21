// domain/item.js

class Item {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    static load(id) {
        let item = loadObject("items", id);
        if (item) {
            return item;
        }
        return null;
    }
}
