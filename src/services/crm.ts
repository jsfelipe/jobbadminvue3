import { api } from './http'
import type {
  CriarLeadPayload,
  CrmAtendimento,
  CrmAtendimentoRegistrado,
  CrmCasoRaw,
  CrmContadores,
  CrmFilasContagensResponse,
  CrmFilasResponse,
  CrmUsuariosClienteResponse,
  TipoFila,
  CrmLead,
  CrmLeadImportProgress,
  CrmLeadImportStart,
  CrmLeadMetas,
  HistoricoFiltro,
  CrmRelatorio,
  CrmRelatorioFiltro,
  LeadsFiltro,
  OrigemLead,
  Paginated,
  ProdutoLead,
  RegistrarContatoPayload,
} from '@/views/Crm/model/crm.types'

export const crmService = {
  async filas(tipo?: TipoFila): Promise<CrmFilasResponse> {
    const { data } = await api.get<CrmFilasResponse>('/crm/filas', {
      params: tipo ? { tipo } : undefined,
    })
    return data
  },
  async filasContagens(fresh = false): Promise<CrmFilasContagensResponse> {
    const { data } = await api.get<CrmFilasContagensResponse>('/crm/filas/contagens', {
      params: fresh ? { fresh: 1 } : undefined,
    })
    return data
  },
  async contadores(): Promise<CrmContadores> {
    const { data } = await api.get<CrmContadores>('/crm/contadores')
    return data
  },
  async registrar(payload: RegistrarContatoPayload): Promise<CrmAtendimentoRegistrado> {
    const { data } = await api.post<CrmAtendimentoRegistrado>('/crm/atendimentos', payload)
    return data
  },
  async reabrirCaso(idCaso: number): Promise<CrmCasoRaw> {
    const { data } = await api.post<CrmCasoRaw>(`/crm/casos/${idCaso}/reabrir`)
    return data
  },
  async historico(params: HistoricoFiltro): Promise<Paginated<CrmAtendimento>> {
    const { data } = await api.get<Paginated<CrmAtendimento>>('/crm/atendimentos', { params })
    return data
  },
  async historicoCliente(idCliente: number): Promise<CrmAtendimento[]> {
    const { data } = await api.get<CrmAtendimento[]>(`/crm/clientes/${idCliente}/historico`)
    return data
  },
  async usuariosCliente(idCliente: number): Promise<CrmUsuariosClienteResponse> {
    const { data } = await api.get<CrmUsuariosClienteResponse>(`/crm/clientes/${idCliente}/usuarios`)
    return data
  },
  async leadsMetas(): Promise<CrmLeadMetas> {
    const { data } = await api.get<CrmLeadMetas>('/crm/leads/metas')
    return data
  },
  async leadsListar(params: LeadsFiltro): Promise<Paginated<CrmLead>> {
    const { data } = await api.get<Paginated<CrmLead>>('/crm/leads', { params })
    return data
  },
  async leadsCriar(payload: CriarLeadPayload): Promise<CrmLead> {
    const { data } = await api.post<CrmLead>('/crm/leads', payload)
    return data
  },
  async leadsAtualizar(id: number, payload: CriarLeadPayload): Promise<CrmLead> {
    const { data } = await api.put<CrmLead>(`/crm/leads/${id}`, payload)
    return data
  },
  async leadsImportar(params: {
    arquivo: File
    produto: ProdutoLead
    origem: OrigemLead
  }): Promise<CrmLeadImportStart> {
    const fd = new FormData()
    fd.append('arquivo', params.arquivo)
    fd.append('produto', params.produto)
    fd.append('origem', params.origem)
    const { data } = await api.post<CrmLeadImportStart>('/crm/leads/import', fd)
    return data
  },
  async leadsImportProgress(jobId: string): Promise<CrmLeadImportProgress> {
    const { data } = await api.get<CrmLeadImportProgress>(`/crm/leads/import/${jobId}/progress`)
    return data
  },
  async relatorio(params: CrmRelatorioFiltro): Promise<CrmRelatorio> {
    const { data } = await api.get<CrmRelatorio>('/crm/relatorios', { params })
    return data
  },
}
