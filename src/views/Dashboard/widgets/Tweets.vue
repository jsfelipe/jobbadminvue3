<template>
  <div>
    <h3 class="mb-3 text-base font-semibold text-gray-800 dark:text-white">
      {{ cardTitle }}
    </h3>
    <div class="max-h-[320px] overflow-y-auto">
      <ul v-if="posts.length" class="divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="(post, idx) in posts"
          :key="idx"
          class="py-3 first:pt-0"
        >
          <a
            :href="post.link"
            target="_blank"
            rel="noopener noreferrer"
            class="block hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg -m-1 p-1"
          >
            <p class="font-medium text-gray-900 dark:text-white line-clamp-2">
              {{ post.title }}
            </p>
            <p v-if="post.excerpt" class="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {{ post.excerpt }}
            </p>
            <p v-if="post.date" class="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {{ formatDate(post.date) }}
            </p>
          </a>
        </li>
      </ul>
      <p v-else-if="!loading" class="py-4 text-center text-sm text-gray-500">
        Nenhuma notícia no momento.
      </p>
      <p v-else class="py-4 text-center text-sm text-gray-500">
        Carregando...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiV2 } from '@/services/http'

const props = defineProps<{
  widget: { nome?: string; linkData?: string; [key: string]: unknown }
}>()

const cardTitle = computed(() => {
  const nome = props.widget?.nome
  return nome === 'Tweets' ? 'Novidades' : (nome || 'Novidades')
})

interface BlogPost {
  title: string
  excerpt: string
  link: string
  date: string | null
}

const posts = ref<BlogPost[]>([])
const loading = ref(true)

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

async function getData() {
  loading.value = true
  try {
    const r = await apiV2.get<{ data: BlogPost[] }>('/blog/latest-posts')
    posts.value = Array.isArray(r.data?.data) ? r.data.data : []
  } catch {
    // Blog/API fora do ar: não quebra o front, apenas não exibe notícias.
    posts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(getData)
watch(() => props.widget, getData, { deep: true })
</script>
