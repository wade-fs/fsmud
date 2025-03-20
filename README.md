# Project Introduction

This project is a MUD (Multi-User Dungeon) game server built based on Golang and V8go. A MUD is a text adventure game where players can explore a virtual world, interact with NPCs (non-player characters), engage in combat, etc. by entering text commands. This project uses Golang as the backend core and integrates V8go to run JavaScript scripts to achieve flexible game logic. Players can connect to the server via WebSocket or Telnet to play games.

# Features

- Multiple connection methods: Supports WebSocket and Telnet connection methods to meet the needs of different players.
- Dynamic command system: Command functions are implemented by dynamically loading cmds/*.js files, and new commands can be added without modifying the core code.
- International support: Supports multi-language display, English is the default, and other languages ​​can be expanded as needed.
- Weather and time system: simulate the passage of time and weather changes in the game to enhance immersion.
- Combat system: Provides turn-based combat function, players can fight against NPCs.
- Admin functions: Admins can use special commands, such as kicking players, modifying the weather, etc.

# Setup and Run
## Install dependencies:
- Make sure you have Golang and Node.js (for V8go support) installed on your system.

## Clone the project:
<PRE>
git clone &lt;repository-url&gt;
cd &lt;project-directory&gt;
</PRE>
## Compile and run:
<PRE>
make mud
</PRE>
## Connection method:
- WebSocket: Open a browser and visit http://localhost:8080, and connect using a WebSocket client.
- Telnet: Use a Telnet client to connect to localhost:2323.
## Developing new commands
To add new game commands, simply create a new .js file in the domain/cmds directory. The file name will be used as the command name, and the file content must define a JavaScript function that accepts parameters and returns results.

# Example:

## Create the file domain/cmds/say.js:
<PRE>
function say(message) {
 if (!message) return "Say what?";
 broadcastToRoom(`${this.id} says: ${message}`, this.room);
 return `You say: ${message}`;
}
</PRE>
- When a player types say Hello, all players in the room will see the broadcast message and the person who typed it will receive personal feedback.

## Directory Structure
<PRE>
domain/: Contains game logic and related resources.
cmds/: Stores command script files.
lang/: stores multi-language files.
npcs/: stores NPC data.
items/: Stores item data.
players/: Stores player data.
rooms/: stores room data.
static/: stores static files (such as front-end resources).
main.go: The main entry file of the program.
</PRE>

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
