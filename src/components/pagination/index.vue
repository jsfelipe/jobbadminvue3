<template>
  <div class="flex justify-between items-center py-2 mt-5">
    <p style="font-size: 0.875rem;">
      Exibindo itens de {{ getItemStart }} a {{ getItemEnd }} | Total de {{ pagination.total }} itens
    </p>

    <el-pagination
      size="default"
      :current-page="pagination.currentPage"
      :page-size="Number(pagination.perPage)"
      :total="Number(pagination.total)"
      layout="sizes, prev, pager, next"
      background="true"
      :page-sizes="[10, 25, 100]"
      @current-change="handlePageChange"
      @size-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Definindo as propriedades esperadas no componente
const props = defineProps({
  pagination: {
    type: Object,
    required: true,
  },
  handlePageChange: {
    type: Function,
    required: true,
  },
  handleCurrentChange: {
    type: Function,
    required: true,
  }
})

// Calculando o início e fim dos itens a serem exibidos
const getItemStart = computed(() => {
  return (Number(props.pagination.currentPage) - 1) * Number(props.pagination.perPage) + 1
})

const getItemEnd = computed(() => {
  const end = Number(props.pagination.currentPage) * Number(props.pagination.perPage)
  return end > Number(props.pagination.total) ? Number(props.pagination.total) : end
})
</script>

<script>
export default {
  name: 'Pagination',
}
</script>

<style scoped></style>
