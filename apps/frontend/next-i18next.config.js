// @ts-check

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  debug: false,
  strictMode: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de", "nl", "pt-BR", "pt", "ja"],
  },
  // we have to manually set the fallbacks here for each sub-locale (e.g. pt-BR)
  fallbackLng: {
    "de-DE": ["de", "en"],
    "de-AT": ["de", "en"],
    "de-CH": ["de", "en"],
    "pt-BR": ["pt", "en"],
    "ja-JP": ["ja", "en"],
    default: ["en"],
  },
  ns: ["common"],
  defaultNS: "common",
  returnEmptyString: false,
};
