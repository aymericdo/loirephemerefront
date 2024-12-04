const fs = require('fs');

const base = JSON.parse(fs.readFileSync('./src/locale/messages.json').toString());

const others = ['en', 'es', 'de', 'pt', 'pl', 'nl', 'ru', 'ar'];

const oldTranslations = others.reduce((prev, lang) => {
  prev[lang] = JSON.parse(fs.readFileSync(`./src/locale/messages.${lang}.json`).toString()).translations;
  return prev;
}, {} as { [lang: string]: { [id: string]: string } });

const newTranslations = others.reduce((prev, lang) => {
  prev[lang] = {};
  return prev;
}, {} as { [lang: string]: { [id: string]: string } });

Object.keys(base.translations).forEach((key) => {
  others.forEach((lang) => {
    const value = oldTranslations[lang].hasOwnProperty(key) ?
      oldTranslations[lang][key] :
      base.translations[key];
    newTranslations[lang][key] = value;
  });
});

others.forEach((lang) => {
  fs.writeFileSync(`./src/locale/messages.${lang}.json`, JSON.stringify({
    locale: lang,
    translations: newTranslations[lang],
  }, null, 2));
});
