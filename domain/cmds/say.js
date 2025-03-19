function say(message) {
    if (!message) {
        return i18n("say_empty");
    }

    let roomId = this.virtualRoom || this.room;
    broadcastToRoom(i18n("say_broadcast", { id: this.nickname, message }), roomId);
    return i18n("say_self", { message });
}
