#!/bin/bash

# 使用 getopt 解析參數
OPTIONS=$(getopt -o "" --long v8,go,both -- "$@")
if [ $? -ne 0 ]; then
    echo "Usage: $0 [--v8] [--go] [--both]"
    exit 1
fi
eval set -- "$OPTIONS"

# 預設變數
V8_MODE=false
GO_MODE=false

# 解析選項
while true; do
    case "$1" in
        --v8) 
            V8_MODE=true
            shift ;;
        --go) 
            GO_MODE=true
            shift ;;
        --both) 
            V8_MODE=true
            GO_MODE=true
            shift ;;
        --) 
            shift
            break ;;
        *) 
            echo "Invalid option"
            exit 1 ;;
    esac
done

# 清空 mudlib.txt
> mudlib.txt

# 處理 --v8
if $V8_MODE; then
    cat $(find domain/ -name '*.js') >> mudlib.txt
    [ -f "domain/mudlib.js" ] && cat domain/mudlib.js >> mudlib.txt
    echo "" >> mudlib.txt
fi

# 處理 --go
if $GO_MODE; then
    echo "// golang" >> mudlib.txt
    cat utils/{client,handlers,v8funcs}/*.go cmd/mud/*.go >> mudlib.txt
fi

