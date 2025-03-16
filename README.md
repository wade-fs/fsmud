# fsmud Introduction
- I will only write comments and documentation in Chinese.
- Abandon LPC and use [JSON][10] to represent objects, ultimately hoping to define Actions/Cmds through [JavaScript][11]/[v8go][9] with [JSON][10].

# Goals

## Short-term
- Implement a simple telnet-enabled environment.
  - Considered modifying existing environments like [TalesMud][3], but later felt it was meaningless. Rewriting from scratch is also a great learning process.
- Create a basic [MUD][7] environment.

## Mid-term
- Implement a web UI environment for a graphical virtual world.
- Build a complete game world with Mudlib, similar to [TalesMud][3].

## Long-term
- Utilize AI to make characters in the MUD intelligent.
- Provide map creation tools.
- If possible, include 3D effects, similar to [Minecraft][8].

# Progress and Testing
- mud1: Supports telnet 4000, commands: look, go north, quit
  - make mud1 && ./out/mud1 & telnet localhost 4000
  - look
  - go north
  - quit
- mud2: Extend basic object properties and methods
  - make mud2 && ./out/mud2
- mud3: Integrate LPCObject with the player system, enabling basic interaction
  - make mud3 && ./out/mud3 & telnet localhost 4000
  - look
  - go north
  - go south
  - quit
- mud4: Isolate LPCObject under rooms/, not yet a complete LPC object
  - make mud4 && ./out/mud4 & telnet localhost 4000
  - look
  - go north
  - go south
  - go east ....
  - quit
- lpc: Implement a simple LPC parser
  - make lpc && ./out/lpc
- v8: Bind V8 engine
  - make v8 && ./out/v8
- obj: Write JSON loader
  - make obj
  - ./out/obj -d ./json_data -k config.name -k settings.app.theme
  - ./out/obj -d ./json_data -s "settings/hello"
- mud5: convert rooms/*.c to *.json to represent new LPC object
  - make mud5 && ./out/mud5 & telnet localhost 4000
  - look
  - go north
  - go south
  - go east ....
  - quit
- v8-tree: recurssive read rooms/, and run main.js
  - make v8-tree && ./out/v8-tree
  - Please read rooms/main.js too.

# [What's I am thinking?][0]

# Other Languages
- [中文](README.zh.md)

[0]: docs/README-Thinking.md
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
