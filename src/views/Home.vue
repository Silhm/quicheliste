<template>
  <div>
    <NavBar />
    <main class="max-w-4xl mx-auto px-4 py-8">

      <!-- My wishlists -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold text-slate-800">My Wishlists</h2>
          <button
            @click="showCreate = true"
            class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
          >
            <span class="text-lg leading-none">+</span> New wishlist
          </button>
        </div>

        <div v-if="store.loading" class="text-slate-400 text-sm">Loading…</div>

        <div v-else-if="myWishlists.length === 0" class="bg-white rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-400">
          <div class="text-4xl mb-2">🎀</div>
          <p>No wishlists yet — create your first one!</p>
        </div>

        <div v-else class="grid gap-4 sm:grid-cols-2">
          <div
            v-for="wl in myWishlists" :key="wl.id"
            class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-slate-800 truncate">{{ wl.title }}</h3>
                <p v-if="wl.description" class="text-sm text-slate-500 mt-0.5 truncate">{{ wl.description }}</p>
                <p class="text-xs text-slate-400 mt-1">{{ wl.item_count }} item{{ wl.item_count !== 1 ? 's' : '' }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-4">
              <RouterLink :to="`/wishlist/${wl.id}`" class="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-2 rounded-lg transition">
                Edit
              </RouterLink>
              <button @click="copyShareLink(wl)" class="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium px-3 py-2 rounded-lg transition">
                {{ copiedId === wl.id ? '✓ Copied!' : 'Share link' }}
              </button>
              <button @click="confirmDelete(wl)" class="bg-red-50 hover:bg-red-100 text-red-500 text-sm px-3 py-2 rounded-lg transition">
                ✕
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Family wishlists -->
      <section v-if="familyWishlists.length" class="mt-10">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Family &amp; Friends</h2>
        <div class="grid gap-3 sm:grid-cols-2">
          <RouterLink
            v-for="wl in familyWishlists" :key="wl.id"
            :to="`/share/${wl.share_token}`"
            class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition block"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center font-bold text-slate-600 text-sm flex-shrink-0">
                {{ wl.owner_name.charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-slate-800 truncate">{{ wl.title }}</p>
                <p class="text-sm text-slate-500">{{ wl.owner_name }} · {{ wl.item_count }} item{{ wl.item_count !== 1 ? 's' : '' }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>

    </main>

    <!-- Create wishlist dialog -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" @click.self="showCreate = false">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-bold text-slate-800 mb-4">New Wishlist</h3>
        <form @submit.prevent="createWishlist">
          <input
            v-model="newTitle"
            placeholder="Title (e.g. Birthday 2026)"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
            autofocus
          />
          <input
            v-model="newDesc"
            placeholder="Short description (optional)"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div class="flex gap-3 mt-5">
            <button type="button" @click="showCreate = false" class="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" :disabled="!newTitle.trim()" class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition">Create</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { useAuthStore } from '../stores/auth'
import { useWishlistStore } from '../stores/wishlists'

const router  = useRouter()
const auth    = useAuthStore()
const store   = useWishlistStore()

const showCreate = ref(false)
const newTitle   = ref('')
const newDesc    = ref('')
const copiedId   = ref(null)

const myWishlists     = computed(() => store.list.filter(w => w.owner_id === auth.user?.id))
const familyWishlists = computed(() => store.list.filter(w => w.owner_id !== auth.user?.id))

onMounted(() => store.fetchAll())

async function createWishlist() {
  const wl = await store.create({ title: newTitle.value.trim(), description: newDesc.value.trim() })
  showCreate.value = false
  newTitle.value = ''
  newDesc.value  = ''
  router.push(`/wishlist/${wl.id}`)
}

async function copyShareLink(wl) {
  const url = `${window.location.origin}/share/${wl.share_token}`
  await navigator.clipboard.writeText(url)
  copiedId.value = wl.id
  setTimeout(() => { copiedId.value = null }, 2000)
}

async function confirmDelete(wl) {
  if (!confirm(`Delete "${wl.title}"? This cannot be undone.`)) return
  await store.remove(wl.id)
}
</script>
