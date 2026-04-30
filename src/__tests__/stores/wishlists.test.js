import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('../../api', () => ({
  default: {
    get:    vi.fn(),
    post:   vi.fn(),
    put:    vi.fn(),
    delete: vi.fn(),
  },
}))

import api from '../../api'
import { useWishlistStore } from '../../stores/wishlists'

const makeWishlist = (overrides = {}) => ({
  id:          'wl1',
  owner_id:    'u1',
  owner_name:  'Simon',
  title:       'My Wishlist',
  description: '',
  share_token: 'share123',
  items:       [],
  item_count:  0,
  created_at:  '2026-04-30T00:00:00Z',
  ...overrides,
})

const makeItem = (overrides = {}) => ({
  id:          'i1',
  name:        'Nintendo Switch',
  price:       299,
  link:        'https://shop.com',
  description: '',
  category:    'Tech',
  sort_order:  1,
  reserved_by: null,
  ...overrides,
})

describe('wishlists store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('fetchAll', () => {
    it('populates list from API', async () => {
      api.get.mockResolvedValue({ data: [makeWishlist()] })
      const store = useWishlistStore()
      await store.fetchAll()
      expect(store.list).toHaveLength(1)
      expect(store.list[0].title).toBe('My Wishlist')
    })

    it('sets loading correctly during fetch', async () => {
      let resolve
      api.get.mockReturnValue(new Promise(r => { resolve = r }))
      const store = useWishlistStore()
      const promise = store.fetchAll()
      expect(store.loading).toBe(true)
      resolve({ data: [] })
      await promise
      expect(store.loading).toBe(false)
    })
  })

  describe('create', () => {
    it('adds wishlist to list and returns it', async () => {
      const wl = makeWishlist()
      api.post.mockResolvedValue({ data: wl })
      const store = useWishlistStore()
      const result = await store.create({ title: 'My Wishlist' })
      expect(store.list).toHaveLength(1)
      expect(result.id).toBe('wl1')
    })
  })

  describe('update', () => {
    it('updates matching wishlist in list', async () => {
      api.put.mockResolvedValue({ data: makeWishlist({ title: 'Updated' }) })
      const store = useWishlistStore()
      store.list    = [makeWishlist()]
      store.current = makeWishlist()
      await store.update('wl1', { title: 'Updated' })
      expect(store.list[0].title).toBe('Updated')
      expect(store.current.title).toBe('Updated')
    })
  })

  describe('remove', () => {
    it('removes wishlist from list', async () => {
      api.delete.mockResolvedValue({ data: { success: true } })
      const store = useWishlistStore()
      store.list = [makeWishlist()]
      await store.remove('wl1')
      expect(store.list).toHaveLength(0)
    })

    it('clears current if it was the deleted wishlist', async () => {
      api.delete.mockResolvedValue({ data: { success: true } })
      const store = useWishlistStore()
      store.list    = [makeWishlist()]
      store.current = makeWishlist()
      await store.remove('wl1')
      expect(store.current).toBeNull()
    })
  })

  describe('addItem', () => {
    it('appends item to current wishlist', async () => {
      const item = makeItem()
      api.post.mockResolvedValue({ data: item })
      const store = useWishlistStore()
      store.current = makeWishlist()
      store.list    = [makeWishlist()]
      await store.addItem('wl1', { name: 'Nintendo Switch', category: 'Tech' })
      expect(store.current.items).toHaveLength(1)
      expect(store.current.items[0].name).toBe('Nintendo Switch')
    })

    it('increments item_count in list', async () => {
      api.post.mockResolvedValue({ data: makeItem() })
      const store = useWishlistStore()
      store.current = makeWishlist()
      store.list    = [makeWishlist({ item_count: 0 })]
      await store.addItem('wl1', { name: 'Switch' })
      expect(store.list[0].item_count).toBe(1)
    })
  })

  describe('removeItem', () => {
    it('removes item from current wishlist', async () => {
      api.delete.mockResolvedValue({ data: { success: true } })
      const store = useWishlistStore()
      store.current = makeWishlist({ items: [makeItem()] })
      store.list    = [makeWishlist({ item_count: 1 })]
      await store.removeItem('wl1', 'i1')
      expect(store.current.items).toHaveLength(0)
    })

    it('decrements item_count in list', async () => {
      api.delete.mockResolvedValue({ data: { success: true } })
      const store = useWishlistStore()
      store.current = makeWishlist({ items: [makeItem()] })
      store.list    = [makeWishlist({ item_count: 1 })]
      await store.removeItem('wl1', 'i1')
      expect(store.list[0].item_count).toBe(0)
    })
  })

  describe('updateItem', () => {
    it('replaces item in current wishlist', async () => {
      const updated = makeItem({ name: 'Switch OLED' })
      api.put.mockResolvedValue({ data: updated })
      const store = useWishlistStore()
      store.current = makeWishlist({ items: [makeItem()] })
      await store.updateItem('wl1', 'i1', { name: 'Switch OLED' })
      expect(store.current.items[0].name).toBe('Switch OLED')
    })
  })
})
