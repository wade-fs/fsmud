// domain/scripts/i18n.js
let messages = {};

function i18n(lang, key, params = {}) {
    // 使用指定語言的訊息，無則 fallback 到英文，再無則用 key
    let langMessages = messages[lang] || messages["en"] || {};
    let msg = langMessages[key] || messages["en"][key] || key;

    // 處理條件語法，例如 {isCritical|true: (Critical Hit!)|false:}
    const conditionRegex = /{([^|]+)\|([^}]+)}/g;
    let match;
    while ((match = conditionRegex.exec(msg)) !== null) {
        const [fullMatch, conditionVar, options] = match;
        const conditionPairs = options.split("|").map(opt => opt.split(":"));
        const value = params[conditionVar];
        const replacement = conditionPairs.find(pair => pair[0] === value)?.[1] || "";
        msg = msg.replace(fullMatch, replacement);
    }

    // 替換簡單參數，例如 {id}
    for (let [param, value] of Object.entries(params)) {
        msg = msg.replace(`{${param}}`, value);
    }
    return msg;
}

function loadLanguage(lang) {
    if (messages[lang]) return; // 已載入則跳過
    let rawData = loadFile(`domain/lang/${lang}.json`);
    if (rawData && typeof rawData === 'string') {
        try {
            messages[lang] = JSON.parse(rawData);
            log(`Loaded language: ${lang}`);
        } catch (e) {
            log(`Failed to parse ${lang} language file: ${e.message}`);
        }
    } else {
        log(`Failed to load ${lang} language file`);
    }
}

loadLanguage("en");
