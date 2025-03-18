function stats() {
    let nick = this.nickname ? ` (${this.nickname})` : "";
    return i18n("stats", {
        id: this.id,
        nick,
        race: this.race,
        hp: this.hp,
        mana: this.mana,
        int: this.int,
        spi: this.spi,
        luck: this.luck,
        inventory: this.inventory.length > 0 ? this.inventory.join(", ") : "None"
    });
}
