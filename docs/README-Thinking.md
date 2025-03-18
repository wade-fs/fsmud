# go 與 v8 分工
## go 
- accept tcp connection, such as telnet and/or www
- file I/O
    - database
- 提供 v8 callback 以便與系統互動，譬如 stop, restart, cross area broadcast

## v8 role
- JSON: replace LPC to represent Object, such as room, equipment and weapons...
- 實作底下所有事情？
    - 命令:
        - 玩家一般命令，譬如 look, go, drop, pick, drink, eat
        - 玩家互動命令，譬如 kill, say, shout, emote
        - 系統命令，譬如 quit
    - 心跳:
        - 提供天氣、健康、飢餓、戰鬥等持續性事件，直到滿足條件才停止
        - 健康度太低導致死亡才停止
        - 飢餓度太低導致死亡才停止
        - 戰鬥
            - Death of the enemy or yourself
            - The enemy or you leave the room

# 參考別人的
## Talesmud
- 
'''room.json
<PRE>
{
  "id": 1,
  "title": "a new beginning",
  "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris iaculis, dui at lacinia laoreet, eros ligula elementum ligula, vitae interdum tellus urna sed ipsum. Nullam luctus, massa in tristique posuere, augue enim blandit tellus, in dictum mi est nec arcu. Aliquam aliquam mi in odio sollicitudin venenatis. Suspendisse potenti. Nunc sem mi, sagittis nec vulputate a, semper vel augue. Maecenas laoreet sem vitae urna tempus, eu ullamcorper leo euismod. Morbi vulputate, enim eget hendrerit tristique, elit odio facilisis leo, sed pulvinar metus sapien at ligula. Pellentesque vehicula blandit sollicitudin. Lorem ipsum dolor sit amet, quis luctus est hendrerit in. Vestibulum non malesuada lorem, a porttitor nulla. Morbi molestie euismod cursus. Nunc at tellus id nunc pharetra pretium. Aliquam gravida, tortor sed commodo lobortis, nisi neque posuere lectus, fringilla congue orci tellus laoreet sapien.",
  "actions": [
    {
      "type": "direction",
      "description": "Go North",
      "data": {
        "room": 2
      }
    },
    {
      "type": "direction",
      "description": "Go through east exit",
      "data": {
        "room": 2
      }
    }
  ]
}
</PRE>
'''

'''area.json
<PRE>
[
    {
        "room": "start_room",
        "name": "A new beginning",
        "description": "As you rise up from the ground you find yourself in a narrow dark place with barely any light. You can see steps leading up to a cave wall with a rope dangling from the dark top.\nYou can hear some noise coming from afar.\n",
        "exits": [
            {
                "exit": "north",
                "description": "Follow along the steps...",
                "target": "second_room"
            }
        ]
    },
    {
        "room": "second_room",
        "name": "The cave wall",
        "description": "After following the steps you reach the cave wall. Directly in front of you there is a rope. The rope does not look like it would survive for long...\n",
        "items": [
            {
                "fromTemplate": "rusty_sword_001",
                "description": "There is an inscription on the hilt reading 'A Thousand Souls it takes'",
                "multiplicity": [
                    {
                        "type": "player",
                        "count": 1
                    }
                ]
            }
        ],
        "exits": [
            {
                "exit": "climb",
                "description": "Climb the rope",
                "target": "Dungeon001_Entrance"
            }
        ]
    },
    {
        "room": "Dungeon001_Entrance",
        "name": "The Entrance",
        "description": "You reach the entrance of an old catacomb. You still wonder how you got here in the first place. The heavy wooden door is wide open and you can still hear noises from inside.\n",
        "exits": [
            {
                "exit": "south",
                "description": "Follow the door to the right",
                "target": "Dungeon001_Room1"
            }
        ]
    },
    {
        "room": "Dungeon001_Room1",
        "name": "Main Chamber",
        "description": "You reach the Main Chamber of the Catacomb. The noise increases but you can't make out the origin of it.\n",
        "detail": "You look closer to all sides of the room. After a thorough investigation you can see that parts of a wall are made up of loose rocks. You might be able to [move] these rocks.\n",
        "exits": [
            {
                "exit": "north",  
                "description": "Follow the door to the left",
                "target": "Dungeon001_Entrance"
            },
            {
                "exit": "hidden path",
                "hidden": true,
                "description": "You follow the hidden path on the east wall",
                "target": "Dungeon001_End"
            }
        ],
        "actions": [
            {
                "action": "move rocks",
                "description": "You try to move one of the medium sized rocks. Parts of the wall start to crumble and a hidden path opens up."
            }
        ]
    },
    {
        "room": "Dungeon001_End",
        "name": "A surprise",
        "description": "You reach a hidden place. Its dark and you cant see further than 2 meters in front of you. Suddenly you can clearly hear the screams. One hand reaches your back, then you are hit by a stone. Darkness falls upon you, your vision fades to black...\n"
    }
]
</PRE>
'''
