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
      <div
        v-for="(items, category) in groupedItems" :key="category"
        class="mb-8 rounded-2xl transition-colors"
        :class="dragOverCategory === category ? 'ring-2 ring-indigo-200 bg-indigo-50/50' : ''"
        @dragover.prevent="onDragOver(category)"
        @drop.prevent="onDropCategory(category)"
      >
        <h3 class="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3 px-1">{{ category }}</h3>
        <div class="space-y-3">
          <div
            v-for="item in items" :key="item.id"
            draggable="true"
            @dragstart="onDragStart($event, item)"
            @dragend="onDragEnd"
            @dragover.prevent.stop="onDragOverItem(item, category)"
            @drop.prevent.stop="onDropItem(item, category)"
            :class="[
              'relative bg-white rounded-2xl shadow-sm p-4 flex gap-4 cursor-grab active:cursor-grabbing transition-opacity select-none',
              draggingItem?.id === item.id ? 'opacity-30 border border-slate-100' :
              dragOverItem?.id === item.id ? 'border-2 border-indigo-400' :
              'border border-slate-100'
            ]"
          >
            <div class="flex items-center text-slate-300 text-lg leading-none select-none px-0.5">⠿</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-semibold text-slate-800">{{ item.name }}</span>
                    <span v-if="item.price" class="text-sm font-medium text-indigo-600">{{ formatPrice(item.price) }}</span>
                    <span v-if="item.priority" class="text-xs text-amber-400 tracking-tighter">{{ '★'.repeat(item.priority) }}</span>
                    <a v-if="item.link" :href="item.link" target="_blank" rel="noopener" class="text-indigo-400 hover:text-indigo-600 text-sm transition">🔗</a>
                  </div>
                  <p v-if="item.description" class="text-sm text-slate-500 mt-0.5">{{ item.description }}</p>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                  <button @click.stop="openEdit(item)" class="text-xs text-slate-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition cursor-pointer">{{ t('wishlist.edit') }}</button>
                  <button @click.stop="deleteItem(item)" class="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition cursor-pointer">✕</button>
                </div>
              </div>
              <div v-if="item.reserved_by" class="mt-2 text-xs text-emerald-600 font-medium">
                {{ t('wishlist.reserved') }}
              </div>
            </div>
            <!-- Preview image: manual takes priority, falls back to scraped og:image -->
            <template v-if="item.image || item.link">
              <a v-if="item.image" :href="item.link || undefined" :target="item.link ? '_blank' : undefined" rel="noopener" class="flex-shrink-0">
                <img :src="item.image" class="w-16 h-16 object-cover rounded-xl border border-slate-100" />
              </a>
              <template v-else>
                <div v-if="preview(item.link) === null" class="flex-shrink-0 w-16 h-16 rounded-xl bg-slate-100 animate-pulse" />
                <a v-else-if="preview(item.link)" :href="item.link" target="_blank" rel="noopener" class="flex-shrink-0">
                  <img :src="preview(item.link)" class="w-16 h-16 object-cover rounded-xl border border-slate-100" />
                </a>
              </template>
            </template>
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
import { usePreview } from '../composables/usePreview'

const route = useRoute()
const store = useWishlistStore()
const { t } = useI18n()
const { preview } = usePreview()

const editingTitle    = ref(false)
const titleDraft      = ref('')
const shareCopied     = ref(false)
const modalOpen       = ref(false)
const editingItem     = ref(null)
const draggingItem     = ref(null)
const dragOverCategory = ref(null)
const dragOverItem     = ref(null)
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

function clearDragState() {
  draggingItem.value     = null
  dragOverCategory.value = null
  dragOverItem.value     = null
}

function onDragStart(event, item) {
  draggingItem.value = item
  event.dataTransfer.effectAllowed = 'move'
}

function onDragEnd() { clearDragState() }

function onDragOver(category) {
  if (!draggingItem.value) return
  dragOverCategory.value = category
  dragOverItem.value     = null
}

function onDragOverItem(item, category) {
  if (!draggingItem.value) return
  dragOverCategory.value = category
  dragOverItem.value     = item
}

async function onDropItem(targetItem, targetCategory) {
  const src = draggingItem.value
  clearDragState()
  if (!src || src.id === targetItem.id) return

  if (src.category === targetCategory) {
    // Insert src before targetItem, then reassign contiguous sort_orders
    const sorted    = [...groupedItems.value[targetCategory]]
    const reordered = sorted.filter(i => i.id !== src.id)
    reordered.splice(reordered.findIndex(i => i.id === targetItem.id), 0, src)
    await Promise.all(reordered.map((item, i) =>
      store.updateItem(store.current.id, item.id, { sort_order: i + 1 })
    ))
    await store.fetchOne(store.current.id)
  } else {
    const items = groupedItems.value[targetCategory] || []
    const idx   = items.findIndex(i => i.id === targetItem.id)
    await store.updateItem(store.current.id, src.id, { category: targetCategory, sort_order: idx + 1 })
  }
}

async function onDropCategory(category) {
  const src = draggingItem.value
  clearDragState()
  if (!src || src.category === category) return

  const items    = groupedItems.value[category] || []
  const maxOrder = items.length ? Math.max(...items.map(i => i.sort_order)) : 0
  await store.updateItem(store.current.id, src.id, { category, sort_order: maxOrder + 1 })
}
</script>
