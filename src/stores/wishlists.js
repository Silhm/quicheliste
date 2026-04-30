import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../api'

export const useWishlistStore = defineStore('wishlists', () => {
  const list    = ref([])
  const current = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try {
      const res = await api.get('/api/wishlists.php')
      list.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchOne(id) {
    loading.value = true
    try {
      const res = await api.get('/api/wishlist.php', { params: { id } })
      current.value = res.data
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    const res = await api.post('/api/wishlists.php', data)
    list.value.push({ ...res.data, item_count: 0 })
    return res.data
  }

  async function update(id, data) {
    const res = await api.put('/api/wishlist.php', data, { params: { id } })
    const idx = list.value.findIndex(w => w.id === id)
    if (idx !== -1) Object.assign(list.value[idx], data)
    if (current.value?.id === id) Object.assign(current.value, data)
    return res.data
  }

  async function remove(id) {
    await api.delete('/api/wishlist.php', { params: { id } })
    list.value = list.value.filter(w => w.id !== id)
    if (current.value?.id === id) current.value = null
  }

  async function addItem(wishlistId, itemData) {
    const res = await api.post('/api/items.php', { wishlist_id: wishlistId, ...itemData })
    if (current.value?.id === wishlistId) current.value.items.push(res.data)
    const wl = list.value.find(w => w.id === wishlistId)
    if (wl) wl.item_count++
    return res.data
  }

  async function updateItem(wishlistId, itemId, itemData) {
    const res = await api.put('/api/item.php', itemData, { params: { id: itemId, wishlist_id: wishlistId } })
    if (current.value?.id === wishlistId) {
      const idx = current.value.items.findIndex(i => i.id === itemId)
      if (idx !== -1) current.value.items[idx] = res.data
    }
    return res.data
  }

  async function removeItem(wishlistId, itemId) {
    await api.delete('/api/item.php', { params: { id: itemId, wishlist_id: wishlistId } })
    if (current.value?.id === wishlistId)
      current.value.items = current.value.items.filter(i => i.id !== itemId)
    const wl = list.value.find(w => w.id === wishlistId)
    if (wl) wl.item_count--
  }

  return { list, current, loading, fetchAll, fetchOne, create, update, remove, addItem, updateItem, removeItem }
})
