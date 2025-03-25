// domain/scripts/item.js

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

    clone() {
        return new Item({
            id : this.id,
            name : this.name,
            description : this.description
        });
    }
}
