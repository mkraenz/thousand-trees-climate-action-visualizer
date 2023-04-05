// @ts-check

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  debug: true,
  strictMode: true,
  i18n: {
    defaultLocale: "en",
    locales: ["en", "de", "nl", "pt-BR", "pt"],
  },
  // unfortunately, while this works to fallback from pt-BR to pt (instead of en), nextjs has serialization issues. Solving the serialization issue causes a Rehydration error
  // fallbackLng: (locale) => {
  //   return {
  //     [locale]: [locale.substring(0, 2), "en"],
  //     default: ["en"],
  //   };
  // },
  ns: ["common"],
};
