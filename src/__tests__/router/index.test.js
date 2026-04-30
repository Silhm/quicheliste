import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../../stores/auth'

vi.mock('../../api', () => ({
  default: { get: vi.fn() },
}))

import api from '../../api'
import { navigationGuard } from '../../router'

const loggedInUser = { id: '1', name: 'Simon', is_admin: false }
const adminUser    = { id: '1', name: 'Simon', is_admin: true }

const route = (path, meta = {}) => ({ path, meta })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('navigationGuard', () => {
  describe('unauthenticated user', () => {
    it('redirects to /register when visiting a protected route', async () => {
      const result = await navigationGuard(route('/', { requiresAuth: true }))
      expect(result).toBe('/register')
    })

    it('redirects to /register when visiting /wishlist/:id', async () => {
      const result = await navigationGuard(route('/wishlist/abc', { requiresAuth: true }))
      expect(result).toBe('/register')
    })

    it('allows access to /share/:token without auth', async () => {
      const result = await navigationGuard(route('/share/tok123'))
      expect(result).toBeUndefined()
    })
  })

  describe('authenticated user', () => {
    beforeEach(() => {
      const auth = useAuthStore()
      auth.setToken('tok123')
      auth.user  = loggedInUser
      auth.ready = true
    })

    it('redirects from /register to / — prevents the broken-link bug', async () => {
      const result = await navigationGuard(route('/register'))
      expect(result).toBe('/')
    })

    it('allows access to / when logged in', async () => {
      const result = await navigationGuard(route('/', { requiresAuth: true }))
      expect(result).toBeUndefined()
    })

    it('allows access to /wishlist/:id when logged in', async () => {
      const result = await navigationGuard(route('/wishlist/abc', { requiresAuth: true }))
      expect(result).toBeUndefined()
    })

    it('redirects non-admin away from /admin', async () => {
      const result = await navigationGuard(route('/admin', { requiresAuth: true, requiresAdmin: true }))
      expect(result).toBe('/')
    })
  })

  describe('admin user', () => {
    beforeEach(() => {
      const auth = useAuthStore()
      auth.setToken('tok-admin')
      auth.user  = adminUser
      auth.ready = true
    })

    it('allows access to /admin', async () => {
      const result = await navigationGuard(route('/admin', { requiresAuth: true, requiresAdmin: true }))
      expect(result).toBeUndefined()
    })
  })

  describe('token capture from URL', () => {
    it('saves token from ?token= query param to the auth store', async () => {
      window.history.pushState({}, '', '/?token=url-token-xyz')
      const auth = useAuthStore()
      auth.ready = true // skip fetchMe

      await navigationGuard(route('/'))
      expect(auth.token).toBe('url-token-xyz')
      expect(localStorage.getItem('wishlist_token')).toBe('url-token-xyz')
    })

    it('removes the token from the URL after capturing it', async () => {
      window.history.pushState({}, '', '/?token=url-token-xyz')
      const auth = useAuthStore()
      auth.ready = true

      await navigationGuard(route('/'))
      expect(window.location.search).toBe('')
    })
  })

  describe('first navigation (auth not yet initialised)', () => {
    it('calls fetchMe when auth is not ready', async () => {
      api.get.mockResolvedValue({ data: loggedInUser })
      const auth = useAuthStore()
      auth.setToken('tok123')
      // auth.ready is false by default

      await navigationGuard(route('/', { requiresAuth: true }))
      expect(api.get).toHaveBeenCalledTimes(1)
      expect(auth.ready).toBe(true)
    })
  })
})
