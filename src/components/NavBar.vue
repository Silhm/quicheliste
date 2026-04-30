<template>
  <header class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
    <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-slate-800 hover:text-indigo-600 transition">
        <span class="text-xl">🎁</span>
        <span class="hidden sm:inline">{{ t('nav.title') }}</span>
      </RouterLink>

      <div class="flex items-center gap-3">
        <!-- Language switcher -->
        <div class="flex items-center gap-0.5">
          <button
            v-for="loc in LOCALES" :key="loc"
            @click="switchLocale(loc)"
            :title="loc.toUpperCase()"
            :class="[
              'text-xl px-1 py-0.5 rounded-lg transition',
              locale === loc ? 'opacity-100 ring-2 ring-indigo-300' : 'opacity-40 hover:opacity-70'
            ]"
          >{{ LOCALE_FLAGS[loc] }}</button>
        </div>

        <RouterLink v-if="auth.isAdmin" to="/admin" class="text-sm text-slate-500 hover:text-indigo-600 transition">
          {{ t('nav.admin') }}
        </RouterLink>

        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-sm font-bold text-slate-600">
            {{ auth.user?.name?.charAt(0).toUpperCase() }}
          </div>
          <span class="hidden sm:inline text-sm text-slate-600">{{ auth.user?.name }}</span>
        </div>

        <button @click="logout" class="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50">
          {{ t('nav.logout') }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { i18n, setLocale, LOCALES, LOCALE_FLAGS } from '../i18n'

const router = useRouter()
const auth   = useAuthStore()
const { t }  = useI18n()
const locale = computed(() => i18n.global.locale.value)

function switchLocale(loc) { setLocale(loc) }

function logout() {
  auth.logout()
  router.push('/register')
}
</script>
