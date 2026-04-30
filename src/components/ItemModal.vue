<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
      <h3 class="text-lg font-bold text-slate-800 mb-5">{{ item ? t('modal.editTitle') : t('modal.addTitle') }}</h3>

      <form @submit.prevent="submit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('modal.name') }} <span class="text-red-400">*</span></label>
          <input
            v-model="form.name"
            :placeholder="t('modal.name')"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autofocus
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('modal.category') }}</label>
          <input
            v-model="form.category"
            list="categories"
            :placeholder="t('modal.categoryPlaceholder')"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <datalist id="categories">
            <option v-for="cat in existingCategories" :key="cat" :value="cat" />
          </datalist>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('modal.price') }}</label>
          <input
            v-model="form.price"
            type="number"
            min="0"
            step="0.01"
            :placeholder="t('modal.pricePlaceholder')"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('modal.link') }}</label>
          <input
            v-model="form.link"
            type="url"
            :placeholder="t('modal.linkPlaceholder')"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ t('modal.note') }}</label>
          <textarea
            v-model="form.description"
            :placeholder="t('modal.notePlaceholder')"
            rows="3"
            class="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>

        <div class="flex gap-3">
          <button type="button" @click="$emit('close')" class="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition">{{ t('common.cancel') }}</button>
          <button type="submit" :disabled="!form.name.trim()" class="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition">
            {{ item ? t('modal.saveButton') : t('modal.addButton') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  item: { type: Object, default: null },
  existingCategories: { type: Array, default: () => [] },
})
const emit = defineEmits(['save', 'close'])
const { t } = useI18n()

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
