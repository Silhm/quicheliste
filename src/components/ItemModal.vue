<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h3 class="text-lg font-bold text-slate-800 mb-5">{{ item ? 'Edit item' : 'Add a gift idea' }}</h3>

      <form @submit.prevent="submit">
        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Name <span class="text-red-400">*</span></label>
          <input
            v-model="form.name"
            placeholder="e.g. Nintendo Switch"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autofocus
          />
        </div>

        <!-- Category -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <input
            v-model="form.category"
            list="categories"
            placeholder="e.g. Tech, Books, Clothing…"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <datalist id="categories">
            <option v-for="cat in existingCategories" :key="cat" :value="cat" />
          </datalist>
        </div>

        <!-- Price -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Price (€)</label>
          <input
            v-model="form.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 29.99"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <!-- Link -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">Link</label>
          <input
            v-model="form.link"
            type="url"
            placeholder="https://…"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-1">Note</label>
          <textarea
            v-model="form.description"
            placeholder="Size, colour, any detail that helps…"
            rows="3"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div class="flex gap-3">
          <button type="button" @click="$emit('close')" class="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" :disabled="!form.name.trim()" class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition">
            {{ item ? 'Save changes' : 'Add item' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  item: { type: Object, default: null },
  existingCategories: { type: Array, default: () => [] },
})
const emit = defineEmits(['save', 'close'])

const form = reactive({ name: '', category: '', price: '', link: '', description: '' })

watch(() => props.item, (val) => {
  form.name        = val?.name        ?? ''
  form.category    = val?.category    ?? ''
  form.price       = val?.price != null ? String(val.price) : ''
  form.link        = val?.link        ?? ''
  form.description = val?.description ?? ''
}, { immediate: true })

function submit() {
  if (!form.name.trim()) return
  emit('save', {
    name:        form.name.trim(),
    category:    form.category.trim() || 'General',
    price:       form.price !== '' ? parseFloat(form.price) : null,
    link:        form.link.trim(),
    description: form.description.trim(),
  })
}
</script>
