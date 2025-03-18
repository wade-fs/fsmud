// domain/i18n.js

let messages = {};
let currentLang = "en";

const defaultMessage = {
    "welcome_user": "Welcome, {username}!",
    "player_not_found": "Player not found.",
    "unknown_command": "Unknown command.",
    "goodbye": "Goodbye.",
    "shutdown_success": "Shutting down the system...",
    "shutdown_permission": "You don't have permission to do that.",
    "weather_update": "The weather is now {weather|sunny:bright and sunny|rainy: wet and rainy} and it is {time}.",
    "combat_restrict": "You can't do that while in combat!"
};

function i18n(key, params = {}) {
    let msg = messages[key] || defaultMessage[key] || key;
    for (let [param, value] of Object.entries(params)) {
        msg = msg.replace(`{${param}}`, value);
    }
    return msg;
}

function loadLanguage(lang = "en") {
    let langData = loadFile(`domain/lang/${lang}.json`);
    if (langData) {
        messages = langData;
        currentLang = lang;
    } else {
        messages = defaultMessage;
        currentLang = "en";
    }
}
