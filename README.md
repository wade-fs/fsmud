# fsmud 簡介
- 我只會用中文撰寫註解、文件
- 想實作 LPC in golang
- [Writing An Interpreter In Go][2]實作[LPC][1]

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
- make mud1 && ./out/mud1 & telnet localhost 4000
	- look
	- go north
	- quit


[1]: https://www.fluffos.info/lpc/
[2]: https://interpreterbook.com/
[3]: https://github.com/TalesMUD/talesmud
[4]: https://en.wikipedia.org/wiki/LPMud
[5]: https://www.fluffos.info/
