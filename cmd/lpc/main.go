package main

import (
    "fmt"
    "strings"
    "fsmud/utils/lpcparser"
)

func main() {
    lpcCode := `
#ifndef __TEST_H__
#define __TEST_H__
#include <test.h>

inherit "/std/object";

int query_value() {
    return 100;
}

string short() {
    return "A test object";
}
#endif
    `

    reader := strings.NewReader(lpcCode)
    parser := lpcparser.NewParser(reader)

    ast, err := parser.Parse()
    if err != nil {
        fmt.Printf("Parse error: %v\n", err)
        return
    }

    fmt.Println("AST:")
    lpcparser.PrintAST(ast, 0)
}
