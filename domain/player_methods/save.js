function save() {
    let playerData = {
        id: this.id,
        room: this.room,
        hp: this.hp,
        mana: this.mana,
        int: this.int,
        spi: this.spi,
        luck: this.luck,
        inventory: this.inventory,
        admin: this.admin,
        nickname: this.nickname,
        bio: this.bio,
        race: this.race
    };
    saveObject("players", this.id, playerData);
    return i18n("save_success");
}
