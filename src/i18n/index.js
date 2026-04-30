import { createI18n } from 'vue-i18n'
import en from './en'
import fr from './fr'

const LOCALES  = ['fr', 'en']
const saved    = localStorage.getItem('wishlist_locale') || 'fr'

export const i18n = createI18n({
  legacy: false,
  locale: LOCALES.includes(saved) ? saved : 'fr',
  fallbackLocale: 'en',
  messages: { en, fr },
})

export function setLocale(locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('wishlist_locale', locale)
}

export const LOCALE_FLAGS = { fr: '🇫🇷', en: '🇬🇧' }
export { LOCALES }
