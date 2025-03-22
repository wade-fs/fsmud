# FSMUD - Fantasy Scripted Multi-User Dungeon

FSMUD is a multi-user dungeon (MUD) game built with Go and JavaScript (via the V8 engine). It combines Go's high performance with JavaScript's flexibility, offering an extensible framework for text-based adventure gaming. Players can connect via WebSocket or Telnet to explore a virtual world, fight NPCs, collect items, and interact with others.

## Features
- **Multi-protocol support:** WebSocket and Telnet clients.
- **Dynamic scripting:** Game logic implemented in JavaScript (V8 engine) for rapid development and modification.
- **Persistent storage:** Player data saved as JSON files using UUIDs as keys.
- **Multi-language support:** English (en) and Chinese (zh), switchable with `set lang`.
- **Room and map system:** Supports room-to-room movement and grid-based map exploration.
- **Broadcasting:** Room-specific and global message broadcasting.

## System Requirements
- Go 1.18 or higher
- Git (for cloning the project and dependencies)
- Browser (for WebSocket client) or Telnet client

## Installation and Running

### Clone the Project
```sh
git clone https://github.com/yourusername/fsmud.git
cd fsmud
```

### Install Dependencies
Ensure Go is installed, then run:
```sh
go mod tidy
```

### Build and Run
```sh
make mud
```

### Connect to the Game
- **WebSocket:** Open a browser, visit `http://localhost:8080`, and use the built-in client.
- **Telnet:** Connect using a Telnet client to `localhost:2323`.

### First Login
Log in with:
```sh
login <username> <password>
```
- If the username doesn't exist, a new character is created. Example:
```sh
login wade jj
```

### Command List

| Command  | Description                                  | Example Usage         |
|----------|----------------------------------------------|-----------------------|
| login    | Log into the game                           | `login wade jj`       |
| go       | Move in a specified direction               | `go north`            |
| look     | View the current room or map cell           | `look`                |
| say      | Broadcast a message in the room             | `say Hello everyone!` |
| talk     | Send a private message to another player    | `talk chen Hi there!` |
| attack   | Attack an NPC in the room                   | `attack goblin`       |
| get      | Pick up an item in the room                 | `get sword`           |
| drop     | Drop an item into the room                  | `drop sword`          |
| stats    | View character stats                        | `stats`               |
| set      | Set attributes (lang, nick, bio, weather)   | `set lang zh`         |
| priv     | Toggle admin privileges (admin only)        | `priv chen`           |
| quit     | Exit the game and save progress             | `quit`                |
| shutdown | Shut down the server (admin only)          | `shutdown`            |

**Notes:**
- Only `login` is available before logging in.
- Admin commands (`priv`, `shutdown`) require `isAdmin: true`.

## Directory Structure
```
fsmud/
├── cmd/
│   └── mud/
│       ├── handlers/       # WebSocket and Telnet handling logic
│       ├── v8funcs/        # V8 function bindings (e.g., sendToPlayer)
│       └── main.go         # Main entry point
├── domain/                 # Mudlib scripts
│   ├── cmds/               # Command implementations (e.g., login.js, go.js)
│   ├── static/             # Static files for WebSocket client
│   ├── players/            # Player data (JSON)
│   ├── rooms/              # Room data (JSON)
│   ├── maps/               # Map data (JSON)
│   ├── items/              # Item data (JSON)
│   ├── npcs/               # NPC data (JSON)
│   ├── lang/               # Language files (en.json, zh.json)
│   ├── broadcast.js        # Broadcast functions
│   ├── player.js           # Player class and UUID generation
│   ├── room.js             # Room class
│   ├── map.js              # Map class
│   ├── command.js          # Command processing core
│   └── ...                 # Other scripts
├── utils/
│   ├── client/             # Client management (Go)
│   └── v8go/               # V8 engine utilities
└── README.md               # This file
```

## Data Storage
- **Player data:** Saved as `domain/players/<uuid>.json`.
- **Rooms and maps:** Stored in `domain/rooms/` and `domain/maps/`.

## Development and Extension

### Adding New Commands
1. Create a new file in `domain/cmds/`, e.g., `mycommand.js`:
```js
function mycommand(player, args) {
    return "Hello from mycommand!";
}
```
2. Restart the server; the new command will be loaded automatically.

### Custom Maps
1. Add a map JSON in `domain/maps/`, e.g., `forest.json`:
```json
{
    "id": "forest",
    "description": "A dense forest.",
    "width": 5,
    "height": 5,
    "grid": [
        [{"description": "A clearing", "passable": true, "items": [], "npcs": []}, ...],
        ...
    ]
}
```
2. Explore it using the `go` command.

### Multi-Language Support
1. Edit `domain/lang/<lang>.json` and add message keys, e.g.:
```json
{
    "welcome_new": "Welcome, {username}!"
}
```
2. Use in scripts with `i18n(player.lang, "welcome_new", { username })`.

## Known Issues
- **Password security:** Currently stored in plaintext; encryption is recommended.
- **Performance:** Large player counts may bottleneck V8 execution or file I/O.
- **WebSocket client:** The static page has limited functionality and needs enhancement.

## Contributing
1. Fork and clone the project.
2. Make changes and test locally.
3. Submit a Pull Request with a description of your changes.

Feel free to report issues or suggest features on the Issues page!

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

Enjoy exploring the world of FSMUD! Let us know if you have questions or need assistance.

# Contribute
Welcome to participate in project development and improvement by submitting Pull Request or Issue!

# Advanced Information
- [Progress and Testing][100]
- [What's I am thinking?][101]
- [What's I want to do?][102]

# Other Languages
- [中文](README.zh.md)

[1]: https://www.fluffos.info/lpc/
[2]: https://interpreterbook.com/
[3]: https://github.com/TalesMUD/talesmud
[4]: https://en.wikipedia.org/wiki/LPMud
[5]: https://www.fluffos.info/
[6]: https://github.com/mudren/dead-souls
[7]: https://en.wikipedia.org/wiki/Multi-user_dungeon
[8]: https://minecraft.wiki/
[9]: https://github.com/rogchap/v8go
[10]: https://en.wikipedia.org/wiki/JSON
[11]: https://en.wikipedia.org/wiki/JavaScript
[100]: docs/README-Progress.md
[101]: docs/README-Thinking.md
[102]: docs/README-Whats-TODO.md
