# FSMUD - Fantasy Scripted Multi-User Dungeon

FSMUD 是一款基於 Go 和 JavaScript（V8 引擎）的多人 MUD 遊戲，結合 Go 的高效能與 JavaScript 的靈活性，提供可擴展的文字冒險遊戲框架。玩家可透過 WebSocket 或 Telnet 連接，探索虛擬世界、戰鬥、收集物品並互動。

## 特色
- **多協議支持**：支援 WebSocket 和 Telnet 客戶端。
- **動態腳本**：遊戲邏輯使用 JavaScript（V8 引擎），可快速開發和修改。
- **持久存儲**：玩家數據以 JSON 文件存儲，使用 UUID 作為鍵。
- **多語言支持**：支援 `en`（英文）和 `zh`（中文），可用 `set lang` 切換。
- **房間與地圖系統**：支援基於房間和網格地圖的探索。
- **廣播系統**：支援房間內及全局訊息廣播。

## 安裝與運行

### 下載專案
```sh
git clone https://github.com/yourusername/fsmud.git
cd fsmud
```

### 安裝依賴
```sh
go mod tidy
```

### 編譯與運行
```sh
make mud
```

### 連接遊戲
- **WebSocket**：瀏覽器訪問 `http://localhost:8080`
- **Telnet**：使用 Telnet 連接 `localhost:2323`

### 登入
```sh
login <用戶名> <密碼>
```
範例：
```sh
login wade jj
```

## 指令

| 指令  | 說明                                  | 範例               |
|------|--------------------------------------|------------------|
| `login` | 登入遊戲                             | `login wade jj`  |
| `go`    | 移動到指定方向                       | `go north`       |
| `look`  | 查看當前房間或地圖                   | `look`           |
| `say`   | 在房間內發言                         | `say Hello!`     |
| `talk`  | 私訊玩家                             | `talk chen Hi!`  |
| `attack`| 攻擊當前房間的 NPC                   | `attack goblin`  |
| `get`   | 撿起房間內的物品                     | `get sword`      |
| `drop`  | 丟棄物品                             | `drop sword`     |
| `stats` | 查看角色狀態                         | `stats`          |
| `set`   | 設定屬性（lang, nick, bio, weather）| `set lang zh`    |
| `priv`  | 切換管理員權限（管理員專用）          | `priv chen`      |
| `quit`  | 退出遊戲並儲存進度                   | `quit`           |
| `shutdown` | 關閉伺服器（管理員專用）         | `shutdown`       |

## 目錄結構
```
fsmud/
├── cmd/
│   ├── mud/                 # WebSocket / Telnet 處理邏輯
│   └── main.go              # 入口點
├── domain/                  # 遊戲腳本
│   ├── cmds/                # 指令實作（如 login.js, go.js）
│   ├── players/             # 玩家數據（JSON）
│   ├── rooms/               # 房間數據（JSON）
│   ├── maps/                # 地圖數據（JSON）
│   ├── lang/                # 語言文件（en.json, zh.json）
│   ├── broadcast.js         # 廣播功能
│   ├── command.js           # 指令處理核心
│   └── ...
├── utils/                   # 工具函式
└── README.md                # 本文件
```

## 開發與擴展

### 新增指令
1. 在 `domain/cmds/` 新增 `mycommand.js`：
```js
function mycommand(player, args) {
    return "Hello from mycommand!";
}
```
2. 重新啟動伺服器，新指令即生效。

### 自訂地圖
1. 在 `domain/maps/` 添加 JSON，如 `forest.json`：
```json
{
    "id": "forest",
    "description": "A dense forest.",
    "width": 5,
    "height": 5,
    "grid": [
        [{"description": "A clearing", "passable": true, "items": [], "npcs": []}, ...]
    ]
}
```
2. 玩家可透過 `go` 指令探索新地圖。

### 多語言支持
1. 修改 `domain/lang/<lang>.json`，新增訊息鍵值：
```json
{
    "welcome_new": "Welcome, {username}!"
}
```
2. 在腳本中使用 `i18n(player.lang, "welcome_new", { username })` 取得翻譯。

## 已知問題
- **密碼安全性**：目前以純文字存儲，建議加密。
- **效能問題**：大量玩家可能會導致 V8 執行或文件 I/O 瓶頸。
- **WebSocket 客戶端**：當前功能有限，需改進。

## 貢獻
1. Fork 並 Clone 此專案。
2. 修改後測試並提交 Pull Request。
3. 在 Issues 區回報問題或建議新功能。

## 授權
本專案基於 MIT License 發布，詳見 `LICENSE` 文件。


