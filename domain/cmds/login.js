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
        let passwordMatch = await bcrypt.compare(password, playerData.password);
        if (!passwordMatch) {
            return { type: "error", message: "Incorrect password." };
        }
        Object.assign(player, playerData);
        player.room = playerData.room;
    } else {
        let hashedPassword = await bcrypt.hash(password, 12); // 10 是 saltRounds
        player.username = username;
        player.password = hashedPassword;
        player.room = "entrance";
        Player.save(player); // 假設 Player 物件有 save 方法
    }
    return { type: "login_success", message: `Welcome, ${username}!` };
}
