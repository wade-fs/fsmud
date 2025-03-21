// domain/i18n.js
let messages = {};
let currentLang = "en";

let defaultMessage = {
    "say_empty": "What do you want to say?",
    "say_self": "You say: {message}",
    "say_broadcast": "{id} says: {message}",
    "welcome": "Welcome to the MUD! Type commands to play.",
    "player_not_found": "Player not found.",
    "unknown_command": "Unknown command.",
    "joined_game": "{id} has joined the game as a {race}.",
    "rejoined_game": "{id} has rejoined the game.",
    "left_game": "{id} has left the game.",
    "goodbye": "Goodbye.",
    "look_room": "[{area}] {desc} (Weather: {weather}, Time: {time}) Exits: {exits}",
    "look_item": "{item}: {desc} (Weight: {weight}, Value: {value})",
    "get_success": "You got {item}.",
    "stats": "Stats for {id}{nick}:\nRace: {race}\nHP: {hp}\nMana: {mana}\nInt: {int}\nSpi: {spi}\nLuck: {luck}\nInventory: {inventory}",
    "look_npcs": " NPCs: {npcs}",
    "look_players": " Players here: {players}",
    "look_player": "{id}{nick} [{race}]{bio}\nHP: {hp}, Mana: {mana}, Int: {int}, Spi: {spi}, Luck: {luck}",
    "look_no_target": "No such target here.",
    "go_success": "{desc}",
    "go_fail": "You can't go that way!",
    "get_broadcast": "{id} got {item}.",
    "get_fail": "No such item here.",
    "drop_success": "You dropped {item}. It will vanish in 10 seconds.",
    "drop_broadcast": "{id} dropped {item}.",
    "drop_vanish": "{item} has vanished from {room}.",
    "drop_fail": "You don't have that item.",
    "use_success": "{id} used {item}.",
    "use_fail": "You don't have that item or it can't be used.",
    "attack_start": "{id} engaged {npc} in combat! Their turn begins.",
    "attack_no_mana": "You don't have enough mana to attack!",
    "attack_hit": "{id} attacked {npc} for {damage} damage!{isCritical|true: (Critical Hit!)|false:}",
    "attack_npc_turn": "{npc} hits {id} for {damage} damage! {id}'s HP: {hp}, Mana: {mana}",
    "attack_defeat": "{npc} is defeated! Combat ends.",
    "attack_continue": "{npc} has {hp} HP left. {id}'s turn.",
    "attack_fail": "No such target here.",
    "attack_in_combat": "You are already in combat with {npc}!",
    "combat_restrict": "You can't do that while in combat!",
    "save_success": "Your progress has been saved.",
    "setnick_success": "Nickname set to {nick}.",
    "setnick_broadcast": "{id} has set their nickname to {nick}.",
    "setnick_fail": "Invalid nickname. Must be 1-20 characters.",
    "setbio_success": "Bio updated.",
    "setbio_broadcast": "{id} has updated their bio.",
    "setbio_fail": "Invalid bio. Must be 1-100 characters.",
    "setlang_success": "Language set to {lang}.",
    "setlang_fail": "Invalid language choice. Available languages: en, zh"
};

function i18n(key, params = {}) {
    let msg = messages[key] || defaultMessage[key] || key;

    let conditionRegex = /{([^|]+)\|([^}]+)}/g;
    let match;
    while ((match = conditionRegex.exec(msg)) !== null) {
        let [fullMatch, conditionVar, options] = match;
        let conditionPairs = options.split("|").map(opt => opt.split(":"));
        let value = params[conditionVar];
        let replacement = conditionPairs.find(pair => pair[0] === value)?.[1] || "";
        msg = msg.replace(fullMatch, replacement);
    }

    for (let [param, value] of Object.entries(params)) {
        msg = msg.replace(`{${param}}`, value);
    }
    return msg;
}

function loadLanguage(lang = "en") {
    let rawData = loadFile(`domain/lang/${lang}.json`);
    let langData;
    
    if (rawData && typeof rawData === 'string') {
        try {
            langData = JSON.parse(rawData);
            messages = langData;
            currentLang = lang;
            log(`Loaded language: ${lang}`);
        } catch (e) {
            messages = defaultMessage;
            currentLang = "en";
            log(`Failed to parse ${lang} language file as JSON: ${e.message}, using default English`);
        }
    } else {
        messages = defaultMessage;
        currentLang = "en";
        log(`Failed to load ${lang} language file (received: ${rawData}), using default English`);
    }
}
