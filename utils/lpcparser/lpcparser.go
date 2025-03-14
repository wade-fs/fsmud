package lpcparser

import (
    "bufio"
    "fmt"
    "io"
    "strings"
    "unicode"
)

// TokenType 表示不同的 token 類型
type TokenType int

const (
    TokenEOF TokenType = iota
    TokenIdentifier
    TokenKeyword
    TokenNumber
    TokenString
    TokenOperator
    TokenPunctuator
    TokenComment
    TokenPreprocessor // 新增：預處理器指令
)

// 關鍵字列表 (部分LPC常用關鍵字)
var keywords = map[string]bool{
    "int":     true,
    "string":  true,
    "object":  true,
    "mapping": true,
    "array":   true,
    "void":    true,
    "if":      true,
    "else":    true,
    "for":     true,
    "while":   true,
    "return":  true,
    "inherit": true,
}

// 預處理器指令關鍵字
var preprocessorKeywords = map[string]bool{
    "ifndef":  true,
    "define":  true,
    "include": true,
    "endif":   true,
    "ifdef":   true,
    "else":    true,
}

// Token 表示一個語法單元
type Token struct {
    Type    TokenType
    Value   string
    Line    int
    Column  int
}

// Lexer 負責詞法分析
type Lexer struct {
    reader     *bufio.Reader
    line       int
    column     int
    peekedRune rune
    hasPeek    bool
}

// NewLexer 創建新的 Lexer
func NewLexer(r io.Reader) *Lexer {
    return &Lexer{
        reader:   bufio.NewReader(r),
        line:     1,
        column:   0,
        hasPeek:  false,
    }
}

// nextRune 讀取下一個字符
func (l *Lexer) nextRune() (rune, error) {
    if l.hasPeek {
        l.hasPeek = false
        r := l.peekedRune
        l.peekedRune = 0
        return r, nil
    }

    r, _, err := l.reader.ReadRune()
    if err != nil {
        return 0, err
    }

    if r == '\n' {
        l.line++
        l.column = 0
    } else {
        l.column++
    }
    return r, nil
}

// peekRune 查看下一個字符而不消耗它
func (l *Lexer) peekRune() (rune, error) {
    if l.hasPeek {
        return l.peekedRune, nil
    }

    r, _, err := l.reader.ReadRune()
    if err != nil {
        return 0, err
    }
    l.peekedRune = r
    l.hasPeek = true
    return r, nil
}

// NextToken 返回下一個 token
func (l *Lexer) NextToken() (Token, error) {
    // 跳過空白字符和空行
    var startLine, startColumn int
    var atLineStart = true

    for {
        r, err := l.nextRune()
        if err != nil {
            if err == io.EOF {
                return Token{Type: TokenEOF, Line: l.line, Column: l.column}, nil
            }
            return Token{}, err
        }

        // 更新起始位置
        if atLineStart {
            startLine = l.line
            startColumn = l.column
        }

        // 如果遇到非空白字符，準備處理
        if !unicode.IsSpace(r) {
            l.peekedRune = r
            l.hasPeek = true
            break
        }

        // 如果是換行，重置行首標誌
        if r == '\n' {
            atLineStart = true
            continue
        }

        // 如果遇到非換行空白字符，則不再是行首
        atLineStart = false
    }

    r, err := l.nextRune()
    if err != nil {
        return Token{}, err
    }

    // 處理預處理器指令
    if r == '#' && atLineStart {
        directive := ""
        // 讀取指令名稱
        for {
            nextR, err := l.peekRune()
            if err != nil || unicode.IsSpace(nextR) {
                break
            }
            l.nextRune()
            directive += string(nextR)
        }

        // 讀取指令的參數直到行尾
        params := ""
        for {
            nextR, err := l.peekRune()
            if err != nil || nextR == '\n' {
                if nextR == '\n' {
                    l.nextRune() // 消耗換行符
                }
                break
            }
            l.nextRune()
            params += string(nextR)
        }
        return Token{
            Type:   TokenPreprocessor,
            Value:  strings.TrimSpace(directive + " " + params),
            Line:   startLine,
            Column: 1, // 預處理器指令總是在列 1 開始
        }, nil
    }

    // 處理單行註釋
    if r == '/' {
        nextR, err := l.peekRune()
        if err == nil && nextR == '/' {
            l.nextRune() // consume '/'
            comment := "//"
            for {
                r, err := l.nextRune()
                if err != nil || r == '\n' {
                    return Token{
                        Type:   TokenComment,
                        Value:  comment,
                        Line:   startLine,
                        Column: startColumn,
                    }, nil
                }
                comment += string(r)
            }
        }
    }

    // 處理數字
    if unicode.IsDigit(r) {
        num := string(r)
        for {
            nextR, err := l.peekRune()
            if err != nil || (!unicode.IsDigit(nextR) && nextR != '.') {
                break
            }
            l.nextRune()
            num += string(nextR)
        }
        return Token{
            Type:   TokenNumber,
            Value:  num,
            Line:   startLine,
            Column: startColumn,
        }, nil
    }

    // 處理字符串
    if r == '"' {
        str := ""
        for {
            r, err := l.nextRune()
            if err != nil {
                return Token{}, fmt.Errorf("unterminated string at line %d", l.line)
            }
            if r == '"' {
                break
            }
            if r == '\\' {
                nextR, err := l.nextRune()
                if err != nil {
                    return Token{}, fmt.Errorf("unterminated string at line %d", l.line)
                }
                str += string(r) + string(nextR)
                continue
            }
            str += string(r)
        }
        return Token{
            Type:   TokenString,
            Value:  str,
            Line:   startLine,
            Column: startColumn,
        }, nil
    }

    // 處理標識符和關鍵字
    if unicode.IsLetter(r) || r == '_' {
        id := string(r)
        for {
            nextR, err := l.peekRune()
            if err != nil || (!unicode.IsLetter(nextR) && !unicode.IsDigit(nextR) && nextR != '_') {
                break
            }
            l.nextRune()
            id += string(nextR)
        }
        tokenType := TokenIdentifier
        if keywords[id] {
            tokenType = TokenKeyword
        }
        return Token{
            Type:   tokenType,
            Value:  id,
            Line:   startLine,
            Column: startColumn,
        }, nil
    }

    // 處理操作符和標點符號
    value := string(r)
    return Token{
        Type:   TokenOperator,
        Value:  value,
        Line:   startLine,
        Column: startColumn,
    }, nil
}

