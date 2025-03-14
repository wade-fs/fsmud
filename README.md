# fsmud 簡介
- 我只會用中文撰寫註解、文件
- 想實作 LPC in golang
- [Writing An Interpreter In Go][2]實作[FluffOS LPC][1]及[Dead Souls Mudlib][6]

# 目標

## 近期

- 實作一個可以 telnet 的簡易環境。
	- 有想過找[TalesMud][3]這類的現成環境來修改，後來覺得沒意義，重新寫也是一種很好的學習過程。
- 具備簡易[LPMUD][4]的環境。

## 中期

- 實作 web UI 環境進行圖形虛擬世界。
- 實作跟[FluffOS][5]一樣，可以與現行 LPMud 相容的環境。

## 長期

- 利用 AI 讓 MUD 中的人物具有智慧

# 測試
- mud1: 支援 telnet 4000, look, go north, quit 命令
	- make mud1 && ./out/mud1 & telnet localhost 4000
	- look
	- go north
	- quit
- mud2: 擴展基本物件屬性與方法
	- make mud2 && ./out/mud2
- mud3: 結合 LPCObject 與 玩家系統，具有基本的互動
	- make mud3 && ./out/mud3 & telnet localhost 4000
	- look
	- go north
	- go south
	- quit
- mud4: 將 LPCObject 獨立在 rooms/ 下，還不是完整的 lpc object
	- make mud4 && ./out/mud4 & telnet localhost 4000
	- look
	- go north
	- go south
	- go east ....
	- quit
- lpc: 實作簡易的 LPC parser
	- make lpc && ./out/lpc

[1]: https://www.fluffos.info/lpc/
[2]: https://interpreterbook.com/
[3]: https://github.com/TalesMUD/talesmud
[4]: https://en.wikipedia.org/wiki/LPMud
[5]: https://www.fluffos.info/
[6]: https://github.com/mudren/dead-souls
