function save() {
    let playerData = {
        id: this.id,
        username: this.username,
        room: this.room,
        virtualRoom: this.virtualRoom,
        race: this.race,
        hp: this.hp,
        mana: this.mana,
        int: this.int,
        spi: this.spi,
        luck: this.luck,
        inventory: this.inventory,
        admin: this.admin,
        nickname: this.nickname,
        bio: this.bio,
        combatLog: this.combatLog
    };
    saveObject("players", this.id, playerData);
    return i18n("save_success");
}
