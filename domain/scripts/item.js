// domain/scripts/item.js

class Item {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.desc = data.desc;
        this.weight = data.weight;
        this.value = data.value;
        this.usable = data.usable;
        this.effect = data.effect;
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
            id: this.id,
            name: this.name,
            desc: this.desc,
            weight: this.weight,
            value: this.value,
            usable: this.usable,
            effect: this.effect
        });
    }
}
