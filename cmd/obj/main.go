package main

import (
	"flag"
	"fmt"
	"fsmud/utils/obj"
	v8 "fsmud/utils/v8go"
	"os"
	"path/filepath"
)

var iso *v8.Isolate

func main() {
	// 定義命令行參數
	dirPtr := flag.String("d", "", "指定 JSON 檔案所在的資料夾路徑")

	// 用 slice 存儲多個 `-k` 參數的值
	keys := []string{}
	flag.Func("k", "指定要查詢的 key（可多次使用）", func(s string) error {
		keys = append(keys, s)
		return nil
	})

	// 用 slice 存儲多個 `-s` 參數的值
	scripts := []string{}
	flag.Func("s", "指定要執行的腳本路徑（可多次使用）", func(s string) error {
		scripts = append(scripts, s)
		return nil
	})

	flag.Parse()

	// 檢查是否提供了 -d -k -s 參數
	if *dirPtr == "" {
		fmt.Println("錯誤：請使用 -d 指定 JSON 資料夾路徑")
		fmt.Println("用法：")
		fmt.Println("  -d <directory> 指定 JSON 資料夾")
		fmt.Println("  -k <key>       指定要查詢的 key（可多次使用）")
		fmt.Println("  -s <script>    指定要執行的腳本路徑（可多次使用）")
		fmt.Println("範例：")
		fmt.Println("  go run main.go -d ./data -k folder1.file1.key -k folder2.file2.name")
		fmt.Println("  go run main.go -d ./data -s folder1/script1 -s folder2/script2")
		fmt.Println("  go run main.go -d ./data -k folder1.file1.key -s folder1/script1")
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
	if len(keys) > 0 {
		jsonStr, err := loader.Dump("  ")
		if err != nil {
			fmt.Printf("輸出 JSON 失敗：%v\n", err)
			os.Exit(1)
		}
		fmt.Println("完整 JSON 資料：")
		fmt.Println(jsonStr)
	} else {
		iso := v8.NewIsolate()

		if len(scripts) > 0 {
			fmt.Println("執行腳本：")
			for _, script := range scripts {
				fmt.Printf("\n執行腳本: %s\n", script)
				loader.Run_script(loader, iso, script)
			}
		} else {
			// 如果既沒有指定 -k 也沒有指定 -s，則輸出所有資料並執行所有腳本
			// 輸出所有 JSON 資料
			jsonStr, err := loader.Dump("  ")
			if err != nil {
				fmt.Printf("輸出 JSON 失敗：%v\n", err)
				os.Exit(1)
			}
			fmt.Println("完整 JSON 資料：")
			fmt.Println(jsonStr)

			// 執行所有腳本
			fmt.Println("\n執行所有腳本：")
			loader.Run_script(loader, iso, "")
		}
	}
}
