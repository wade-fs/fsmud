function look(target) {
    let room = loadObject("rooms", this.room);
    let { area } = parseRoomPath(this.room);
    let time = isDay ? "day" : "night";

    if (!target) {
        let desc = i18n("look_room", {
            area,
            desc: room.desc,
            weather,
            time,
            exits: Object.keys(room.exits).join(", ")
        });
        if (room.items.length > 0) desc += i18n("look_items", { items: room.items.join(", ") });
        if (room.npcs.length > 0) desc += i18n("look_npcs", { npcs: room.npcs.join(", ") });

        let playersHere = Object.values(players).filter(p => p.room === this.room && p.id !== this.id);
        if (playersHere.length > 0) {
            let playerList = playersHere.map(p => {
                let nick = p.nickname ? ` (${p.nickname})` : "";
                let bio = p.bio ? ` - ${p.bio}` : "";
                return `${p.id}${nick} [${p.race}]${bio}`;
            }).join(", ");
            desc += i18n("look_players", { players: playerList });
        }
        return desc;
    }

    let targetPlayer = Object.values(players).find(p => p.id === target && p.room === this.room);
    if (targetPlayer) {
        let nick = targetPlayer.nickname ? ` (${targetPlayer.nickname})` : "";
        let bio = targetPlayer.bio ? ` - ${targetPlayer.bio}` : "";
        return i18n("look_player", {
            id: targetPlayer.id,
            nick,
            race: targetPlayer.race,
            bio,
            hp: targetPlayer.hp,
            mana: targetPlayer.mana,
            int: targetPlayer.int,
            spi: targetPlayer.spi,
            luck: targetPlayer.luck
        });
    }

    if (this.inventory.includes(target) || room.items.includes(target)) {
        let item = loadObject("items", target);
        return i18n("look_item", {
            item: target,
            desc: item.desc || "A common item.",
            weight: item.weight || 0,
            value: item.value || 0
        });
    }

    return i18n("look_no_target");
}
