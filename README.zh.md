MUD 伺服器

概述
----
此專案是一個使用 Go 和 JavaScript（透過 V8 引擎）建構的多用戶地城（MUD）伺服器。它支援 WebSocket 和 Telnet 客戶端，讓玩家能夠在文字為基礎的多人遊戲世界中互動。伺服器使用 Gin 網頁框架處理 HTTP 和 WebSocket，V8Go 執行 JavaScript，並透過自定義的 `mudlib.js` 管理遊戲邏輯，包括房間、NPC、物品、玩家、天氣和戰鬥。

此專案設計為跨平台，透過 `Makefile` 支援在原生環境（Linux/macOS）和 Windows 上建構。遊戲資料（房間、NPC、物品、玩家）儲存在 JSON 檔案中，命令則可透過 JavaScript 擴展。

功能
----
- 多協議支援：透過 WebSocket（埠 8080）或 Telnet（埠 2323）連線。
- 動態遊戲世界：房間、NPC、物品和玩家從 JSON 檔案載入，並使用快取系統提升效能。
- JavaScript 遊戲邏輯：由 V8Go 驅動，`mudlib.js` 處理命令、戰鬥、天氣等功能。
- 戰鬥系統：與 NPC 的回合制戰鬥，包含致命一擊和逃跑機制。
- 多語言支援：透過 `i18n.js` 支援多種語言（預設：英文）。
- 管理員命令：關機、踢出玩家和設定天氣（僅限管理員）。
- 跨平台建構：使用提供的 `Makefile` 建構適用於 Linux/macOS 或 Windows 的版本。

前置需求
--------
- Go：版本 1.23.0（在 `Makefile` 中指定）。
- V8Go：執行 JavaScript 所需的套件（透過 `go get` 安裝）。
- GCC：用於原生建構。
- MinGW：用於 Windows 跨平台編譯（需要 `x86_64-w64-mingw32-gcc`）。
- Node.js：可選，用於合併 `mudlib` 檔案（若使用 `mudlib` 目標）。

目錄結構
--------
.
├── cmd/              # Go 命令列入口點
├── domain/           # 遊戲資料與邏輯
│   ├── cmds/         # JavaScript 命令檔案 (*.js)
│   ├── items/        # 物品定義 (*.json)
│   ├── npcs/         # NPC 定義 (*.json)
│   ├── players/      # 玩家儲存資料 (*.json)
│   ├── rooms/        # 房間定義 (*.json)
│   ├── lang/         # 語言檔案 (*.json)
│   ├── static/       # 靜態網頁檔案（例如 index.html）
│   └── *.js          # 核心 mudlib 檔案（cache.js、i18n.js 等）
├── out/              # 建構輸出目錄
├── Makefile          # 建構配置
└── main.go           # 主伺服器程式碼

安裝
----
1. 安裝 Go 1.23.0：
   - 從 https://golang.org/dl/ 下載並安裝 Go 1.23.0。
   - 將 `GOROOT` 設定為 `/usr/local/go-1.23.0`，並確保其在 PATH 中。

2. 複製儲存庫：
   git clone <repository-url>
   cd mud-server

3. 安裝依賴：
   go get

4. （可選）安裝 MinGW 以進行 Windows 建構：
   - 在 Linux/macOS 上安裝 `mingw-w64`：
     sudo apt install mingw-w64  # Debian/Ubuntu
     sudo yum install mingw64-gcc  # CentOS/RHEL

5. 建構伺服器：
   - 對於原生環境（Linux/macOS）：請嘗試 "make mud"
     make <binary_name>
   - 將 `<binary_name>` 替換為 `cmd/` 目錄中的二進位檔案名稱（例如 `mudserver`）。

6. （可選）合併 Mudlib 檔案：
   - 執行 `mudlib` 目標將 JavaScript 檔案合併為 `mudlib-all.js`：
     make mudlib

使用方法
--------
1. 啟動伺服器：
   - 建構完成後，二進位檔案會位於 `out/` 目錄中。執行它：
     ./out/<binary_name>  # 原生環境
     ./out/<binary_name>.exe  # Windows

2. 連線至伺服器：
   - WebSocket：在瀏覽器中開啟 `http://localhost:8080/`，使用提供的 `index.html` 介面。
   - Telnet：使用 Telnet 客戶端：
     telnet localhost 2323

3. 遊戲玩法：
   - 出現提示時輸入使用者名稱。
   - 使用命令如 `look`、`go`、`get`、`attack`、`say` 等（完整列表見 `domain/cmds/`）。
   - 管理員命令：`shutdown`、`kick <player_id>`、`weather set <sunny/rainy>`（預設 player_1 為管理員）。

配置
----
- 埠：
  - WebSocket：`:8080`（可在 `main.go` 的 `r.Run()` 中配置）。
  - Telnet：`:2323`（可在 `startTelnetServer()` 中配置）。
- 遊戲資料：編輯 `domain/{rooms,npcs,items,players}/` 中的 JSON 檔案。
- 命令：新增或修改 `domain/cmds/` 中的 JavaScript 檔案。

擴展遊戲
--------
- 新增命令：在 `domain/cmds/` 中建立新的 `.js` 檔案，包含函數（例如 `function myCommand(args) {...}`）。
- 新增內容：按照現有結構將 JSON 檔案新增至 `domain/{rooms,npcs,items}/`。
- 多語言支援：將語言檔案新增至 `domain/lang/`，並更新 `mudlib.js` 以載入。

注意事項
--------
- 伺服器會為每個客戶端分配唯一的 `player_<n>` ID。
- 玩家資料在退出或使用 `save` 命令時儲存至 `domain/players/<player_id>.json`。
- 戰鬥為回合制，透過 JavaScript 計時器管理。

授權
----
MIT 授權

貢獻
----
歡迎透過提交 Pull Request 或 Issue 參與專案開發與改進！

進階資訊
--------
- [進度與測試][100]
- [我的想法][101]
- [我想做什麼？][102]

其他語言
--------
- [英文](README.md)

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
