function setnick(nickname) {
    if (nickname && nickname.length <= 20) {
        this.nickname = nickname;
        broadcastToRoom(i18n("setnick_broadcast", { id: this.id, nick: nickname }), this.room, this.id);
        return i18n("setnick_success", { nick: nickname });
    }
    return i18n("setnick_fail");
}
