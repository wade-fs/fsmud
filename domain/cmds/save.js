function save() {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "save_help", {
            usage: "save",
            description: "save player data."
        });
    }

    let playerData = {
        id: this.id,
        uuid: this.uuid,
        username: this.username,
        area: this.area,
        x: this.x,
        y: this.y,
        race: this.race,
        hp: this.hp,
        mp: this.mp,
        int: this.int,
        spi: this.spi,
        luck: this.luck,
        inventory: this.inventory,
        admin: this.admin,
        nickname: this.nickname,
        bio: this.bio,
        combatLog: this.combatLog
    };
    saveObject("players", this.uuid, playerData);
    return i18n("save_success");
}