// AST 節點類型
type NodeType int

const (
    NodeProgram NodeType = iota
    NodeInherit
    NodeFunction
    NodeReturn
    NodeIdentifier
    NodeString
    NodeNumber
    NodePreprocessor // 新增：預處理器節點
)

// AST 節點
type Node struct {
    Type     NodeType
    Value    string
    Children []*Node
    Line     int
    Column   int
}

// Parser 負責語法分析
type Parser struct {
    lexer        *Lexer
    currentToken Token
}

// NewParser 創建新的 Parser
func NewParser(r io.Reader) *Parser {
    lexer := NewLexer(r)
    return &Parser{
        lexer: lexer,
    }
}

// advance 獲取下一個 token
func (p *Parser) advance() error {
    var err error
    p.currentToken, err = p.lexer.NextToken()
    return err
}

// expect 檢查期望的 token 類型
func (p *Parser) expect(tokenType TokenType) error {
    if p.currentToken.Type != tokenType {
        return fmt.Errorf("unexpected token at line %d, column %d: got %v, want %v, value=%q",
            p.currentToken.Line, p.currentToken.Column,
            p.currentToken.Type, tokenType, p.currentToken.Value)
    }
    return p.advance()
}

// parseIdentifier 解析標識符
func (p *Parser) parseIdentifier() (*Node, error) {
    node := &Node{
        Type:   NodeIdentifier,
        Value:  p.currentToken.Value,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }
    if err := p.expect(TokenIdentifier); err != nil {
        return nil, err
    }
    return node, nil
}

// parseString 解析字符串
func (p *Parser) parseString() (*Node, error) {
    node := &Node{
        Type:   NodeString,
        Value:  p.currentToken.Value,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }
    if err := p.expect(TokenString); err != nil {
        return nil, err
    }
    return node, nil
}

// parseNumber 解析數字
func (p *Parser) parseNumber() (*Node, error) {
    node := &Node{
        Type:   NodeNumber,
        Value:  p.currentToken.Value,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }
    if err := p.expect(TokenNumber); err != nil {
        return nil, err
    }
    return node, nil
}

// parsePreprocessor 解析預處理器指令
func (p *Parser) parsePreprocessor() (*Node, error) {
    node := &Node{
        Type:   NodePreprocessor,
        Value:  p.currentToken.Value,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }
    if err := p.expect(TokenPreprocessor); err != nil {
        return nil, err
    }
    return node, nil
}

// parseInherit 解析 inherit 語句
func (p *Parser) parseInherit() (*Node, error) {
    node := &Node{
        Type:   NodeInherit,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }

    if err := p.expect(TokenKeyword); err != nil { // "inherit"
        return nil, err
    }

    // 解析 inherit 的路徑
    path, err := p.parseString()
    if err != nil {
        return nil, err
    }
    node.Children = append(node.Children, path)

    // 期望分號
    if err := p.expect(TokenOperator); err != nil { // ";"
        return nil, err
    }

    return node, nil
}

