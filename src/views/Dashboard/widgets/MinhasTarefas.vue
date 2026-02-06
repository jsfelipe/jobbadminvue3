<template>
  <div>
    <h3 class="mb-3 text-base font-semibold text-gray-800 dark:text-white">{{ widget?.nome }}</h3>
    <div class="max-h-[372px] overflow-y-auto">
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li v-for="(tarefa, idx) in tarefas" :key="idx" class="py-3">
          <p class="font-medium text-gray-900 dark:text-white">{{ tarefa.tituloProjeto }}</p>
          <div v-for="(row, i) in tarefa.tarefas" :key="i" class="ml-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span class="text-primary">{{ row.tarefa }}</span>
            <span class="ml-2 text-gray-500">{{ row.tempo }}</span>
          </div>
        </li>
      </ul>
      <p v-if="!tarefas.length" class="py-4 text-center text-sm text-gray-500">Nenhuma tarefa</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { api } from '@/services/http'

const props = defineProps<{
  widget: { nome?: string; linkData?: string; [key: string]: unknown }
}>()

const tarefas = ref<{ tituloProjeto?: string; tarefas?: { tarefa?: string; tempo?: string }[] }[]>([])

async function getData() {
  if (!props.widget?.linkData) return
  try {
    const r = await api.get(props.widget.linkData)
    tarefas.value = Array.isArray(r.data?.data) ? r.data.data : []
  } catch {
    tarefas.value = []
  }
}

onMounted(getData)
watch(() => props.widget?.linkData, getData)
</script>
