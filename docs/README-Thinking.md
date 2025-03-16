# go vs. v8
## go role
- accept tcp connection, such as telnet and/or www
- file I/O
    - database
    - edit v8 js scripts on-line.

## v8 role
- JSON: replace LPC to represent Object, such as room, equipment and weapons...

## How/Want to let v8 do everything except TCP/www connections and file access?
- go/v8 which one is better
    - command, after the player excute command, it usually affects several things
        - Player objects, such as picking up, dropping, eating, and drinking
        - Other objects, such as battles
        - Rooms (current room and target room), objects on the body, and other players
    - command, system-provided commands, such as quit, kill.
        - These commands should not be edited outside the system.
    - combat, combat will cause heartbeat events, which will stop only after a certain condition is met, such as
        - Death of the enemy or yourself
        - The enemy or you leave the room
    - event, the event includes several possibilities
        - Environmental events, such as time and weather
        - Player events, such as hunger, stamina, and health
        - Events caused by other players, such as broadcasts and battles
- If all functions are provided by v8, different permissions should be distinguished.
