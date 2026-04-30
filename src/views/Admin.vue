<template>
  <div>
    <NavBar />
    <main class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-2xl font-bold text-slate-800 mb-6">Admin — All Users</h1>

      <div v-if="loading" class="text-slate-400 text-sm">Loading…</div>

      <div v-else class="space-y-3">
        <div v-for="user in users" :key="user.id" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center font-bold text-slate-600 text-sm">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-semibold text-slate-800">{{ user.name }}</span>
                <span v-if="user.is_admin" class="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">admin</span>
              </div>
              <p class="text-xs text-slate-400">Joined {{ formatDate(user.created_at) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500 font-mono flex-1 bg-slate-50 rounded-lg px-3 py-2 truncate">{{ user.token }}</span>
            <button @click="copyToken(user)" class="text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium px-3 py-2 rounded-lg transition flex-shrink-0">
              {{ copiedId === user.id ? '✓ Copied' : 'Copy token' }}
            </button>
            <button @click="copyAccessLink(user)" class="text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium px-3 py-2 rounded-lg transition flex-shrink-0">
              Copy link
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'
import api from '../api'

const users    = ref([])
const loading  = ref(true)
const copiedId = ref(null)

onMounted(async () => {
  try {
    const res = await api.get('/api/users.php')
    users.value = res.data
  } finally {
    loading.value = false
  }
})

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

async function copyToken(user) {
  await navigator.clipboard.writeText(user.token)
  copiedId.value = user.id
  setTimeout(() => { copiedId.value = null }, 2000)
}

async function copyAccessLink(user) {
  const link = `${window.location.origin}/?token=${user.token}`
  await navigator.clipboard.writeText(link)
  copiedId.value = user.id
  setTimeout(() => { copiedId.value = null }, 2000)
}
</script>
