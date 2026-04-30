import axios from 'axios'

const api = axios.create()

api.interceptors.request.use(config => {
  const token = localStorage.getItem('wishlist_token')
  if (token) config.headers['X-Token'] = token
  return config
})

export default api
