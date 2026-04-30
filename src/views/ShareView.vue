<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
    <div class="max-w-2xl mx-auto px-4 py-10">

      <div v-if="loading" class="text-center text-slate-400 py-20">Loading…</div>

      <div v-else-if="wishlist">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🎁</div>
          <h1 class="text-2xl font-bold text-slate-800">{{ wishlist.title }}</h1>
          <p class="text-slate-500 mt-1">{{ wishlist.owner_name }}'s wishlist</p>
          <p v-if="wishlist.description" class="text-slate-400 text-sm mt-1">{{ wishlist.description }}</p>
        </div>

        <div v-if="wishlist.items.length === 0" class="text-center text-slate-400 py-12">
          <p>No items yet — check back later!</p>
        </div>

        <!-- Items by category -->
        <div v-for="(items, category) in groupedItems" :key="category" class="mb-8">
          <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{{ category }}</h3>
          <div class="space-y-3">
            <div
              v-for="item in items" :key="item.id"
              :class="[
                'bg-white rounded-2xl shadow-sm border p-5 transition',
                item.reserved ? 'opacity-60 border-slate-100' : 'border-slate-100 hover:shadow-md'
              ]"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span :class="['font-semibold text-slate-800', item.reserved && 'line-through']">{{ item.name }}</span>
                    <span v-if="item.price" class="text-sm font-medium text-indigo-600">{{ formatPrice(item.price) }}</span>
                    <a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="text-indigo-400 hover:text-indigo-600 text-sm transition" title="View product">🔗 Link</a>
                  </div>
                  <p v-if="item.description" class="text-sm text-slate-500 mt-1">{{ item.description }}</p>
                  <p v-if="item.reserved" class="text-xs text-emerald-600 font-medium mt-2">✓ Already reserved</p>
                </div>

                <button
                  v-if="!item.reserved"
                  @click="openReserve(item)"
                  class="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
                >
                  Reserve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-slate-400 py-20">
        <div class="text-4xl mb-2">😕</div>
        <p>Wishlist not found.</p>
      </div>
    </div>

    <!-- Reserve modal -->
    <div v-if="reserveItem" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" @click.self="reserveItem = null">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
        <h3 class="text-lg font-bold text-slate-800 mb-1">Reserve "{{ reserveItem.name }}"</h3>
        <p class="text-sm text-slate-500 mb-4">Enter your name so others know this gift is taken. The wishlist owner won't know it's you!</p>
        <input
          v-model="reserverName"
          placeholder="Your name"
          class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
          autofocus
        />
        <p v-if="reserveError" class="text-red-500 text-sm mb-3">{{ reserveError }}</p>
        <div class="flex gap-3">
          <button @click="reserveItem = null" class="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition">Cancel</button>
          <button @click="confirmReserve" :disabled="!reserverName.trim() || reserving" class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition">
            {{ reserving ? 'Saving…' : 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()

const wishlist    = ref(null)
const loading     = ref(true)
const reserveItem = ref(null)
const reserverName = ref('')
const reserveError = ref('')
const reserving   = ref(false)

onMounted(async () => {
  try {
    const res = await api.get('/api/share.php', { params: { token: route.params.shareToken } })
    wishlist.value = res.data
  } finally {
    loading.value = false
  }
})

const groupedItems = computed(() => {
  if (!wishlist.value) return {}
  const groups = {}
  const sorted = [...wishlist.value.items].sort((a, b) => a.sort_order - b.sort_order)
  for (const item of sorted) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)))
})

function formatPrice(p) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(p)
}

function openReserve(item) {
  reserveItem.value  = item
  reserverName.value = ''
  reserveError.value = ''
}

async function confirmReserve() {
  if (!reserverName.value.trim()) return
  reserving.value    = true
  reserveError.value = ''
  try {
    await api.post('/api/reserve.php', {
      share_token: route.params.shareToken,
      item_id:     reserveItem.value.id,
      name:        reserverName.value.trim(),
    })
    reserveItem.value.reserved = true
    reserveItem.value = null
  } catch (e) {
    reserveError.value = e.response?.data?.error || 'Something went wrong'
  } finally {
    reserving.value = false
  }
}
</script>
