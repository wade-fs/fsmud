package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"fsmud/utils/obj"
)

func main() {
	// 定義命令行參數
	dirPtr := flag.String("d", "", "指定 JSON 檔案所在的資料夾路徑")

	// 用 slice 存儲多個 `-k` 參數的值
	keys := []string{}
	flag.Func("k", "指定要查詢的 key（可多次使用）", func(s string) error {
		keys = append(keys, s)
		return nil
	})

	flag.Parse()

	// 檢查是否提供了 -d 參數
	if *dirPtr == "" {
		fmt.Println("錯誤：請使用 -d 指定 JSON 資料夾路徑")
		fmt.Println("用法：")
		fmt.Println("  -d <directory> 指定 JSON 資料夾")
		fmt.Println("  -k <key>       指定要查詢的 key（可多次使用）")
		fmt.Println("範例：")
		fmt.Println("  go run main.go -d ./json_data -k folder1.file1.key -k folder2.file2.name")
		os.Exit(1)
	}

	// 建立新的 ObjectLoader
	loader := obj.NewObjectLoader()

	// 載入 JSON 檔案
	dir, err := filepath.Abs(*dirPtr)
	if err != nil {
		fmt.Printf("無法解析資料夾路徑：%v\n", err)
		os.Exit(1)
	}

	err = loader.LoadJSONTree(dir)
	if err != nil {
		fmt.Printf("載入 JSON 失敗：%v\n", err)
		os.Exit(1)
	}

	// 如果沒有指定 key，則輸出所有資料
	if len(keys) == 0 {
		jsonStr, err := loader.Dump("  ")
		if err != nil {
			fmt.Printf("輸出 JSON 失敗：%v\n", err)
			os.Exit(1)
		}
		fmt.Println("完整 JSON 資料：")
		fmt.Println(jsonStr)
	} else {
		// 根據指定的 key 獲取並顯示資料
		fmt.Println("查詢結果：")
		for _, key := range keys {
			value := loader.Get(key)
			if value == nil {
				fmt.Printf("  %s: 未找到\n", key)
			} else {
				fmt.Printf("  %s: %v\n", key, value)
			}
		}
	}
}

