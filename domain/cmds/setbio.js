function setbio(bio) {
    if (bio && bio.length <= 100) {
        this.bio = bio;
        broadcastToRoom(i18n("setbio_broadcast", { id: this.id }), this.room, this.id);
        return i18n("setbio_success");
    }
    return i18n("setbio_fail");
}
