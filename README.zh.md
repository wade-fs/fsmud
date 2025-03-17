# fsmud 簡介
- 我只會用中文撰寫註解、文件
- 棄 LPC 改用[JSON][10] 來表達物件，最後希望透過[Javascript][11]/[v8go][9]讓[JSON][10] 定義 Action / Cmd

# 目標

## 近期

- 實作一個可以 telnet 的簡易環境。
	- 有想過找[TalesMud][3]這類的現成環境來修改，後來覺得沒意義，重新寫也是一種很好的學習過程。
- 具備簡易[MUD][7]的環境。

## 中期

- 實作 web UI 環境進行圖形虛擬世界。
- 實作跟[TalesMud][3]一樣具備 Mudlib 的完整遊戲世界。

## 長期

- 利用 AI 讓 MUD 中的人物具有智慧
- 提供地圖製作
- 可以的話具備3D效果，類似[minecraft][8]

# 歷程與測試
- mud1: 支援 telnet 4000, look, go north, quit 命令
	- make mud1 & telnet localhost 4000
	- look
	- go north
	- quit
- mud2: 擴展基本物件屬性與方法
	- make mud2
- mud3: 結合 LPCObject 與 玩家系統，具有基本的互動
	- make mud3 & telnet localhost 4000
	- look
	- go north
	- go south
	- quit
- mud4: 將 LPCObject 獨立在 rooms/ 下，還不是完整的 lpc object
	- make mud4 & telnet localhost 4000
	- look
	- go north
	- go south
	- go east ....
	- quit
- lpc: 實作簡易的 LPC parser
	- make lpc
- v8: bind v8 engine
    - make v8 && ./out/v8
- obj: 撰寫 json loader 
    - make obj
    - ./out/obj -d ./json_data -k config.name -k settings.app.theme
    - ./out/obj -d ./json_data -s "settings/hello"
- mud5: 將 rooms/ 下 *.c 轉成 .json, 並轉換成 LPCObject
	- make mud5 & telnet localhost 4000
	- look
	- go north
	- go south
	- go east ....
	- quit
- v8-tree: 讀樹狀目錄，執行 main.js
    - make v8-tree
    - 請參考 rooms/main.js
- v8-js-call-go: 在 golang 註冊 callback, 讓 js 可以呼叫 golang 函式
	- make v8-js-call-go

# [我在想什麼？][0]
# [返回英文版](README.md)

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
