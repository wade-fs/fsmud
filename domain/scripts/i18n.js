// domain/scripts/i18n.js
let messages = {};

function i18n(lang, key, params = {}) {
    let langMessages = messages[lang] || messages["en"] || {};
    let msg = langMessages[key] || messages["en"][key] || key;

    const conditionRegex = /{([^|]+)\|([^}]+)}/g;
    let match;
    while ((match = conditionRegex.exec(msg)) !== null) {
        const [fullMatch, conditionVar, options] = match;
        const conditionPairs = options.split("|").map(opt => opt.split(":"));
        const value = params[conditionVar];
        const replacement = conditionPairs.find(pair => pair[0] === value)?.[1] || "";
        msg = msg.replace(fullMatch, replacement);
    }

    for (let [param, value] of Object.entries(params)) {
        msg = msg.replace(`{${param}}`, value);
    }
    return msg;
}

function loadLanguage(lang) {
    if (messages[lang]) return;
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
loadLanguage("zh");
