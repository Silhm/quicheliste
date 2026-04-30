import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../../api', () => ({
  default: { get: vi.fn() },
}))

import api from '../../api'
import { useAuthStore } from '../../stores/auth'

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts with no token when localStorage is empty', () => {
    const auth = useAuthStore()
    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.ready).toBe(false)
  })

  it('reads token from localStorage on init', () => {
    localStorage.setItem('wishlist_token', 'existing-token')
    const auth = useAuthStore()
    expect(auth.token).toBe('existing-token')
  })

  describe('setToken', () => {
    it('sets token and persists to localStorage', () => {
      const auth = useAuthStore()
      auth.setToken('abc123')
      expect(auth.token).toBe('abc123')
      expect(localStorage.getItem('wishlist_token')).toBe('abc123')
    })
  })

  describe('logout', () => {
    it('clears token, user and localStorage', () => {
      const auth = useAuthStore()
      auth.setToken('abc123')
      auth.user = { id: '1', name: 'Simon', is_admin: true }
      auth.logout()
      expect(auth.token).toBeNull()
      expect(auth.user).toBeNull()
      expect(localStorage.getItem('wishlist_token')).toBeNull()
    })
  })

  describe('isAdmin', () => {
    it('returns true when user has is_admin flag', () => {
      const auth = useAuthStore()
      auth.user = { id: '1', name: 'Simon', is_admin: true }
      expect(auth.isAdmin).toBe(true)
    })

    it('returns false when user is not admin', () => {
      const auth = useAuthStore()
      auth.user = { id: '2', name: 'Marie', is_admin: false }
      expect(auth.isAdmin).toBe(false)
    })

    it('returns false when no user is set', () => {
      const auth = useAuthStore()
      expect(auth.isAdmin).toBe(false)
    })
  })

  describe('fetchMe', () => {
    it('returns false and marks ready without a token', async () => {
      const auth = useAuthStore()
      const result = await auth.fetchMe()
      expect(result).toBe(false)
      expect(auth.ready).toBe(true)
      expect(api.get).not.toHaveBeenCalled()
    })

    it('sets user and returns true on success', async () => {
      const mockUser = { id: '1', name: 'Simon', is_admin: true }
      api.get.mockResolvedValue({ data: mockUser })

      const auth = useAuthStore()
      auth.setToken('valid-token')
      const result = await auth.fetchMe()

      expect(result).toBe(true)
      expect(auth.user).toEqual(mockUser)
      expect(auth.ready).toBe(true)
    })

    it('logs out and returns false on API error', async () => {
      api.get.mockRejectedValue({ response: { status: 401 } })

      const auth = useAuthStore()
      auth.setToken('bad-token')
      const result = await auth.fetchMe()

      expect(result).toBe(false)
      expect(auth.token).toBeNull()
      expect(auth.ready).toBe(true)
    })
  })
})
