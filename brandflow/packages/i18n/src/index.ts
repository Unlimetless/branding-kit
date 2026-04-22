// BrandFlow i18n Package
// Supports: Georgian (ka), Russian (ru), English (en)

export { default as ka } from './locales/ka.json'
export { default as ru } from './locales/ru.json'
export { default as en } from './locales/en.json'

export const supportedLocales = ['ka', 'ru', 'en'] as const
export type Locale = (typeof supportedLocales)[number]

export const defaultLocale: Locale = 'ka'

export const localeNames: Record<Locale, string> = {
  ka: 'ქართული',
  ru: 'Русский',
  en: 'English',
}