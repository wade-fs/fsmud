# 項目簡介

本項目是一個基於 Golang 和 V8go 構建的 MUD（Multi-User Dungeon）遊戲伺服器。MUD 是一種文字冒險遊戲，玩家可以通過輸入文字命令探索虛擬世界、與 NPC（非玩家角色）互動、進行戰鬥等。本項目使用 Golang 作為後端核心，並整合 V8go 來運行 JavaScript 腳本，從而實現靈活的遊戲邏輯。玩家可以通過 WebSocket 或 Telnet 連接到伺服器進行遊戲。

# 功能特點

- 多種連接方式：支援 WebSocket 和 Telnet 兩種連接方式，滿足不同玩家的需求。
- 動態命令系統：通過動態加載 cmds/*.js 檔案實現命令功能，無需修改核心代碼即可添加新命令。
- 國際化支援：支援多語言顯示，預設為英文，可根據需要擴展其他語言。
- 天氣和時間系統：模擬遊戲內的時間流逝與天氣變化，增強沉浸感。
- 戰鬥系統：提供回合制戰鬥功能，玩家可與 NPC 進行對戰。
- 管理員功能：管理員可使用特殊命令，例如踢出玩家、修改天氣等。

# 設置和運行
## 安裝依賴：
- 確保您的系統已安裝 Golang 和 Node.js（用於支援 V8go）。
## 克隆項目：
<PRE>
git clone &lt;repository-url&gt;
cd &lt;project-directory&gt;
</PRE>
## 編譯和運行：
<PRE>
make mud
</PRE>
## 連接方式：
- WebSocket：打開瀏覽器訪問 http://localhost:8080，並使用 WebSocket 客戶端連接。
- Telnet：使用 Telnet 客戶端連接到 localhost:2323。
## 開發新命令
要新增遊戲命令，只需在 domain/cmds 目錄下創建一個新的 .js 檔案。檔案名稱將作為命令名稱，檔案內容需定義一個接受參數並返回結果的 JavaScript 函數。

# 示例：

## 創建檔案 domain/cmds/say.js：
<PRE>
function say(message) {
    if (!message) return "Say what?";
    broadcastToRoom(`${this.id} says: ${message}`, this.room);
    return `You say: ${message}`;
}
</PRE>
- 當玩家輸入 say Hello 時，房間內的所有玩家將看到廣播消息，而輸入者會收到個人回饋。

## 目錄結構
<PRE>
domain/：包含遊戲邏輯和相關資源。
cmds/：存放命令腳本檔案。
lang/：存放多語言文件。
npcs/：存放 NPC 數據。
items/：存放物品數據。
players/：存放玩家數據。
rooms/：存放房間數據。
static/：存放靜態文件（如前端資源）。
main.go：程式的主入口檔案。
</PRE>

# 貢獻
歡迎通過提交 Pull Request 或 Issue 來參與項目開發與改進！

# 其它資訊
- [歷程與測試][100]
- [我在想什麼？][101]
- [我想做什麼？][102]
- [返回英文版](README.md)

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
[100]: docs/README-Progress.zh.md
[101]: docs/README-Thinking.md
[102]: docs/README-Whats-TODO.zh.md
