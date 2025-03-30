# go 與 v8 分工
## go 
- accept tcp connection, such as telnet and/or www
- file I/O
    - database
- 提供 v8 callback 以便與系統互動，譬如 stop, restart, cross area broadcast

## v8 role
- JSON: replace LPC to represent Object, such as area, equipment and wield...
- 實作底下所有事情
        - 玩家互動命令，譬如 kill, shout, emote
        - 系統命令，譬如 quit
    - 心跳:
        - 提供健康、飢餓、戰鬥等持續性事件，直到滿足條件才停止
        - 健康度太低導致死亡才停止
        - 飢餓度太低導致死亡才停止
        - 戰鬥
            - Death of the enemy or yourself
            - The enemy or you leave the room
    - npc 與 mob
        - npc/mob 區分陣營: 光明、黑暗、中立
        - mob 區分種族、座騎
        - mob 應該有不同時辰的加成，譬如蝙蝠就適合在晚上
        - npc/mob 應該要能自由移動
        - 因為是 area, 座騎可以指定 goto +3+3 或 goto 4 3 語法, 依敏捷改變移動位置
    - 頻道
        - 公共頻道
        - 公會頻道
        - 團隊頻道
        - 區域頻道
