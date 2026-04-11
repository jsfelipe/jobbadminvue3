<template>
  <div class="mt-2 space-y-2">
    <div class="flex flex-wrap items-center gap-2">
      <el-upload
        :http-request="handleRequest"
        :show-file-list="false"
        :limit="maxFiles"
        multiple
        accept=".pdf,.png,.jpg,.jpeg,.webp,image/jpeg,image/png,image/webp,application/pdf"
      >
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
          title="Anexar arquivo"
          aria-label="Anexar arquivo"
        >
          <Paperclip class="h-4 w-4" aria-hidden="true" />
        </button>
      </el-upload>
      <span class="text-xs text-gray-500">Até {{ maxFiles }} arquivos (5 MB cada). JPEG, PNG, WebP, PDF.</span>
    </div>
    <ul v-if="modelValue.length" class="space-y-1 text-sm text-gray-700">
      <li v-for="(f, i) in modelValue" :key="i" class="flex items-center justify-between gap-2 rounded border border-gray-100 bg-gray-50 px-2 py-1">
        <span class="truncate">{{ f.name }}</span>
        <button type="button" class="shrink-0 text-red-600 hover:underline" @click="remove(i)">Remover</button>
      </li>
    </ul>
    <p class="text-xs text-gray-500">Na descrição: <kbd class="rounded bg-gray-200 px-1">Ctrl</kbd>+<kbd class="rounded bg-gray-200 px-1">V</kbd> para colar captura de tela.</p>
  </div>
</template>

<script setup lang="ts">
import { Paperclip } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'

const maxFiles = 10
const maxBytes = 5 * 1024 * 1024
const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

const props = defineProps<{
  modelValue: File[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: File[]): void
}>()

function validateFile(f: File): string | null {
  if (f.size > maxBytes) {
    return 'Arquivo acima de 5 MB'
  }
  if (allowedMime.indexOf(f.type) === -1) {
    return 'Tipo não permitido (JPEG, PNG, WebP, PDF)'
  }
  return null
}

function queueFiles(files: File[]) {
  const next = [...props.modelValue]
  for (const f of files) {
    if (next.length >= maxFiles) {
      ElMessage.warning('Máximo de 10 anexos')
      break
    }
    const err = validateFile(f)
    if (err) {
      ElMessage.warning(`${f.name}: ${err}`)
      continue
    }
    next.push(f)
  }
  emit('update:modelValue', next)
}

function handleRequest(opt: {
  file: File
  onSuccess?: (body?: unknown) => void
  onError?: (err: Error) => void
}) {
  const f = opt.file
  const err = validateFile(f)
  if (err) {
    ElMessage.warning(err)
    opt.onError?.(new Error(err) as never)
    return
  }
  if (props.modelValue.length >= maxFiles) {
    ElMessage.warning('Máximo de 10 anexos')
    opt.onError?.(new Error('limit') as never)
    return
  }
  queueFiles([f])
  opt.onSuccess?.({})
}

function remove(i: number) {
  const n = [...props.modelValue]
  n.splice(i, 1)
  emit('update:modelValue', n)
}

function addFiles(files: File[]) {
  queueFiles(files)
}

defineExpose({ addFiles })
</script>
