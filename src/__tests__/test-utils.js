import { createI18n } from 'vue-i18n'
import en from '../i18n/en'
import fr from '../i18n/fr'

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en, fr },
})

export const globalPlugins = { plugins: [i18n] }
