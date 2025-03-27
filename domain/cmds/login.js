// domain/cmds/login.js

function login(player, args) {
    if (args === "-h" || args === "--help") {
        return i18n(player.lang, "login_help", {
            usage: "login <name> <password>",
            description: "Log in with an existing character or create a new one."
        });
    }

    if (player.name) {
        return { type: "error", message: "You are already logged in." };
    }

    let parts = args.trim().split(" ");
    if (parts.length < 2) {
        return { type: "error", message: "Usage: login <name> <password>" };
    }

    let name = parts[0];
    let password = parts[1];
    let ct = player.connectionType;
    let playerData = Player.load(name);

    if (playerData) {
        let isValid = comparePassword(playerData.password, password);
        if (!isValid) {
            return { type: "error", message: "Incorrect password." };
        }
        Object.assign(player, playerData);
        player.area = playerData.area;
        player.x = playerData.x;
        player.y = playerData.y;
    } else {
        player.name = name;
        player.password = hashPassword(password);
        player.area = "entrance";
        player.x = 0;
        player.y = 0;

        let existingPlayers = listExistingPlayers();
        player.isAdmin = existingPlayers.length === 0;
    }
    return { type: "login_success", message: `Welcome, ${name}!` };
}

function listExistingPlayers() {
    let playerFiles = fileLists.players || []; // 假設 fileLists.players 包含玩家檔案路徑
    return playerFiles.map(file => file.split('/').pop().replace('.json', ''));
}
