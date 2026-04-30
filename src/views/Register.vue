<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

      <!-- Language switcher -->
      <div class="flex justify-center gap-1 mb-6">
        <button
          v-for="loc in LOCALES" :key="loc"
          @click="switchLocale(loc)"
          :title="loc.toUpperCase()"
          :class="[
            'text-2xl px-1 py-0.5 rounded-lg transition',
            locale === loc ? 'opacity-100 ring-2 ring-indigo-300' : 'opacity-35 hover:opacity-60'
          ]"
        >{{ LOCALE_FLAGS[loc] }}</button>
      </div>

      <!-- Step 1: name form -->
      <template v-if="!accessLink">
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🎁</div>
          <h1 class="text-2xl font-bold text-slate-800">{{ t('register.title') }}</h1>
          <p class="text-slate-500 mt-1">{{ t('register.subtitle') }}</p>
        </div>

        <form @submit.prevent="register">
          <input
            v-model="name"
            type="text"
            :placeholder="t('register.namePlaceholder')"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
            autofocus
          />
          <button
            type="submit"
            :disabled="!name.trim() || loading"
            class="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
          >
            {{ loading ? t('register.submitting') : t('register.submit') }}
          </button>
          <p v-if="error" class="mt-3 text-red-500 text-sm text-center">{{ error }}</p>
        </form>
      </template>

      <!-- Step 2: link reveal -->
      <template v-else>
        <div class="text-center mb-6">
          <div class="text-5xl mb-3">🎉</div>
          <h2 class="text-2xl font-bold text-slate-800">{{ t('register.greeting', { name: registeredName }) }}</h2>
          <p class="text-slate-500 mt-2 text-sm">{{ t('register.linkIntro') }}</p>
        </div>

        <div class="bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
          <p class="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wide">{{ t('register.linkLabel') }}</p>
          <div class="flex gap-2">
            <input
              :value="accessLink"
              readonly
              class="flex-1 text-xs bg-white border border-indigo-200 rounded-xl px-3 py-2.5 text-slate-600 select-all focus:outline-none focus:ring-2 focus:ring-indigo-300"
              @focus="e => e.target.select()"
            />
            <button
              @click="copyLink"
              class="flex-shrink-0 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition"
            >
              {{ copied ? '✓' : t('register.copy') }}
            </button>
          </div>
        </div>

        <button
          @click="goHome"
          class="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition"
        >
          {{ t('register.goHome') }}
        </button>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/auth'
import { i18n, setLocale, LOCALES, LOCALE_FLAGS } from '../i18n'
import api from '../api'

const router = useRouter()
const auth   = useAuthStore()
const { t }  = useI18n()
const locale = computed(() => i18n.global.locale.value)

const name          = ref('')
const registeredName = ref('')
const loading       = ref(false)
const error         = ref('')
const accessLink    = ref('')
const copied        = ref(false)

function switchLocale(loc) { setLocale(loc) }

async function register() {
  if (!name.value.trim()) return
  loading.value = true
  error.value   = ''
  try {
    const res = await api.post('/api/auth.php', { name: name.value.trim() })
    auth.setToken(res.data.token)
    auth.user        = res.data.user
    registeredName.value = name.value.trim()
    accessLink.value = `${window.location.origin}/?token=${res.data.token}`
  } catch (e) {
    error.value = e.response?.data?.error || t('common.error')
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(accessLink.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}

function goHome() { router.push('/') }
</script>
