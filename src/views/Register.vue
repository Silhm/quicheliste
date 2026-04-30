<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

      <div class="text-center mb-8">
        <div class="text-5xl mb-3">🎁</div>
        <h1 class="text-2xl font-bold text-slate-800">Family Wishlist</h1>
        <p class="text-slate-500 mt-1">Enter your name to get started</p>
      </div>

      <form @submit.prevent="register">
        <input
          v-model="name"
          type="text"
          placeholder="Your first name"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-lg"
          autofocus
        />
        <button
          type="submit"
          :disabled="!name.trim() || loading"
          class="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
        >
          {{ loading ? 'Creating account…' : 'Get my wishlist link' }}
        </button>
        <p v-if="error" class="mt-3 text-red-500 text-sm text-center">{{ error }}</p>
      </form>

      <!-- Token reveal step -->
      <div v-if="accessLink" class="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
        <p class="text-sm font-semibold text-indigo-700 mb-2">Your personal access link — bookmark it!</p>
        <div class="flex gap-2">
          <input
            :value="accessLink"
            readonly
            class="flex-1 text-xs bg-white border border-indigo-200 rounded-lg px-3 py-2 text-slate-600 select-all"
          />
          <button @click="copyLink" class="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
            {{ copied ? '✓' : 'Copy' }}
          </button>
        </div>
        <button @click="goHome" class="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition">
          Go to my wishlist
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api'

const router  = useRouter()
const auth    = useAuthStore()
const name    = ref('')
const loading = ref(false)
const error   = ref('')
const accessLink = ref('')
const copied  = ref(false)

async function register() {
  if (!name.value.trim()) return
  loading.value = true
  error.value   = ''
  try {
    const res = await api.post('/api/auth.php', { name: name.value.trim() })
    auth.setToken(res.data.token)
    auth.user = res.data.user
    const base = window.location.origin + window.location.pathname.replace(/\/$/, '')
    accessLink.value = `${base}/?token=${res.data.token}`
  } catch (e) {
    error.value = e.response?.data?.error || 'Something went wrong'
  } finally {
    loading.value = false
  }
}

async function copyLink() {
  await navigator.clipboard.writeText(accessLink.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function goHome() {
  router.push('/')
}
</script>
