import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('wishlist_token') || null)
  const user  = ref(null)
  const ready = ref(false)

  const isAdmin    = computed(() => user.value?.is_admin === true)
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  function setToken(t) {
    token.value = t
    localStorage.setItem('wishlist_token', t)
  }

  function logout() {
    token.value = null
    user.value  = null
    localStorage.removeItem('wishlist_token')
  }

  async function fetchMe() {
    if (!token.value) { ready.value = true; return false }
    try {
      const res = await api.get('/api/me.php')
      user.value = res.data
      return true
    } catch {
      logout()
      return false
    } finally {
      ready.value = true
    }
  }

  return { token, user, ready, isAdmin, isLoggedIn, setToken, logout, fetchMe }
})
