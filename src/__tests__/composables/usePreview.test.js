import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'

vi.mock('../../api', () => ({
  default: { get: vi.fn() },
}))

import api from '../../api'
import { usePreview, _clearCache } from '../../composables/usePreview'

beforeEach(() => {
  _clearCache()
  vi.clearAllMocks()
})

describe('usePreview', () => {
  it('returns false for empty or null url', () => {
    const { preview } = usePreview()
    expect(preview('')).toBe(false)
    expect(preview(null)).toBe(false)
    expect(api.get).not.toHaveBeenCalled()
  })

  it('returns null (loading) on first call for a new url', () => {
    api.get.mockReturnValue(new Promise(() => {})) // never resolves
    const { preview } = usePreview()
    expect(preview('https://example.com')).toBeNull()
  })

  it('triggers a single API call on first access', async () => {
    api.get.mockResolvedValue({ data: { image: null } })
    const { preview } = usePreview()
    preview('https://example.com')
    await flushPromises()
    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledWith('/api/preview.php', {
      params: { url: 'https://example.com' },
    })
  })

  it('returns the image URL after the fetch resolves', async () => {
    api.get.mockResolvedValue({ data: { image: 'https://example.com/og.jpg' } })
    const { preview } = usePreview()
    preview('https://example.com')
    await flushPromises()
    expect(preview('https://example.com')).toBe('https://example.com/og.jpg')
  })

  it('returns false when the API returns no image', async () => {
    api.get.mockResolvedValue({ data: { image: null } })
    const { preview } = usePreview()
    preview('https://no-og.com')
    await flushPromises()
    expect(preview('https://no-og.com')).toBe(false)
  })

  it('returns false when the API call fails', async () => {
    api.get.mockRejectedValue(new Error('Network error'))
    const { preview } = usePreview()
    preview('https://broken.com')
    await flushPromises()
    expect(preview('https://broken.com')).toBe(false)
  })

  it('does not re-fetch a cached url', async () => {
    api.get.mockResolvedValue({ data: { image: 'https://img.jpg' } })
    const { preview } = usePreview()
    preview('https://example.com')
    await flushPromises()
    preview('https://example.com') // second call — should use cache
    preview('https://example.com') // third call
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('caches results across multiple usePreview() instances', async () => {
    api.get.mockResolvedValue({ data: { image: 'https://img.jpg' } })
    const { preview: p1 } = usePreview()
    const { preview: p2 } = usePreview()
    p1('https://shared.com')
    await flushPromises()
    // p2 reads from the shared module-level cache
    expect(p2('https://shared.com')).toBe('https://img.jpg')
    expect(api.get).toHaveBeenCalledTimes(1)
  })
})
