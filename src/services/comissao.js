import { api } from '@/services/http'

export const comissaoService = {
  listar: (mes, ano) => api.get('/comissao', { params: { mes, ano } }),

  graficoAnual: (ano) => api.get('/comissao/grafico-anual', { params: { ano } }),

  criar: (data) => api.post('/comissao', data),

  atualizar: (id, data) => api.put(`/comissao/${id}`, data),

  excluir: (id) => api.delete(`/comissao/${id}`),
}
