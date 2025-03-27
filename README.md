# FSMUD - Fantasy Scripted Multi-User Dungeon

FSMUD is a multi-user dungeon (MUD) game built with Go and JavaScript (via the V8 engine). It combines the high performance of Go with the flexibility of JavaScript to provide an extensible framework for creating text-based adventure games. Players can connect to the virtual world via WebSocket or Telnet to explore areas, fight NPCs, collect items, and interact with other players.


## Features
- **Multi-protocol support**: Supports WebSocket and Telnet clients.
- **Dynamic Script**: Game logic is implemented using JavaScript (V8 engine), which facilitates rapid development and modification.
- **Persistent Storage**: Player data is saved as JSON files using UUID as key.
- **Multi-language support**: Supports English (en) and Chinese (zh), which can be switched via the set lang command.
- **Region System**: Use areas to manage the game world and support grid-based exploration.
- **Broadcast**: Supports regional and global message broadcasting.

## System Requirements
- Go 1.18 or higher
- Git (for cloning projects and dependencies)
- Browser (for WebSocket client) or Telnet client


## Installation and Running
### Clone the project
```sh
git clone https://github.com/yourusername/fsmud.git
cd fsmud
```

### Installation dependencies
Make sure Go is installed, then run:
```sh
go mod tidy
```

### Build and Run
```sh
make mud
```

### Connecting to the game
- WebSocket: Open a browser and visit http://localhost:8080 to use the built-in client.
- Telnet: Use a Telnet client to connect to localhost:2323.

### First login
Log in using the following command:
```sh
login <username> <password>
```
If the username does not exist, a new role is created. For example:
```sh
login wade jj
```

## Command list
Command | Description | Example Usage
--------|-----------------------|------------------
login | login game | login wade jj
go |Move in the specified direction |go north
look | View current area location |look
say |Broadcast a message in the current area |say Hello everyone!
talk |Send a private message to another player |talk chen Hi there!
attack | Attack NPCs in the area | attack goblin
get | Pick up items in the area | get sword
drop |Drop the item to the current area |drop sword
stats | View character status |stats
set |Set properties |set lang zh, can set nickname, bio, lang
quit | Exit the game and save progress | quit
priv | switch administrator privileges |priv chen
shutdown|shutdown server

**Notice**:

- Before logging in only the login command is available.
- Admin commands (priv, shutdown) require isAdmin: true.

## Directory Structure
<PRE>
fsmud/
├── cmd/mud/main.go # Main entry point
├── domain/
│ ├── cmds/ # Command implementation (e.g. login.js, go.js)
│ ├── static/ # Static files for WebSocket clients
│ ├── players/ # Player data (JSON)
│ ├── areas/ # Area data (JSON)
│ ├── items/ # Item data (JSON)
│ ├── npcs/ # NPC data (JSON)
│ ├── lang/ # Language files (en.json, zh.json)
│ ├── scripts/ # Mudlib scripts
│ │ ├── command.js # Command processing core
│ │ ├── item.js # Item class
│ │ ├── area.js # Area class
│ │ ├── combat.js # Combat logic
│ │ ├── objects.js # Object loading and saving
│ │ ├── player.js # Player class and UUID generation
│ │ ├── i18n.js # Internationalization support
│ │ ├── cache.js # Cache management
│ │ ├── npc.js # NPC class
│ │ ├── weather.js # Weather system
│ │ └── broadcast.js # Broadcast function
│ └── ... # Other scripts
├── utils/
│ ├── handlers/ # WebSocket and Telnet processing logic
│ ├── v8funcs/ # V8 function bindings (e.g. sendToPlayer)
│ ├── client/ # Client management (Go)
│ └── v8go/ # V8 engine tools
└── README.md # This file
</PRE>
### Change Notes
Compared with previous versions:

- Removed rooms/ and maps/ directories, and used areas/ to manage area data of the game world.
- The main mudlib scripts have been moved from the domain/ root directory to domain/scripts/ to better organize the code.

## Data Storage
- Player data: saved as domain/players/<uuid>.json.
- Area data: stored in domain/areas/ and represented in JSON files.

## Development and Extension
### Add new commands
- Create a new file in domain/cmds/, for example mycommand.js:
```js
function mycommand(player, args) {
return "Hello from mycommand!";
}
```
- Restart the server and the new commands will be automatically loaded.

### Custom Area
- Add a JSON file in domain/areas/, for example, forest.json:
```json
{
"id": "forest",
"name": "Forest",
"width": 5,
"height": 5,
"grid": [
["00", "00", "00", "00", "00"],
["00", "XX", "00", "XX", "00"],
["00", "00", "00", "00", "00"],
["00", "XX", "00", "XX", "00"],
["00", "00", "00", "00", "00"]
]
}
```

- Use the go command to explore the area.

### Multi-language support
- Edit domain/lang/<lang>.json and add a message key, for example:
```json
{
"welcome_new": "Welcome, {username}!"
}
```

- Use i18n in scripts (player.lang, "welcome_new", { username }).

## Known Issues

## contribute
- Fork and clone the project.
- Make changes and test them locally.
- Submit a Pull Request and describe your changes.

Feel free to report issues or suggest features on the Issues page!

## License
This project uses the MIT license. See the LICENSE file for details.
Enjoy exploring the world of FSMUD! If you have questions or need help, please let us know.

## [TODO][103] (possibly indefinite)
- Not specifically listed here, please refer to [To Do Link][103]

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
