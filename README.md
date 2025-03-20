MUD Server

Overview
--------
This project is a Multi-User Dungeon (MUD) server built with Go and JavaScript (using the V8 engine). It supports both WebSocket and Telnet clients, allowing players to interact with a text-based, multiplayer game world. The server uses the Gin web framework for HTTP/WebSocket handling, V8Go for JavaScript execution, and a custom `mudlib.js` to manage game logic, including rooms, NPCs, items, players, weather, and combat.

The project is designed to be cross-platform, with a `Makefile` that supports building for both native (Linux/macOS) and Windows environments. Game data (rooms, NPCs, items, players) is stored in JSON files, and commands are extensible via JavaScript.

Features
--------
- Multi-Protocol Support: Connect via WebSocket (port 8080) or Telnet (port 2323).
- Dynamic Game World: Rooms, NPCs, items, and players are loaded from JSON files, with a caching system for performance.
- JavaScript Game Logic: Powered by V8Go, with `mudlib.js` handling commands, combat, weather, and more.
- Combat System: Turn-based combat with NPCs, including critical hits and fleeing mechanics.
- Localization: Supports multiple languages (default: English) via `i18n.js`.
- Admin Commands: Shutdown, kick players, and set weather (admin-only).
- Cross-Platform Builds: Build for Linux/macOS or Windows using the provided `Makefile`.

Prerequisites
-------------
- Go: Version 1.23.0 (specified in the `Makefile`).
- V8Go: Required for JavaScript execution (install via `go get`).
- GCC: For native builds.
- MinGW: For Windows cross-compilation (`x86_64-w64-mingw32-gcc`).
- Node.js: Optional, for merging `mudlib` files (if using the `mudlib` target).

Directory Structure
-------------------
<PRE>
.
├── cmd/              # Go command-line entry points
├── domain/           # Game data and logic
│   ├── cmds/         # JavaScript command files (*.js)
│   ├── items/        # Item definitions (*.json)
│   ├── npcs/         # NPC definitions (*.json)
│   ├── players/      # Player save data (*.json)
│   ├── rooms/        # Room definitions (*.json)
│   ├── lang/         # Language files (*.json)
│   ├── static/       # Static web files (e.g., index.html)
│   └── *.js          # Core mudlib files (cache.js, i18n.js, etc.)
├── out/              # Build output directory
├── Makefile          # Build configuration
└── main.go           # Main server code
</PRE>
Installation
------------
1. Install Go 1.23.0:
   - Download and install Go 1.23.0 from https://golang.org/dl/.
   - Set `GOROOT` to `/usr/local/go-1.23.0` and ensure it’s in your PATH.

2. Clone the Repository:
   git clone <repository-url>
   cd mud-server

3. Install Dependencies:
   go get

4. (Optional) Install MinGW for Windows Builds:
   - On Linux/macOS, install `mingw-w64`:
     sudo apt install mingw-w64  # Debian/Ubuntu
     sudo yum install mingw64-gcc  # CentOS/RHEL

5. Build the Server:
   - For native (Linux/macOS): Please try "make mud"
     make <binary_name>
   - Replace `<binary_name>` with the name of the binary in the `cmd/` directory (e.g., `mudserver`).

6. (Optional) Merge Mudlib Files:
   - Run the `mudlib` target to merge JavaScript files into `mudlib-all.js`:
     make mudlib

Usage
-----
1. Run the Server:
   - After building, the binary is placed in the `out/` directory. Run it:
     ./out/<binary_name>  # Native
     ./out/<binary_name>.exe  # Windows

2. Connect to the Server:
   - WebSocket: Open a browser to `http://localhost:8080/` and use the provided `index.html` interface.
   - Telnet: Use a Telnet client:
     telnet localhost 2323

3. Gameplay:
   - Enter a username when prompted.
   - Use commands like `look`, `go`, `get`, `attack`, `say`, etc. (see `domain/cmds/` for full list).
   - Admin commands: `shutdown`, `kick <player_id>`, `weather set <sunny/rainy>` (player_1 is admin by default).

Configuration
-------------
- Ports:
  - WebSocket: `:8080` (configurable in `main.go` via `r.Run()`).
  - Telnet: `:2323` (configurable in `startTelnetServer()`).
- Game Data: Edit JSON files in `domain/{rooms,npcs,items,players}/`.
- Commands: Add or modify JavaScript files in `domain/cmds/`.

Extending the Game
------------------
- Add Commands: Create a new `.js` file in `domain/cmds/` with a function (e.g., `function myCommand(args) {...}`).
- Add Content: Add JSON files to `domain/{rooms,npcs,items}/` following the existing structure.
- Localization: Add language files to `domain/lang/` and update `mudlib.js` to load them.

Notes
-----
- The server assigns a unique `player_<n>` ID to each client.
- Player data is saved to `domain/players/<player_id>.json` on exit or via the `save` command.
- Combat is turn-based and managed via JavaScript timeouts.

License
-------
MIT license

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

