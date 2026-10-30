import { api } from './http'
import type {
  FiltroTarefa,
  OportunidadeBusca,
  Tarefa,
  TarefaLista,
  TarefaPayload,
  TarefaTipo,
} from '@/views/Crm/model/tarefa.types'

export const crmTarefaService = {
  async tipos(): Promise<TarefaTipo[]> {
    const { data } = await api.get<TarefaTipo[]>('/crm/tarefa-tipos')
    return data
  },
  async listar(params: { filtro: FiltroTarefa; q: string; page: number; per_page: number }): Promise<TarefaLista> {
    const { data } = await api.get<TarefaLista>('/crm/tarefas', { params })
    return data
  },
  async criar(payload: TarefaPayload): Promise<Tarefa> {
    const { data } = await api.post<Tarefa>('/crm/tarefas', payload)
    return data
  },
  async atualizar(id: number, payload: Partial<TarefaPayload>): Promise<Tarefa> {
    const { data } = await api.put<Tarefa>(`/crm/tarefas/${id}`, payload)
    return data
  },
  async buscarOportunidades(q: string): Promise<OportunidadeBusca[]> {
    const { data } = await api.get<OportunidadeBusca[]>('/crm/tarefas/oportunidades', { params: { q } })
    return data
  },
}
