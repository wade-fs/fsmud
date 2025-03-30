package obj

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

// ObjectLoader 整合 JSON 載入與資料操作功能
type ObjectLoader struct {
	data map[string]interface{}
	scripts map[string]interface{}
}

// NewObjectLoader 建立新的 ObjectLoader 實例
func NewObjectLoader() *ObjectLoader {
	return &ObjectLoader{
		data: make(map[string]interface{}),
		scripts: make(map[string]interface{}),
	}
}

// LoadJSONTree 從目錄載入 JSON 和 JS 檔案並構建嵌套結構
func (o *ObjectLoader) LoadJSONTree(rootDir string) error {
    return filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
        if err != nil {
            return err
        }

        // 檢查是否為符號連結
        if info.Mode()&os.ModeSymlink != 0 {
            // 獲取符號連結指向的真實路徑
            realPath, err := os.Readlink(path)
            if err != nil {
                return err
            }
            // 獲取真實路徑的檔案資訊
            realInfo, err := os.Stat(realPath)
            if err != nil {
                return err
            }
            // 如果符號連結指向目錄，遞迴遍歷該目錄
            if realInfo.IsDir() {
                return o.LoadJSONTree(realPath)
            }
            // 如果符號連結指向檔案，更新 path 和 info 繼續處理
            path = realPath
            info = realInfo
        }

        // 如果是目錄，跳過
        if info.IsDir() {
            return nil
        }

        // 計算相對路徑並清理鍵名
        relativePath, _ := filepath.Rel(rootDir, path)
        cleanKey := strings.TrimSuffix(relativePath, filepath.Ext(relativePath))
        cleanKey = strings.ReplaceAll(cleanKey, string(os.PathSeparator), "/")

        // 處理 .json 檔案
        if strings.HasSuffix(info.Name(), ".json") {
            rawData, err := os.ReadFile(path)
            if err != nil {
                return err
            }
            var jsonData map[string]interface{}
            if err := json.Unmarshal(rawData, &jsonData); err != nil {
                return err
            }
            o.insertNestedMap(cleanKey, jsonData, o.data)
            return nil
        }

        // 處理 .js 檔案
        if strings.HasSuffix(info.Name(), ".js") {
            rawData, err := os.ReadFile(path)
            if err != nil {
                return err
            }
            o.insertScript(cleanKey, string(rawData))
            return nil
        }

        return nil
    })
}

// insertNestedMap 將 js, JSON 資料插入嵌套結構
func (o *ObjectLoader) insertNestedMap(keyPath string, data interface{}, target map[string]interface{}) {
    keys := strings.Split(keyPath, "/")
    current := target

    for i := 0; i < len(keys)-1; i++ {
        if _, exists := current[keys[i]]; !exists {
            current[keys[i]] = make(map[string]interface{})
        }
        if nextMap, ok := current[keys[i]].(map[string]interface{}); ok {
            current = nextMap
        }
    }
    current[keys[len(keys)-1]] = data
}

func (o *ObjectLoader) GetData() interface{} {
    return o.data
}

// Get 支援 "a.b.c" 的鍵路徑存取
func (o *ObjectLoader) Get(path string) interface{} {
	keys := strings.Split(path, ".")
	var result interface{} = o.data
	for _, key := range keys {
		if m, ok := result.(map[string]interface{}); ok {
			result = m[key]
		} else {
			return nil
		}
	}
	return result
}

// Set 若路徑不存在則建立對應的 map 層級
func (o *ObjectLoader) Set(path string, value interface{}) {
	keys := strings.Split(path, ".")
	current := o.data

	for i := 0; i < len(keys)-1; i++ {
		if _, exists := current[keys[i]]; !exists {
			current[keys[i]] = make(map[string]interface{})
		}
		if nextMap, ok := current[keys[i]].(map[string]interface{}); ok {
			current = nextMap
		} else {
			return
		}
	}
	current[keys[len(keys)-1]] = value
}

// Add 對變數進行數值加總或字串串接
func (o *ObjectLoader) Add(path string, value interface{}) {
	current := o.Get(path)

	switch v := current.(type) {
	case float64:
		o.Set(path, v+o.toFloat(value))
	case int:
		o.Set(path, float64(v)+o.toFloat(value))
	case string:
		o.Set(path, v+o.toString(value))
	default:
		o.Set(path, o.toString(current)+o.toString(value))
	}
}

// Import 解析並返回特定鍵的 JSON 結構
func (o *ObjectLoader) Import(key string) (map[string]interface{}, error) {
	raw, exists := o.data[key]
	if !exists {
		return nil, fmt.Errorf("找不到 %s", key)
	}

	if res, ok := raw.(map[string]interface{}); ok {
		return res, nil
	}
	return nil, fmt.Errorf("解析 %s 時發生錯誤", key)
}

// 將 data 轉換為格式化的 JSON
func (o *ObjectLoader) Dump(indent string) (string, error) {
	jsonBytes, err := json.MarshalIndent(o.data, "", indent)
	if err != nil {
		return "", fmt.Errorf("JSON 序列化失敗: %v", err)
	}
	return string(jsonBytes), nil
}

// toFloat 將值轉換為 float64
func (o *ObjectLoader) toFloat(value interface{}) float64 {
	switch v := value.(type) {
	case float64:
		return v
	case int:
		return float64(v)
	case string:
		if f, err := strconv.ParseFloat(v, 64); err == nil {
			return f
		}
	}
	return 0
}

// toString 將值轉換為 string
func (o *ObjectLoader) toString(value interface{}) string {
	switch v := value.(type) {
	case string:
		return v
	case int, float64:
		return fmt.Sprintf("%v", v)
	default:
		return fmt.Sprintf("%v", v)
	}
}
