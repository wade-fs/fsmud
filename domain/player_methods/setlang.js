function setlang(lang) {
    if (["en", "zh"].includes(lang)) {
        loadLanguage(lang);
        return i18n("setlang_success", { lang });
    }
    return i18n("setlang_fail");
}
