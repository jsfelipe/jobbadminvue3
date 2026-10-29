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
import type {
  PesquisaListFiltro,
  PesquisaResposta,
  PesquisaResumo,
} from '@/views/Crm/model/pesquisa.types'
import type {
  EtapaPayload,
  Funil,
  FunilPayload,
  Oportunidade,
  OportunidadeFiltro,
  OportunidadeLista,
  OportunidadeMeta,
  OportunidadePayload,
  OportunidadeDetalhe,
  OportunidadePainel,
  OportunidadeEvento,
  MensagemModelo,
  MensagemModeloGestao,
  MensagemModeloPayload,
  WhatsappLinha,
  ReordenarColuna,
  UsuarioAdmin,
} from '@/views/Crm/model/oportunidade.types'

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
  async pesquisaResumo(params: { data_inicio?: string; data_fim?: string }): Promise<PesquisaResumo> {
    const { data } = await api.get<PesquisaResumo>('/crm/pesquisas/resumo', { params })
    return data
  },
  async pesquisasListar(params: PesquisaListFiltro): Promise<Paginated<PesquisaResposta>> {
    const { data } = await api.get<Paginated<PesquisaResposta>>('/crm/pesquisas', { params })
    return data
  },
  async pesquisaDetalhe(id: number): Promise<PesquisaResposta> {
    const { data } = await api.get<PesquisaResposta>(`/crm/pesquisas/${id}`)
    return data
  },
  async oportunidadeMeta(): Promise<OportunidadeMeta> {
    const { data } = await api.get<OportunidadeMeta>('/crm/oportunidades/meta')
    return data
  },
  async funisListar(): Promise<Funil[]> {
    const { data } = await api.get<Funil[]>('/crm/funis')
    return data
  },
  async funilCriar(payload: FunilPayload): Promise<Funil> {
    const { data } = await api.post<Funil>('/crm/funis', payload)
    return data
  },
  async funilAtualizar(id: number, payload: FunilPayload): Promise<Funil> {
    const { data } = await api.put<Funil>(`/crm/funis/${id}`, payload)
    return data
  },
  async funilExcluir(id: number): Promise<void> {
    await api.delete(`/crm/funis/${id}`)
  },
  async etapaCriar(idFunil: number, payload: EtapaPayload): Promise<Funil> {
    const { data } = await api.post<Funil>(`/crm/funis/${idFunil}/etapas`, payload)
    return data
  },
  async etapaAtualizar(idFunil: number, idEtapa: number, payload: EtapaPayload): Promise<Funil> {
    const { data } = await api.put<Funil>(`/crm/funis/${idFunil}/etapas/${idEtapa}`, payload)
    return data
  },
  async etapaExcluir(idFunil: number, idEtapa: number): Promise<Funil> {
    const { data } = await api.delete<Funil>(`/crm/funis/${idFunil}/etapas/${idEtapa}`)
    return data
  },
  async etapasReordenar(idFunil: number, ids: number[]): Promise<Funil> {
    const { data } = await api.put<Funil>(`/crm/funis/${idFunil}/etapas/reordenar`, { ids })
    return data
  },
  async oportunidadesListar(params: OportunidadeFiltro): Promise<OportunidadeLista> {
    const { data } = await api.get<OportunidadeLista>('/crm/oportunidades', { params })
    return data
  },
  async oportunidadeCriar(payload: OportunidadePayload): Promise<Oportunidade> {
    const { data } = await api.post<Oportunidade>('/crm/oportunidades', payload)
    return data
  },
  async oportunidadeObter(id: number): Promise<OportunidadeDetalhe> {
    const { data } = await api.get<OportunidadeDetalhe>(`/crm/oportunidades/${id}`)
    return data
  },
  async oportunidadePainel(id: number): Promise<OportunidadePainel> {
    const { data } = await api.get<OportunidadePainel>(`/crm/oportunidades/${id}/painel`)
    return data
  },
  async oportunidadeNota(id: number, texto: string): Promise<OportunidadeEvento> {
    const { data } = await api.post<OportunidadeEvento>(`/crm/oportunidades/${id}/notas`, { texto })
    return data
  },
  async oportunidadeNotaAtualizar(id: number, idNota: number, texto: string): Promise<OportunidadeEvento> {
    const { data } = await api.put<OportunidadeEvento>(`/crm/oportunidades/${id}/notas/${idNota}`, { texto })
    return data
  },
  async oportunidadeNotaExcluir(id: number, idNota: number): Promise<void> {
    await api.delete(`/crm/oportunidades/${id}/notas/${idNota}`)
  },
  async oportunidadeTarefa(id: number, titulo: string, texto: string, prazo: string): Promise<OportunidadeEvento> {
    const { data } = await api.post<OportunidadeEvento>(`/crm/oportunidades/${id}/tarefas`, { titulo, texto, prazo })
    return data
  },
  async mensagensModelo(): Promise<MensagemModelo[]> {
    const { data } = await api.get<MensagemModelo[]>('/crm/mensagens-modelo')
    return Array.isArray(data) ? data : []
  },
  async mensagensModeloGestao(): Promise<MensagemModeloGestao> {
    const { data } = await api.get<MensagemModeloGestao>('/crm/mensagens-modelo/gestao')
    return {
      temas: data && data.temas ? data.temas : {},
      modelos: data && Array.isArray(data.modelos) ? data.modelos : [],
    }
  },
  async mensagemModeloCriar(payload: MensagemModeloPayload): Promise<MensagemModelo> {
    const { data } = await api.post<MensagemModelo>('/crm/mensagens-modelo', payload)
    return data
  },
  async mensagemModeloAtualizar(id: number, payload: MensagemModeloPayload): Promise<MensagemModelo> {
    const { data } = await api.put<MensagemModelo>(`/crm/mensagens-modelo/${id}`, payload)
    return data
  },
  async mensagemModeloExcluir(id: number): Promise<void> {
    await api.delete(`/crm/mensagens-modelo/${id}`)
  },
  async whatsappLinhas(): Promise<WhatsappLinha[]> {
    const { data } = await api.get<WhatsappLinha[]>('/crm/whatsapp-linhas')
    return Array.isArray(data) ? data : []
  },
  async oportunidadeWhatsapp(id: number, texto: string, linha: string): Promise<OportunidadeEvento> {
    const { data } = await api.post<OportunidadeEvento>(`/crm/oportunidades/${id}/whatsapp`, { texto, linha })
    return data
  },
  async oportunidadeAtualizar(id: number, payload: OportunidadePayload): Promise<Oportunidade> {
    const { data } = await api.put<Oportunidade>(`/crm/oportunidades/${id}`, payload)
    return data
  },
  async oportunidadesReordenar(colunas: ReordenarColuna[], motivoPerda?: string | null): Promise<void> {
    await api.post('/crm/oportunidades/reordenar', {
      colunas,
      motivo_perda: motivoPerda || null,
    })
  },
  async usuariosAdmin(): Promise<UsuarioAdmin[]> {
    const { data } = await api.get<UsuarioAdmin[]>('/users')
    return data
  },
}
