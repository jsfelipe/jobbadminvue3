<template>
  <div class="space-y-1.5">
    <div
      class="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900/50"
    >
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-sm font-bold text-gray-800 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
        :disabled="disabled"
        title="Negrito"
        @mousedown.prevent
        @click="wrapBold"
      >
        B
      </button>
      <button
        type="button"
        class="inline-flex h-8 w-8 items-center justify-center rounded border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        :disabled="disabled"
        title="Inserir link"
        @mousedown.prevent
        @click="wrapLink"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      </button>
    </div>
    <textarea
      ref="taRef"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      class="w-full rounded-b-lg rounded-t-none border border-gray-300 p-3 text-sm disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:disabled:bg-gray-900"
      rows="4"
      @input="onInput"
      @paste="emit('paste', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    disabled?: boolean
    placeholder?: string
  }>(),
  { disabled: false, placeholder: '' }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  paste: [e: ClipboardEvent]
}>()

const taRef = ref<HTMLTextAreaElement | null>(null)

const escAttr = (u: string) =>
  u.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const onInput = (e: Event) => {
  const t = e.target as HTMLTextAreaElement
  emit('update:modelValue', t.value)
}

const wrapBold = () => {
  const ta = taRef.value
  if (!ta || props.disabled) return
  const s = ta.selectionStart
  const e = ta.selectionEnd
  const v = props.modelValue
  const sel = v.slice(s, e)
  const inserted = `<strong>${sel}</strong>`
  const next = v.slice(0, s) + inserted + v.slice(e)
  emit('update:modelValue', next)
  const pos = s + inserted.length
  void nextTick(() => {
    ta.focus()
    ta.setSelectionRange(pos, pos)
  })
}

const wrapLink = () => {
  const ta = taRef.value
  if (!ta || props.disabled) return
  const raw = window.prompt('URL do link (https://...)')
  if (raw === null) return
  let url = raw.trim()
  if (url === '') return
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  const s = ta.selectionStart
  const e = ta.selectionEnd
  const v = props.modelValue
  const sel = v.slice(s, e)
  const label = sel || url
  const href = escAttr(url)
  const inserted = `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`
  const next = v.slice(0, s) + inserted + v.slice(e)
  emit('update:modelValue', next)
  const pos = s + inserted.length
  void nextTick(() => {
    ta.focus()
    ta.setSelectionRange(pos, pos)
  })
}
</script>