// parseFunction 解析函數定義
func (p *Parser) parseFunction() (*Node, error) {
    node := &Node{
        Type:   NodeFunction,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }

    // 解析返回類型
    returnType := &Node{
        Type:   NodeIdentifier,
        Value:  p.currentToken.Value,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }
    if err := p.expect(TokenKeyword); err != nil {
        return nil, err
    }
    node.Children = append(node.Children, returnType)

    // 解析函數名
    funcName, err := p.parseIdentifier()
    if err != nil {
        return nil, err
    }
    node.Children = append(node.Children, funcName)

    // 期望 "("
    if err := p.expect(TokenOperator); err != nil {
        return nil, err
    }

    // 期望 ")"
    if err := p.expect(TokenOperator); err != nil {
        return nil, err
    }

    // 期望 "{"
    if err := p.expect(TokenOperator); err != nil {
        return nil, err
    }

    // 解析函數體
    for p.currentToken.Type != TokenEOF && p.currentToken.Value != "}" {
        if p.currentToken.Type == TokenKeyword && p.currentToken.Value == "return" {
            returnStmt, err := p.parseReturn()
            if err != nil {
                return nil, err
            }
            node.Children = append(node.Children, returnStmt)
        } else {
            return nil, fmt.Errorf("unexpected token in function body at line %d, column %d: type=%v, value=%q",
                p.currentToken.Line, p.currentToken.Column, p.currentToken.Type, p.currentToken.Value)
        }
    }

    // 期望 "}"
    if err := p.expect(TokenOperator); err != nil {
        return nil, err
    }

    return node, nil
}

// parseReturn 解析 return 語句
func (p *Parser) parseReturn() (*Node, error) {
    node := &Node{
        Type:   NodeReturn,
        Line:   p.currentToken.Line,
        Column: p.currentToken.Column,
    }

    if err := p.expect(TokenKeyword); err != nil { // "return"
        return nil, err
    }

    // 解析返回值
    var value *Node
    var err error
    switch p.currentToken.Type {
    case TokenNumber:
        value, err = p.parseNumber()
    case TokenString:
        value, err = p.parseString()
    default:
        return nil, fmt.Errorf("unexpected return value type at line %d, column %d: type=%v, value=%q",
            p.currentToken.Line, p.currentToken.Column, p.currentToken.Type, p.currentToken.Value)
    }
    if err != nil {
        return nil, err
    }
    node.Children = append(node.Children, value)

    // 期望分號
    if err := p.expect(TokenOperator); err != nil { // ";"
        return nil, err
    }

    return node, nil
}

// Parse 解析整個程序
func (p *Parser) Parse() (*Node, error) {
    if err := p.advance(); err != nil {
        return nil, err
    }

    program := &Node{
        Type: NodeProgram,
    }

    for p.currentToken.Type != TokenEOF {
        // 跳過空行（如果仍有空行 token）
        if p.currentToken.Type == TokenOperator && (p.currentToken.Value == "\n" || p.currentToken.Value == "") {
            if err := p.advance(); err != nil {
                return nil, err
            }
            continue
        }

        switch {
        case p.currentToken.Type == TokenPreprocessor:
            preprocNode, err := p.parsePreprocessor()
            if err != nil {
                return nil, fmt.Errorf("failed to parse preprocessor directive at line %d, column %d: %v",
                    p.currentToken.Line, p.currentToken.Column, err)
            }
            program.Children = append(program.Children, preprocNode)
        case p.currentToken.Type == TokenKeyword && p.currentToken.Value == "inherit":
            inheritNode, err := p.parseInherit()
            if err != nil {
                return nil, fmt.Errorf("failed to parse inherit statement at line %d, column %d: %v",
                    p.currentToken.Line, p.currentToken.Column, err)
            }
            program.Children = append(program.Children, inheritNode)
        case p.currentToken.Type == TokenKeyword: // 假設是函數返回類型
            funcNode, err := p.parseFunction()
            if err != nil {
                return nil, fmt.Errorf("failed to parse function at line %d, column %d: %v",
                    p.currentToken.Line, p.currentToken.Column, err)
            }
            program.Children = append(program.Children, funcNode)
        default:
            return nil, fmt.Errorf("unexpected token at line %d, column %d: type=%v, value=%q",
                p.currentToken.Line, p.currentToken.Column, p.currentToken.Type, p.currentToken.Value)
        }
    }

    return program, nil
}

// PrintAST 打印 AST（用於調試）
func PrintAST(node *Node, indent int) {
    fmt.Printf("%sType: %v, Value: %q, Line: %d, Column: %d\n",
        strings.Repeat("  ", indent), node.Type, node.Value, node.Line, node.Column)
    for _, child := range node.Children {
        PrintAST(child, indent+1)
    }
}
