import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import ItemModal from '../../components/ItemModal.vue'
import { globalPlugins } from '../test-utils'

const mountModal = (props = {}) =>
  mount(ItemModal, {
    props: { item: null, existingCategories: [], ...props },
    global: globalPlugins,
  })

describe('ItemModal', () => {
  describe('title', () => {
    it('shows "Add a gift idea" when no item is provided', () => {
      const wrapper = mountModal()
      expect(wrapper.text()).toContain('Add a gift idea')
    })

    it('shows "Edit item" when an item is provided', () => {
      const wrapper = mountModal({
        item: { name: 'Switch', category: 'Tech', price: 299, link: '', description: '' },
      })
      expect(wrapper.text()).toContain('Edit item')
    })
  })

  describe('submit button', () => {
    it('is disabled when name is empty', () => {
      const wrapper = mountModal()
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    })

    it('is enabled after typing a name', async () => {
      const wrapper = mountModal()
      await wrapper.find('input').setValue('Nintendo Switch')
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
    })
  })

  describe('form submission', () => {
    it('emits save with trimmed name and default category', async () => {
      const wrapper = mountModal()
      await wrapper.find('input').setValue('  Nintendo Switch  ')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('save')).toBeTruthy()
      expect(wrapper.emitted('save')[0][0]).toMatchObject({
        name:     'Nintendo Switch',
        category: 'General',
      })
    })

    it('emits save with provided category', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input')
      await inputs[0].setValue('Switch')   // name
      await inputs[1].setValue('Gaming')   // category
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('save')[0][0].category).toBe('Gaming')
    })

    it('emits save with null price when price field is empty', async () => {
      const wrapper = mountModal()
      await wrapper.find('input').setValue('Book')
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('save')[0][0].price).toBeNull()
    })

    it('parses price as a float', async () => {
      const wrapper = mountModal()
      const inputs = wrapper.findAll('input')
      await inputs[0].setValue('Book')
      await inputs[2].setValue('14.99')   // price
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('save')[0][0].price).toBe(14.99)
    })

    it('does not emit save when name is empty', async () => {
      const wrapper = mountModal()
      await wrapper.find('form').trigger('submit')
      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })

  describe('pre-fill when editing', () => {
    const item = { name: 'Switch', category: 'Tech', price: 299, link: 'https://shop.com', description: 'Great gift' }

    it('pre-fills the name field', () => {
      const wrapper = mountModal({ item })
      expect(wrapper.findAll('input')[0].element.value).toBe('Switch')
    })

    it('pre-fills the category field', () => {
      const wrapper = mountModal({ item })
      expect(wrapper.findAll('input')[1].element.value).toBe('Tech')
    })

    it('pre-fills the price field', () => {
      const wrapper = mountModal({ item })
      expect(wrapper.findAll('input')[2].element.value).toBe('299')
    })
  })

  describe('cancel button', () => {
    it('emits close when clicked', async () => {
      const wrapper = mountModal()
      await wrapper.find('button[type="button"]').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('backdrop click', () => {
    it('emits close when clicking the backdrop', async () => {
      const wrapper = mountModal()
      await wrapper.find('div.fixed').trigger('click')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
})
