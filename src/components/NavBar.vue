<template>
  <header class="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
    <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <RouterLink to="/" class="flex items-center gap-2 font-bold text-slate-800 hover:text-indigo-600 transition">
        <span class="text-xl">🎁</span>
        <span class="hidden sm:inline">Family Wishlist</span>
      </RouterLink>

      <div class="flex items-center gap-3">
        <RouterLink v-if="auth.isAdmin" to="/admin" class="text-sm text-slate-500 hover:text-indigo-600 transition">Admin</RouterLink>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center text-sm font-bold text-slate-600">
            {{ auth.user?.name?.charAt(0).toUpperCase() }}
          </div>
          <span class="hidden sm:inline text-sm text-slate-600">{{ auth.user?.name }}</span>
        </div>
        <button @click="logout" class="text-xs text-slate-400 hover:text-red-500 transition px-2 py-1 rounded-lg hover:bg-red-50">
          Log out
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth   = useAuthStore()

function logout() {
  auth.logout()
  router.push('/register')
}
</script>
