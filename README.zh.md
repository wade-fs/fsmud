# FSMUD - Fantasy Space Multi-User Dungeon

FSMUD 是一個使用 Go 和 JavaScript（通過 V8 引擎）構建的多用戶地牢（MUD）遊戲。它結合了 Go 的高性能和 JavaScript 的靈活性，提供了一個可擴展的框架，用於創建基於文本的冒險遊戲。玩家可以通過 WebSocket 或 Telnet 連接到虛擬世界，探索區域、與 NPC 戰鬥、收集物品並與其他玩家互動。

每次編譯都會因為[v8go][9]而卡住，所以下載到utils/v8go。請參考來源網址。


## 特點
- **多協議支持**：支持 WebSocket 和 Telnet 客戶端。
- **動態腳本**：遊戲邏輯使用 JavaScript（V8 引擎）實現，便於快速開發和修改。
- **持久化存儲**：玩家數據以 JSON 文件形式保存，使用 UUID 作為鍵。
- **多語言支持**：支持英語（en）和中文（zh），可通過 set lang 命令切換。
- **區域系統**：使用 areas 管理遊戲世界，支持基於網格的探索。
- **廣播**：支持區域內和全局的消息廣播。

## 系統需求
- Go 1.18 或更高版本
- Git（用於克隆項目和依賴）
- 瀏覽器（用於 WebSocket 客戶端）或 Telnet 客戶端


## 安裝和運行
### 克隆項目
```sh
git clone https://github.com/yourusername/fsmud.git
cd fsmud
```

### 安裝依賴
確保 Go 已安裝，然後運行：
```sh
go mod tidy
```

### 構建和運行
```sh
make mud
```

### 連接到遊戲
- WebSocket：打開瀏覽器，訪問 http://localhost:8080，使用內置客戶端。
- Telnet：使用 Telnet 客戶端連接到 localhost:2323。

### 首次登錄
使用以下命令登錄：
```sh
login <username> <password>
```
如果用戶名不存在，則會創建一個新角色。例如：
```sh
login wade jj
```

## 命令列表
命令	| 描述              	|示例用法
--------|-----------------------|------------------
login	|登錄遊戲	            |login wade jj
go	    |向指定方向移動	        |go north
look	|查看當前區域位置   	|look
say	    |在當前區域廣播消息 	|say Hello everyone!
talk	|向其他玩家發送私人消息	|talk chen Hi there!
attack	|攻擊區域內的 NPC		|attack goblin
get	    |拾取區域內的物品		|get sword
drop	|將物品丟到當前區域		|drop sword
stats	|查看角色狀態			|stats
set	    |設置屬性				|set lang zh, 可設有 nickname, bio, lang
quit	|退出遊戲並保存進度		|quit
priv	|切換管理員權限			|priv chen
shutdown|關閉服務器				|shutdown

**注意**：

- 在登錄前僅 login 命令可用。
- 管理員命令（priv、shutdown）需要 isAdmin: true。

## 目錄結構
<PRE>
fsmud/
├── cmd/mud/main.go         # 主入口點
├── domain/
│   ├── cmds/               # 命令實現（例如 login.js, go.js）
│   ├── static/             # WebSocket 客戶端的靜態文件
│   ├── players/            # 玩家數據（JSON）
│   ├── areas/              # 區域數據（JSON）
│   ├── items/              # 物品數據（JSON）
│   ├── npcs/               # NPC 數據（JSON）
│   ├── lang/               # 語言文件（en.json, zh.json）
│   ├── scripts/            # Mudlib 腳本
│   │   ├── command.js      # 命令處理核心
│   │   ├── item.js         # 物品類
│   │   ├── area.js         # 區域類
│   │   ├── combat.js       # 戰鬥邏輯
│   │   ├── objects.js      # 對象加載和保存
│   │   ├── player.js       # 玩家類和 UUID 生成
│   │   ├── i18n.js         # 國際化支持
│   │   ├── cache.js        # 緩存管理
│   │   ├── npc.js          # NPC 類
│   │   ├── weather.js      # 天氣系統
│   │   └── broadcast.js    # 廣播函數
│   └── ...                 # 其他腳本
├── utils/
    ├── handlers/       # WebSocket 和 Telnet 處理邏輯
    ├── v8funcs/        # V8 函數綁定（例如 sendToPlayer）
│   ├── client/             # 客戶端管理（Go）
│   └── v8go/               # V8 引擎工具
└── README.md               # 本文件
</PRE>
### 變更說明
與先前版本相比：

- 移除了 rooms/ 和 maps/ 目錄，改用 areas/ 來管理遊戲世界的區域數據。
- 主要的 mudlib 腳本已從 domain/ 根目錄移至 domain/scripts/，以更好地組織代碼。

## 數據存儲
- 玩家數據：保存為 domain/players/&lt;uuid&gt;.json。
- 區域數據：存儲在 domain/areas/ 中，以 JSON 文件形式表示。

## 開發和擴展
### 添加新命令
- 在 domain/cmds/ 中創建一個新文件，例如 mycommand.js：
```js
function mycommand(player, args) {
    return "Hello from mycommand!";
}
```
- 重啟服務器，新命令將自動加載。

### 自定義區域
- 在 domain/areas/ 中添加一個 JSON 文件，例如 forest.json：
```json
{
    "id": "forest",
    "name": "Forest",
    "width": 5,
    "height": 5,
    "grid": [
        ["00", "00", "00", "00", "00"],
        ["00", "XX", "00", "XX", "00"],
        ["00", "00", "00", "00", "00"],
        ["00", "XX", "00", "XX", "00"],
        ["00", "00", "00", "00", "00"]
    ]
}
```

- 使用 go 命令探索該區域。

### 多語言支持
- 編輯 domain/lang/&lt;lang&gt;.json，添加消息鍵，例如：
```json
{
    "welcome_new": "Welcome, {username}!"
}
```

- 在腳本中使用 i18n(player.lang, "welcome_new", { username })。

## 已知問題

## 貢獻
- Fork 並克隆項目。
- 進行更改並在本地測試。
- 提交 Pull Request 並描述您的更改。

歡迎在 Issues 頁面報告問題或建議功能！

## 許可證
本項目採用 MIT 許可證。詳情請見 LICENSE 文件。  
享受探索 FSMUD 的世界！如有疑問或需要幫助，請告訴我們。

## [待辦事項][103]（可能無限期）  
- 不特別列在這兒，請參考 [待辦事項連結][103]

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
[103]: docs/README-TODO.zh.md
