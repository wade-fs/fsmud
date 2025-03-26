function setnick(nickname) {
    if (nickname && nickname.length <= 20) {
        this.nickname = nickname;
        broadcastToArea(i18n("setnick_broadcast", { id: this.id, nick: nickname }), this.x, this.y, this.id);
        return i18n("setnick_success", { nick: nickname });
    }
    return i18n("setnick_fail");
}
