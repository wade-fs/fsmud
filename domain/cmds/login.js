// domain/cmds/login.js

function login(player, args) {
    if (player.username) {
        return { type: "error", message: "You are already logged in." };
    }

    let parts = args.trim().split(" ");
    if (parts.length < 2) {
        return { type: "error", message: "Usage: login <username> <password>" };
    }

    let username = parts[0];
    let password = parts[1];
    let ct = player.connectionType;
    let playerData = Player.load(username);
    playerData.connectionType = ct;

    if (playerData) {
        if (playerData.password !== password) {
            return { type: "error", message: "Incorrect password." };
        }
        Object.assign(player, playerData);
        player.room = playerData.room;
    } else {
        player.username = username;
        player.password = password;
        player.room = "entrance";
    }
    return { type: "login_success", message: `Welcome, ${username}!` };
}
