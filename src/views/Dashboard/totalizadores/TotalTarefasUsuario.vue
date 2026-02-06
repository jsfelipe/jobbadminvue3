<template>
  <div class="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
      <i class="fas fa-tasks text-2xl" />
    </div>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-medium text-gray-600 dark:text-gray-400">{{ widget?.nome }}</p>
      <p class="mt-0.5 text-lg font-semibold text-gray-900 dark:text-white">{{ totalTarefas }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/http'

const props = defineProps<{
  widget: { linkData?: string; nome?: string; icone?: string; [key: string]: unknown }
}>()

const responseData = ref<{ totalTarefas?: number }>({})

const totalTarefas = computed(() => responseData.value?.totalTarefas ?? 0)

onMounted(async () => {
  if (!props.widget?.linkData) return
  try {
    const r = await api.get(props.widget.linkData)
    responseData.value = r.data?.data ?? r.data ?? {}
  } catch {
    responseData.value = {}
  }
})
</script>
