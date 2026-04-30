import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/register', component: () => import('../views/Register.vue') },
    { path: '/', component: () => import('../views/Home.vue'), meta: { requiresAuth: true } },
    { path: '/wishlist/:id', component: () => import('../views/WishlistDetail.vue'), meta: { requiresAuth: true } },
    { path: '/share/:shareToken', component: () => import('../views/ShareView.vue') },
    { path: '/admin', component: () => import('../views/Admin.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
  ]
})

export async function navigationGuard(to) {
  // Capture token from URL query param (first visit after registration)
  const urlParams = new URLSearchParams(window.location.search)
  const urlToken  = urlParams.get('token')
  if (urlToken) {
    const auth = useAuthStore()
    auth.setToken(urlToken)
    window.history.replaceState({}, '', window.location.pathname)
  }

  const auth = useAuthStore()

  // Initialize user on first navigation
  if (!auth.ready) await auth.fetchMe()

  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/register'
  if (to.meta.requiresAdmin && !auth.isAdmin)   return '/'
  if (to.path === '/register' && auth.isLoggedIn) return '/'
}

router.beforeEach(navigationGuard)

export default router
