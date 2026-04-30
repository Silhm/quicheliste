<template>
  <div>
    <NavBar />
    <main v-if="store.current" class="max-w-3xl mx-auto px-4 py-8">

      <!-- Header -->
      <div class="flex items-start gap-3 mb-6">
        <RouterLink to="/" class="mt-1 text-slate-400 hover:text-slate-600 transition text-xl leading-none">←</RouterLink>
        <div class="flex-1 min-w-0">
          <div v-if="!editingTitle" class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-slate-800 truncate">{{ store.current.title }}</h1>
            <button @click="startEditTitle" class="text-slate-400 hover:text-indigo-600 transition">✎</button>
          </div>
          <form v-else @submit.prevent="saveTitle" class="flex gap-2">
            <input v-model="titleDraft" class="flex-1 border border-indigo-400 rounded-xl px-3 py-1 text-lg font-bold focus:outline-none" autofocus />
            <button type="submit" class="px-3 py-1 bg-indigo-600 text-white rounded-xl text-sm">{{ t('common.save') }}</button>
            <button type="button" @click="editingTitle = false" class="px-3 py-1 border rounded-xl text-sm">{{ t('common.cancel') }}</button>
          </form>
          <p v-if="store.current.description" class="text-slate-500 mt-1 text-sm">{{ store.current.description }}</p>
        </div>
        <button @click="copyShareLink" class="flex-shrink-0 flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium px-4 py-2 rounded-xl transition">
          {{ shareCopied ? t('common.copied') : t('wishlist.share') }}
        </button>
      </div>

      <!-- Add item button -->
      <button
        @click="openAdd"
        class="w-full border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-indigo-500 hover:text-indigo-700 rounded-2xl py-4 text-sm font-medium transition mb-6"
      >
        {{ t('wishlist.addItem') }}
      </button>

      <!-- Empty state -->
      <div v-if="store.current.items.length === 0" class="text-center text-slate-400 py-12">
        <div class="text-4xl mb-2">🎀</div>
        <p>{{ t('wishlist.empty') }}</p>
      </div>

      <!-- Items grouped by category -->
      <div v-for="(items, category) in groupedItems" :key="category" class="mb-8">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">{{ category }}</h3>
        <div class="space-y-3">
          <div
            v-for="(item, idx) in items" :key="item.id"
            class="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex gap-4"
          >
            <div class="flex flex-col gap-1 justify-center">
              <button @click="moveItem(item, category, idx, -1)" :disabled="idx === 0" class="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-xs leading-none">▲</button>
              <button @click="moveItem(item, category, idx, +1)" :disabled="idx === items.length - 1" class="text-slate-300 hover:text-slate-500 disabled:opacity-20 text-xs leading-none">▼</button>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-slate-800">{{ item.name }}</span>
                    <span v-if="item.price" class="text-sm font-medium text-indigo-600">{{ formatPrice(item.price) }}</span>
                    <a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="text-indigo-400 hover:text-indigo-600 text-sm transition">🔗</a>
                  </div>
                  <p v-if="item.description" class="text-sm text-slate-500 mt-0.5">{{ item.description }}</p>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                  <button @click="openEdit(item)" class="text-xs text-slate-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition">{{ t('wishlist.edit') }}</button>
                  <button @click="deleteItem(item)" class="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition">✕</button>
                </div>
              </div>
              <div v-if="item.reserved_by" class="mt-2 text-xs text-emerald-600 font-medium">
                {{ t('wishlist.reserved') }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>

    <div v-else-if="store.loading" class="text-center py-20 text-slate-400">{{ t('common.loading') }}</div>

    <ItemModal
      v-if="modalOpen"
      :item="editingItem"
      :existing-categories="existingCategories"
      @save="onSave"
      @close="modalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import NavBar from '../components/NavBar.vue'
import ItemModal from '../components/ItemModal.vue'
import { useWishlistStore } from '../stores/wishlists'

const route = useRoute()
const store = useWishlistStore()
const { t } = useI18n()

const editingTitle = ref(false)
const titleDraft   = ref('')
const shareCopied  = ref(false)
const modalOpen    = ref(false)
const editingItem  = ref(null)

onMounted(() => store.fetchOne(route.params.id))

const groupedItems = computed(() => {
  if (!store.current) return {}
  const groups = {}
  const sorted = [...store.current.items].sort((a, b) => a.sort_order - b.sort_order)
  for (const item of sorted) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return Object.fromEntries(Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)))
})

const existingCategories = computed(() =>
  [...new Set((store.current?.items || []).map(i => i.category))].filter(Boolean)
)

function formatPrice(p) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(p)
}

function startEditTitle() {
  titleDraft.value   = store.current.title
  editingTitle.value = true
}

async function saveTitle() {
  await store.update(store.current.id, { title: titleDraft.value.trim() })
  editingTitle.value = false
}

async function copyShareLink() {
  const url = `${window.location.origin}/share/${store.current.share_token}`
  await navigator.clipboard.writeText(url)
  shareCopied.value = true
  setTimeout(() => { shareCopied.value = false }, 2000)
}

function openAdd()   { editingItem.value = null; modalOpen.value = true }
function openEdit(item) { editingItem.value = { ...item }; modalOpen.value = true }

async function onSave(data) {
  if (editingItem.value) {
    await store.updateItem(store.current.id, editingItem.value.id, data)
  } else {
    await store.addItem(store.current.id, data)
  }
  modalOpen.value = false
}

async function deleteItem(item) {
  if (!confirm(t('wishlist.removeConfirm', { name: item.name }))) return
  await store.removeItem(store.current.id, item.id)
}

async function moveItem(item, category, idx, direction) {
  const siblings = groupedItems.value[category]
  const target   = siblings[idx + direction]
  if (!target) return
  await store.updateItem(store.current.id, item.id,   { sort_order: target.sort_order })
  await store.updateItem(store.current.id, target.id, { sort_order: item.sort_order })
  await store.fetchOne(store.current.id)
}
</script>
