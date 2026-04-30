import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import Register from '../../views/Register.vue'
import { globalPlugins } from '../test-utils'

vi.mock('../../api', () => ({
  default: { post: vi.fn() },
}))

import api from '../../api'

// Minimal router — no guards, just the routes needed by the component
const testRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/',         component: { template: '<div/>' } },
    { path: '/register', component: Register },
  ],
})

const mountRegister = () =>
  mount(Register, {
    global: { plugins: [...globalPlugins.plugins, testRouter] },
    attachTo: document.body,
  })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('Register view', () => {
  describe('step 1 — name form', () => {
    it('shows the name input and submit button', () => {
      const wrapper = mountRegister()
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('submit button is disabled while name is empty', () => {
      const wrapper = mountRegister()
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    })

    it('submit button is enabled after typing a name', async () => {
      const wrapper = mountRegister()
      await wrapper.find('input[type="text"]').setValue('Simon')
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
    })

    it('shows an error message when the API fails', async () => {
      api.post.mockRejectedValue({ response: { data: { error: 'Server error' } } })
      const wrapper = mountRegister()
      await wrapper.find('input').setValue('Simon')
      await wrapper.find('form').trigger('submit')
      await flushPromises()
      expect(wrapper.text()).toContain('Server error')
    })
  })

  describe('step 2 — access link', () => {
    beforeEach(() => {
      api.post.mockResolvedValue({
        data: { token: 'tok-abc123', user: { id: '1', name: 'Simon', is_admin: false } },
      })
    })

    it('hides the form and shows greeting after successful registration', async () => {
      const wrapper = mountRegister()
      await wrapper.find('input').setValue('Simon')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.find('form').exists()).toBe(false)
      expect(wrapper.text()).toContain('Simon')
    })

    it('access link uses site root — never the current pathname', async () => {
      const wrapper = mountRegister()
      await wrapper.find('input').setValue('Simon')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      const link = wrapper.find('input[readonly]').element.value
      // Must point to origin + '/'
      expect(link).toBe(`${window.location.origin}/?token=tok-abc123`)
      // Must never contain '/register' (this was the bug)
      expect(link).not.toContain('/register')
    })

    it('copy button copies the link to clipboard', async () => {
      const writeMock = vi.fn().mockResolvedValue(undefined)
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeMock },
        writable: true,
      })

      const wrapper = mountRegister()
      await wrapper.find('input').setValue('Simon')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      await wrapper.find('button.bg-indigo-600').trigger('click')
      expect(writeMock).toHaveBeenCalledWith(`${window.location.origin}/?token=tok-abc123`)
    })
  })
})
