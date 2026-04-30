import { reactive } from 'vue'
import api from '../api'

// Module-level cache — shared across all component instances
// null  = loading in progress
// false = fetch done, no image found
// string = image URL
const cache = reactive({})

export function usePreview() {
  function load(url) {
    if (!url || url in cache) return
    cache[url] = null
    api.get('/api/preview.php', { params: { url } })
      .then(res => { cache[url] = res.data.image || false })
      .catch(()  => { cache[url] = false })
  }

  // Call this in templates — auto-triggers load on first access
  function preview(url) {
    if (!url) return false
    if (!(url in cache)) load(url)
    return cache[url]
  }

  return { preview }
}
