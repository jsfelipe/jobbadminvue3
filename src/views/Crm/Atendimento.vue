<template>
  <admin-layout>
    <div class="space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">CRM - Atendimento diário</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            <template v-if="abaAtiva === 'novas_leads'">
              Meta diária em dias úteis: 10 JobbLive, 10 JobbVideo, 5 LinkedIn. Débito acumula até zerar.
            </template>
            <template v-else>
              Após o contato o cliente fica em "Aguardando retorno" por {{ prazoDiasUteis }} dias úteis. Sem resposta, volta
              para Pendentes com a tag "Sem retorno".
            </template>
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <router-link
            v-if="isAdmin"
            to="/admin/crm/relatorios"
            class="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
            title="Relatórios CRM"
          >
            <PieChartIcon class="h-4 w-4" />
            Relatórios
          </router-link>
          <button
            type="button"
            class="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            :disabled="carregando"
            @click="carregarTudo(true)"
          >
            {{ carregando ? 'Atualizando...' : 'Atualizar' }}
          </button>
        </div>
      </div>

      <p
        v-if="erro"
        class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
      >
        {{ erro }}
      </p>

      <div class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 pt-3 dark:border-gray-700">
          <nav class="-mb-px flex flex-wrap gap-4">
            <button
              v-for="tipo in ABAS_FILA"
              :key="tipo"
              type="button"
              class="flex items-center gap-2 border-b-2 pb-3 text-sm font-medium"
              :class="
                abaAtiva === tipo
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              "
              @click="selecionarAba(tipo)"
            >
              {{ FILA_LABEL[tipo] }}
              <span
                v-if="contagensProntas || filasCarregadas[tipo]"
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="filaBadgeClass(tipo)"
              >
                {{ pendentes(tipo) }}
              </span>
            </button>
            <button
              type="button"
              class="flex items-center gap-2 border-b-2 pb-3 text-sm font-medium"
              :class="
                abaAtiva === 'novas_leads'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              "
              @click="abrirAbaLeads"
            >
              Novas leads
              <span
                v-if="totalPendenteLeads > 0"
                class="inline-flex rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-100"
              >
                {{ totalPendenteLeads }}
              </span>
            </button>
          </nav>
          <input
            v-if="abaAtiva !== 'novas_leads'"
            v-model="busca"
            class="mb-3 w-full rounded-lg border px-3 py-2 text-sm sm:w-72 dark:border-gray-600 dark:bg-gray-700"
            placeholder="Buscar por nome, domínio ou e-mail"
          />
        </div>

        <!-- Filas de contato -->
        <div v-if="abaAtiva !== 'novas_leads'" class="overflow-x-auto p-4">
          <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <CrmCounterCard label="Feitos hoje (equipe)" :value="contadores?.hoje?.total ?? 0" value-class="text-emerald-600" />
            <CrmCounterCard label="Feitos hoje (eu)" :value="contadores?.hoje?.meus ?? 0" value-class="text-blue-600" />
            <CrmCounterCard
              v-for="tipo in ABAS_FILA"
              :key="tipo"
              :label="FILA_LABEL[tipo]"
              :value="contadores?.hoje?.por_fila?.[tipo]?.total ?? 0"
              :sub-label="contagensProntas || filasCarregadas[tipo] ? `/ ${pendentes(tipo)} pendentes` : ''"
              :progress="contagensProntas || filasCarregadas[tipo] ? progresso(tipo) : undefined"
              :active="abaAtiva === tipo"
              clickable
              @click="selecionarAba(tipo)"
            />
          </div>

          <nav class="mb-4 flex flex-wrap gap-2">
            <button
              v-for="s in STATUS_CASO"
              :key="s"
              type="button"
              class="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium"
              :class="
                subAba === s
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              "
              @click="subAba = s"
            >
              {{ statusLabel(s, filaAtual) }}
              <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="statusBadgeClass(s)">
                {{ contagem(filaAtual, s) }}
              </span>
              <span
                v-if="s === 'pendente' && contagemSemRetorno(filaAtual) > 0"
                class="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/40 dark:text-orange-100"
                title="Voltaram por falta de retorno"
              >
                {{ contagemSemRetorno(filaAtual) }} sem retorno
              </span>
            </button>
          </nav>

          <p v-if="carregandoFila && !filasCarregadas[filaAtual]" class="text-sm text-gray-500">Carregando fila...</p>
          <p v-else-if="listaFiltrada.length === 0" class="py-6 text-center text-sm text-gray-500">
            Nenhum cliente em "{{ statusLabel(subAba, filaAtual) }}" nesta fila.
          </p>
          <p
            v-if="(subAba === 'resolvido' || subAba === 'encerrado') && contagem(filaAtual, subAba) > listaAtual.length"
            class="mb-2 text-xs text-gray-500"
          >
            Exibindo os {{ listaAtual.length }} mais recentes de {{ contagem(filaAtual, subAba) }}.
          </p>
          <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3 [&_th]:py-2.5">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    @click="toggleSortFila('nome')"
                  >
                    Cliente{{ sortIndicator('nome') }}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    @click="toggleSortFila('dominio')"
                  >
                    Domínio{{ sortIndicator('dominio') }}
                  </button>
                </th>
                <th>Telefone</th>
                <th>E-mail</th>
                <th>
                  <button
                    v-if="abaAtiva !== 'risco_abandono'"
                    type="button"
                    class="inline-flex items-center gap-1 hover:text-gray-800 dark:hover:text-gray-200"
                    @click="toggleSortFila('vencimento')"
                  >
                    Vencimento{{ sortIndicator('vencimento') }}
                  </button>
                  <span v-else>{{ abaAtiva === 'risco_abandono' ? 'Último acesso' : 'Vencimento' }}</span>
                </th>
                <th>Responsável</th>
                <th v-if="subAba === 'aguardando_retorno'">Prazo retorno</th>
                <th v-else-if="subAba === 'em_atendimento'">Atualizado em</th>
                <th v-else-if="subAba === 'resolvido' || subAba === 'encerrado'">Fechado em</th>
                <th>Último contato</th>
                <th class="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in listaFiltrada" :key="c.id_cliente" class="border-t border-gray-100 dark:border-gray-700">
                <td class="font-medium text-gray-900 dark:text-white">
                  {{ c.nome }}
                  <span
                    v-if="subAba === 'pendente' && c.caso?.sem_retorno"
                    class="ml-1 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800 dark:bg-orange-900/40 dark:text-orange-100"
                  >
                    Sem retorno ({{ c.caso.tentativas }}x)
                  </span>
                  <span
                    v-if="c.caso?.fora_criterio && (subAba === 'aguardando_retorno' || subAba === 'em_atendimento')"
                    class="ml-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100"
                    title="O cliente não está mais no critério desta fila"
                  >
                    Saiu do critério
                  </span>
                </td>
                <td class="text-gray-600 dark:text-gray-300">
                  <span class="inline-flex items-center gap-1.5">
                    {{ c.dominio || '-' }}
                    <button
                      v-if="abaAtiva === 'atraso_pagamento' || abaAtiva === 'risco_abandono'"
                      type="button"
                      class="inline-flex rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700"
                      title="Usuários da conta"
                      @click="clienteUsuarios = c"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="3" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a3 3 0 0 1 0 5.74" />
                      </svg>
                    </button>
                  </span>
                </td>
                <td>
                  <a
                    v-if="whatsappLink(c.telefone)"
                    :href="whatsappLink(c.telefone) ?? undefined"
                    target="_blank"
                    rel="noopener"
                    class="text-emerald-600 hover:underline"
                    >{{ c.telefone }}</a
                  >
                  <span v-else>-</span>
                </td>
                <td class="text-gray-600 dark:text-gray-300">{{ c.email || '-' }}</td>
                <td>
                  <template v-if="abaAtiva === 'risco_abandono'">
                    {{ formatDate(c.ultimo_acesso) }}
                    <span v-if="diasDesde(c.ultimo_acesso) !== null" class="text-xs text-gray-500">
                      ({{ diasDesde(c.ultimo_acesso) }}d)
                    </span>
                  </template>
                  <template v-else>
                    {{ formatDate(c.vencimento) }}
                    <span v-if="diasDesde(c.vencimento) !== null" class="text-xs text-red-600">
                      ({{ diasDesde(c.vencimento) }}d)
                    </span>
                  </template>
                </td>
                <td class="text-gray-600 dark:text-gray-300">{{ c.responsavel || '-' }}</td>
                <td v-if="subAba === 'aguardando_retorno'" class="whitespace-nowrap text-xs">
                  {{ formatDate(c.caso?.prazo_retorno) }}
                  <span class="block" :class="prazoClass(c.caso?.prazo_retorno)">{{ prazoTexto(c.caso?.prazo_retorno) }}</span>
                  <span class="block text-gray-500">{{ c.caso?.tentativas ?? 0 }} tentativa(s)</span>
                </td>
                <td v-else-if="subAba === 'em_atendimento'" class="whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
                  {{ formatDateTime(c.caso?.updated_at) }}
                </td>
                <td
                  v-else-if="subAba === 'resolvido' || subAba === 'encerrado'"
                  class="whitespace-nowrap text-xs text-gray-600 dark:text-gray-300"
                >
                  {{ formatDateTime(c.caso?.fechado_em) }}
                  <span v-if="c.caso?.motivo_encerramento" class="block text-gray-500">
                    {{ MOTIVO_ENCERRAMENTO_LABEL[c.caso.motivo_encerramento] }}
                  </span>
                </td>
                <td class="text-xs text-gray-600 dark:text-gray-300">
                  <template v-if="c.ultimo_contato">
                    {{ formatDateTime(c.ultimo_contato.data) }}<br />
                    <span class="text-gray-500">{{ c.ultimo_contato.usuario || '—' }}</span>
                  </template>
                  <span v-else class="text-gray-400">Nunca</span>
                </td>
                <td class="whitespace-nowrap text-right">
                  <template v-if="subAba === 'pendente'">
                    <button
                      type="button"
                      class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                      @click="abrirRegistro(c, 'aguardando_retorno')"
                    >
                      {{ c.caso?.sem_retorno ? 'Nova tentativa' : 'Registrar contato' }}
                    </button>
                    <button
                      type="button"
                      class="ml-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs dark:border-gray-600 dark:text-gray-200"
                      @click="abrirRegistro(c, 'encerrado')"
                    >
                      Encerrar
                    </button>
                  </template>
                  <button
                    v-else-if="subAba === 'aguardando_retorno'"
                    type="button"
                    class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                    @click="abrirRegistro(c, 'em_atendimento')"
                  >
                    Registrar retorno
                  </button>
                  <button
                    v-else-if="subAba === 'em_atendimento'"
                    type="button"
                    class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white"
                    @click="abrirRegistro(c, 'em_atendimento')"
                  >
                    Atualizar
                  </button>
                  <button
                    v-else-if="c.caso"
                    type="button"
                    class="rounded-lg border border-amber-400 px-3 py-1.5 text-xs font-semibold text-amber-700 disabled:opacity-60 dark:text-amber-300"
                    :disabled="reabrindoId === c.caso.id"
                    @click="reabrir(c)"
                  >
                    {{ reabrindoId === c.caso.id ? 'Reabrindo...' : 'Reabrir' }}
                  </button>
                  <button
                    type="button"
                    class="ml-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs dark:border-gray-600 dark:text-gray-200"
                    @click="abrirHistorico(c)"
                  >
                    Histórico
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Novas leads -->
        <div v-else class="space-y-4 p-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <CrmCounterCard
              v-for="bucket in BUCKETS_META_LEAD"
              :key="bucket"
              :label="BUCKET_META_LABEL[bucket]"
              :value="`${metasLeads?.buckets[bucket]?.feitos_hoje ?? 0} / ${metasLeads?.buckets[bucket]?.meta_diaria ?? 0}`"
              :sub-label="`Pendente acumulado: ${metasLeads?.buckets[bucket]?.pendente ?? 0}`"
              :progress="progressoLead(bucket)"
              :progress2="metasLeads?.buckets ? progressoLeadMes(bucket) : undefined"
              :progress2-label="
                metasLeads?.buckets
                  ? `Mês: ${metasLeads.buckets[bucket]?.feitos_mes ?? 0} / ${metasLeads.buckets[bucket]?.meta_mes ?? 0}`
                  : ''
              "
              :progress2-class="metasLeads?.buckets?.[bucket]?.dentro_meta ? 'bg-emerald-500' : 'bg-amber-500'"
              :progress2-text-class="metasLeads?.buckets?.[bucket]?.dentro_meta ? 'text-emerald-600' : 'text-amber-600'"
              :value-class="(metasLeads?.buckets[bucket]?.pendente ?? 0) > 0 ? 'text-amber-600' : 'text-emerald-600'"
            />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <select
                v-model="leadsPeriodo"
                class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700"
                @change="carregarLeads"
              >
                <option value="hoje">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
              </select>
              <input
                v-model="buscaLeads"
                class="w-full rounded-lg border px-3 py-2 text-sm sm:w-64 dark:border-gray-600 dark:bg-gray-700"
                placeholder="Buscar nome, empresa ou e-mail"
                @keyup.enter="carregarLeads"
              />
              <button type="button" class="rounded-lg border px-3 py-2 text-sm dark:border-gray-600" @click="carregarLeads">
                Filtrar
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-600 dark:text-gray-200"
                @click="mostrarModalImport = true"
              >
                Importar Excel
              </button>
              <button
                type="button"
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                @click="abrirCadastroLead"
              >
                Cadastrar lead
              </button>
            </div>
          </div>

          <p v-if="carregandoLeads" class="text-sm text-gray-500">Carregando leads...</p>
          <p v-else-if="leads.length === 0" class="py-6 text-center text-sm text-gray-500">Nenhum lead neste período.</p>
          <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2.5 [&_th]:px-3 [&_th]:py-2.5">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>Hora</th>
                <th>Produto</th>
                <th>Origem</th>
                <th>Nome</th>
                <th>Empresa</th>
                <th>Contato</th>
                <th>Palavra-chave</th>
                <th>Atendente</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in leads" :key="l.id" class="border-t border-gray-100 align-top dark:border-gray-700">
                <td class="whitespace-nowrap">{{ formatTime(l.created_at) }}</td>
                <td>
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="produtoLeadBadgeClass(l.produto)"
                  >
                    {{ PRODUTO_LEAD_LABEL[l.produto] }}
                  </span>
                </td>
                <td>
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="origemLeadBadgeClass(l.origem)"
                  >
                    {{ ORIGEM_LEAD_LABEL[l.origem] }}
                  </span>
                </td>
                <td class="font-medium text-gray-900 dark:text-white">
                  {{ l.nome }}
                  <a
                    v-if="l.linkedin_url"
                    :href="l.linkedin_url"
                    target="_blank"
                    rel="noopener"
                    class="ml-1 text-xs text-blue-600 hover:underline"
                    >LinkedIn</a
                  >
                </td>
                <td>
                  {{ l.empresa }}
                  <span v-if="l.cargo" class="block text-xs text-gray-500">{{ l.cargo }}</span>
                </td>
                <td class="text-xs text-gray-600 dark:text-gray-300">
                  <div v-if="l.telefone">
                    <a
                      v-if="whatsappLink(l.telefone)"
                      :href="whatsappLink(l.telefone) ?? undefined"
                      target="_blank"
                      rel="noopener"
                      class="text-emerald-600 hover:underline"
                      >{{ l.telefone }}</a
                    >
                    <span v-else>{{ l.telefone }}</span>
                  </div>
                  <div v-if="l.email">{{ l.email }}</div>
                  <span v-if="!l.telefone && !l.email">-</span>
                </td>
                <td class="text-xs text-gray-600 dark:text-gray-300">{{ l.palavra_chave || '-' }}</td>
                <td class="text-xs">{{ l.nome_usuario || '—' }}</td>
                <td class="text-right">
                  <button
                    type="button"
                    class="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold dark:border-gray-600 dark:text-gray-200"
                    @click="abrirEdicaoLead(l)"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="abaAtiva !== 'novas_leads'" class="rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-3 text-left"
          @click="mostrarRegistrosHoje = !mostrarRegistrosHoje"
        >
          <span class="text-sm font-semibold text-gray-900 dark:text-white">
            Registros de hoje ({{ registrosHoje.length }})
          </span>
          <span class="text-gray-500">{{ mostrarRegistrosHoje ? '▲' : '▼' }}</span>
        </button>
        <div v-if="mostrarRegistrosHoje" class="overflow-x-auto border-t border-gray-200 p-4 dark:border-gray-700">
          <p v-if="registrosHoje.length === 0" class="text-sm text-gray-500">Nenhum registro hoje ainda.</p>
          <table v-else class="w-full text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2">
            <thead>
              <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                <th>Hora</th>
                <th>Atendente</th>
                <th>Cliente</th>
                <th>Fila</th>
                <th>Status</th>
                <th>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in registrosHoje" :key="r.id" class="border-t border-gray-100 align-top dark:border-gray-700">
                <td class="whitespace-nowrap">{{ formatTime(r.created_at) }}</td>
                <td>{{ r.nome_usuario || '—' }}</td>
                <td>
                  <span class="font-medium">{{ r.nome_cliente || `#${r.id_cliente}` }}</span>
                  <span v-if="r.dominio" class="block text-xs text-gray-500">{{ r.dominio }}</span>
                </td>
                <td>
                  <span class="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold" :class="filaBadgeClass(r.tipo_fila)">
                    {{ FILA_LABEL[r.tipo_fila] }}
                  </span>
                </td>
                <td>
                  <span
                    v-if="r.status_novo"
                    class="inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-semibold"
                    :class="statusBadgeClass(r.status_novo)"
                  >
                    {{ statusLabel(r.status_novo, r.tipo_fila) }}
                  </span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{{ r.descricao }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ModalRegistrarContato
      v-if="clienteRegistro && tipoFilaRegistro"
      :cliente="clienteRegistro"
      :tipo-fila="tipoFilaRegistro"
      :status-atual="statusAtualRegistro"
      :status-inicial="statusInicialRegistro"
      :prazo-padrao="filasResp?.prazo_retorno_padrao ?? ''"
      @close="fecharRegistro"
      @registrado="onRegistrado"
    />
    <ModalHistoricoCliente v-if="clienteHistorico" :cliente="clienteHistorico" @close="clienteHistorico = null" />
    <ModalUsuariosCliente v-if="clienteUsuarios" :cliente="clienteUsuarios" @close="clienteUsuarios = null" />
    <ModalCadastrarLead
      v-if="mostrarModalLead"
      :lead="leadEdicao"
      @close="fecharModalLead"
      @salvo="onLeadSalvo"
    />
    <ModalImportarLeads
      v-if="mostrarModalImport"
      @close="mostrarModalImport = false"
      @importado="onLeadsImportados"
    />
  </admin-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { toast } from 'vue3-toastify'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { PieChartIcon } from '@/icons'
import { crmService } from '@/services/crm'
import CrmCounterCard from './components/CrmCounterCard.vue'
import ModalRegistrarContato from './components/ModalRegistrarContato.vue'
import ModalHistoricoCliente from './components/ModalHistoricoCliente.vue'
import ModalUsuariosCliente from './components/ModalUsuariosCliente.vue'
import ModalCadastrarLead from './components/ModalCadastrarLead.vue'
import ModalImportarLeads from './components/ModalImportarLeads.vue'
import {
  BUCKET_META_LABEL,
  BUCKETS_META_LEAD,
  FILA_LABEL,
  MOTIVO_ENCERRAMENTO_LABEL,
  ORIGEM_LEAD_LABEL,
  PRODUTO_LEAD_LABEL,
  STATUS_CASO,
  ABAS_FILA,
  TIPOS_FILA,
  statusLabel,
  type AbaCrm,
  type BucketMetaLead,
  type ClienteFila,
  type CrmAtendimento,
  type CrmAtendimentoRegistrado,
  type ContagemFila,
  type CrmContadores,
  type CrmFilasContagensResponse,
  type CrmFilasResponse,
  type FilaPorStatus,
  type CrmLead,
  type CrmLeadImportProgress,
  type CrmLeadMetas,
  type StatusCaso,
  type StatusRegistro,
  type TipoFila,
} from './model/crm.types'
import {
  diasAte,
  diasDesde,
  filaBadgeClass,
  formatDate,
  formatDateTime,
  formatTime,
  origemLeadBadgeClass,
  produtoLeadBadgeClass,
  statusBadgeClass,
  whatsappLink,
} from './model/crm.ui'

const store = useStore()
const isAdmin = computed(() => {
  const data = store.state.Login?.data as { id_perfil?: number | string; id_usuario_tipo?: number | string } | undefined
  const id = data?.id_perfil ?? data?.id_usuario_tipo
  return Number(id) === 1
})

const filasResp = ref<CrmFilasResponse | null>(null)
const filasCarregadas = ref<Partial<Record<TipoFila, boolean>>>({})
const contagensProntas = ref(false)
const carregandoFila = ref(false)
const leadsCarregados = ref(false)
const subAba = ref<StatusCaso>('pendente')
const statusAtualRegistro = ref<StatusCaso>('pendente')
const statusInicialRegistro = ref<StatusRegistro>('aguardando_retorno')
const reabrindoId = ref<number | null>(null)
const contadores = ref<CrmContadores | null>(null)
const registrosHoje = ref<CrmAtendimento[]>([])
const metasLeads = ref<CrmLeadMetas | null>(null)
const leads = ref<CrmLead[]>([])
const carregando = ref(false)
const carregandoLeads = ref(false)
const abaAtiva = ref<AbaCrm>('atraso_pagamento')
const busca = ref('')
const buscaLeads = ref('')
const leadsPeriodo = ref<'hoje' | '7d'>('hoje')
const mostrarRegistrosHoje = ref(true)
const mostrarModalLead = ref(false)
const leadEdicao = ref<CrmLead | null>(null)
const mostrarModalImport = ref(false)
const clienteRegistro = ref<ClienteFila | null>(null)
const tipoFilaRegistro = ref<TipoFila | null>(null)
const clienteHistorico = ref<ClienteFila | null>(null)
const clienteUsuarios = ref<ClienteFila | null>(null)
const erro = ref('')

type SortFilaCol = 'nome' | 'dominio' | 'vencimento'
const sortFilaCol = ref<SortFilaCol | null>(null)
const sortFilaDir = ref<'asc' | 'desc'>('asc')

const prazoDiasUteis = computed(() => filasResp.value?.prazo_retorno_dias_uteis ?? 3)

const filaAtual = computed<TipoFila>(() =>
  abaAtiva.value === 'novas_leads' ? 'risco_abandono' : abaAtiva.value,
)

const contagem = (tipo: TipoFila, status: StatusCaso): number => filasResp.value?.contagens[tipo]?.[status] ?? 0

const contagemSemRetorno = (tipo: TipoFila): number => filasResp.value?.contagens[tipo]?.sem_retorno ?? 0

const listaAtual = computed<ClienteFila[]>(() => filasResp.value?.filas[filaAtual.value]?.[subAba.value] ?? [])

const prazoTexto = (prazo: string | null | undefined): string => {
  const d = diasAte(prazo)
  if (d === null) return ''
  if (d < 0) return 'vencido'
  if (d === 0) return 'vence hoje'
  return `em ${d} dia(s)`
}

const prazoClass = (prazo: string | null | undefined): string => {
  const d = diasAte(prazo)
  if (d === null) return 'text-gray-500'
  if (d <= 0) return 'font-semibold text-red-600'
  if (d === 1) return 'text-amber-600'
  return 'text-gray-500'
}

const toggleSortFila = (col: SortFilaCol) => {
  if (sortFilaCol.value === col) {
    sortFilaDir.value = sortFilaDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortFilaCol.value = col
    sortFilaDir.value = col === 'vencimento' ? 'desc' : 'asc'
  }
}

const sortIndicator = (col: SortFilaCol): string => {
  if (sortFilaCol.value !== col) return ''
  return sortFilaDir.value === 'asc' ? ' ↑' : ' ↓'
}

const hojeIso = () => new Date().toISOString().slice(0, 10)

const diasAtrasIso = (dias: number) => {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d.toISOString().slice(0, 10)
}

const pendentes = (tipo: TipoFila): number => contagem(tipo, 'pendente')

const totalPendenteLeads = computed(() => {
  if (!metasLeads.value) return 0
  return BUCKETS_META_LEAD.reduce((acc, b) => acc + (metasLeads.value?.buckets[b]?.pendente ?? 0), 0)
})

const progresso = (tipo: TipoFila): number => {
  const feitos = contadores.value?.hoje?.por_fila?.[tipo]?.total ?? 0
  const total = feitos + pendentes(tipo)
  return total === 0 ? 100 : Math.round((feitos / total) * 100)
}

const progressoLead = (bucket: BucketMetaLead): number => {
  const b = metasLeads.value?.buckets[bucket]
  if (!b || b.meta_acumulada === 0) return 100
  return Math.min(100, Math.round((b.feitos / b.meta_acumulada) * 100))
}

const progressoLeadMes = (bucket: BucketMetaLead): number => {
  const b = metasLeads.value?.buckets[bucket]
  if (!b || b.meta_mes === 0) return 100
  return Math.min(100, Math.round((b.feitos_mes / b.meta_mes) * 100))
}

const listaFiltrada = computed<ClienteFila[]>(() => {
  if (abaAtiva.value === 'novas_leads') return []
  const lista = listaAtual.value
  const q = busca.value.trim().toLowerCase()
  let out = !q
    ? [...lista]
    : lista.filter(
        (c) =>
          String(c.nome || '').toLowerCase().includes(q) ||
          String(c.dominio || '').toLowerCase().includes(q) ||
          String(c.email || '').toLowerCase().includes(q),
      )

  if (sortFilaCol.value) {
    const col = sortFilaCol.value
    const dir = sortFilaDir.value === 'asc' ? 1 : -1
    out = out.slice().sort((a, b) => {
      const va = String(a[col] ?? '').toLowerCase()
      const vb = String(b[col] ?? '').toLowerCase()
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  }
  return out
})

const carregarContadores = async () => {
  contadores.value = await crmService.contadores()
}

const carregarRegistrosHoje = async () => {
  const hoje = hojeIso()
  const page = await crmService.historico({ data_inicio: hoje, data_fim: hoje, per_page: 200 })
  registrosHoje.value = Array.isArray(page.data) ? page.data : []
}

const carregarMetasLeads = async () => {
  metasLeads.value = await crmService.leadsMetas()
}

const carregarLeads = async () => {
  carregandoLeads.value = true
  try {
    const hoje = hojeIso()
    const dataInicio = leadsPeriodo.value === 'hoje' ? hoje : diasAtrasIso(6)
    const page = await crmService.leadsListar({
      data_inicio: dataInicio,
      data_fim: hoje,
      q: buscaLeads.value.trim() || undefined,
      per_page: 200,
    })
    leads.value = Array.isArray(page.data) ? page.data : []
  } finally {
    carregandoLeads.value = false
  }
}

const listasVazias = (): FilaPorStatus => ({
  pendente: [],
  aguardando_retorno: [],
  em_atendimento: [],
  resolvido: [],
  encerrado: [],
})

const contagensVazias = (): ContagemFila => ({
  pendente: 0,
  aguardando_retorno: 0,
  em_atendimento: 0,
  resolvido: 0,
  encerrado: 0,
  sem_retorno: 0,
})

const garantirFilasResp = (prazoPadrao: string, prazoDias: number) => {
  if (filasResp.value) return
  const filas = {} as Record<TipoFila, FilaPorStatus>
  const contagens = {} as Record<TipoFila, ContagemFila>
  for (const t of TIPOS_FILA) {
    filas[t] = listasVazias()
    contagens[t] = contagensVazias()
  }
  filasResp.value = {
    filas,
    contagens,
    prazo_retorno_padrao: prazoPadrao,
    prazo_retorno_dias_uteis: prazoDias,
  }
}

const aplicarContagens = (resp: CrmFilasContagensResponse) => {
  if (!resp?.contagens) return
  garantirFilasResp(resp.prazo_retorno_padrao, resp.prazo_retorno_dias_uteis)
  if (!filasResp.value) return
  for (const t of TIPOS_FILA) {
    if (!resp.contagens[t] || filasCarregadas.value[t]) continue
    filasResp.value.contagens[t] = resp.contagens[t]
  }
  filasResp.value.prazo_retorno_padrao = resp.prazo_retorno_padrao
  filasResp.value.prazo_retorno_dias_uteis = resp.prazo_retorno_dias_uteis
  contagensProntas.value = true
}

const aplicarFila = (resp: CrmFilasResponse) => {
  if (!resp?.filas) {
    throw new Error('Resposta inválida das filas')
  }
  garantirFilasResp(resp.prazo_retorno_padrao, resp.prazo_retorno_dias_uteis)
  if (!filasResp.value) return
  for (const t of TIPOS_FILA) {
    if (!resp.filas[t]) continue
    filasResp.value.filas[t] = resp.filas[t]
    filasResp.value.contagens[t] = resp.contagens[t]
    filasCarregadas.value = { ...filasCarregadas.value, [t]: true }
  }
  filasResp.value.prazo_retorno_padrao = resp.prazo_retorno_padrao
  filasResp.value.prazo_retorno_dias_uteis = resp.prazo_retorno_dias_uteis
}

const carregarContagensFilas = async (fresh = false) => {
  aplicarContagens(await crmService.filasContagens(fresh))
}

let filaReq = 0

const carregarFila = async (tipo: TipoFila) => {
  const req = ++filaReq
  carregandoFila.value = true
  try {
    aplicarFila(await crmService.filas(tipo))
  } finally {
    if (req === filaReq) carregandoFila.value = false
  }
}

const carregarLeadsAba = async () => {
  const extras = await Promise.allSettled([carregarMetasLeads(), carregarLeads()])
  const falha = extras.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined
  if (!falha) leadsCarregados.value = true
  if (falha) {
    const ax = falha.reason as { response?: { data?: { message?: string; error?: string }; status?: number } }
    erro.value =
      ax.response?.data?.message ||
      ax.response?.data?.error ||
      `Falha ao carregar leads (HTTP ${ax.response?.status ?? '?'})`
  }
}

const selecionarAba = (aba: AbaCrm) => {
  abaAtiva.value = aba
  erro.value = ''
  if (aba === 'novas_leads') {
    if (!leadsCarregados.value) void carregarLeadsAba()
    return
  }
  if (!filasCarregadas.value[aba]) void carregarFila(aba).catch(() => {
    erro.value = 'Falha ao carregar a fila.'
  })
}

const abrirAbaLeads = () => {
  selecionarAba('novas_leads')
}

const carregarTudo = async (fresh = false) => {
  carregando.value = true
  erro.value = ''
  try {
    if (abaAtiva.value === 'novas_leads') {
      leadsCarregados.value = false
      await Promise.allSettled([carregarLeadsAba(), carregarContagensFilas(fresh)])
      return
    }

    const tipo = abaAtiva.value
    filasCarregadas.value = {}
    const extras = await Promise.allSettled([
      carregarFila(tipo),
      carregarContagensFilas(fresh),
      carregarContadores(),
      carregarRegistrosHoje(),
    ])
    const falha = extras.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined
    if (falha) {
      const ax = falha.reason as { response?: { data?: { message?: string; error?: string }; status?: number } }
      erro.value =
        ax.response?.data?.message ||
        ax.response?.data?.error ||
        `Falha parcial no CRM (HTTP ${ax.response?.status ?? '?'})`
    }
  } catch (e: unknown) {
    const ax = e as { response?: { data?: { message?: string; error?: string }; status?: number } }
    erro.value =
      ax.response?.data?.message ||
      ax.response?.data?.error ||
      `Falha ao carregar CRM (HTTP ${ax.response?.status ?? '?'})`
  } finally {
    carregando.value = false
  }
}

const abrirRegistro = (c: ClienteFila, statusInicial: StatusRegistro) => {
  if (abaAtiva.value === 'novas_leads') return
  tipoFilaRegistro.value = abaAtiva.value
  statusAtualRegistro.value = subAba.value
  statusInicialRegistro.value = statusInicial
  clienteRegistro.value = c
}

const recarregarFilas = async () => {
  if (abaAtiva.value === 'novas_leads') return
  filasCarregadas.value = {}
  try {
    await Promise.all([carregarFila(abaAtiva.value), carregarContagensFilas(true)])
  } catch {
    erro.value = 'Falha ao atualizar as filas.'
  }
}

const reabrir = async (c: ClienteFila) => {
  if (!c.caso) return
  if (!window.confirm(`Reabrir o caso de ${c.nome}? Ele volta para Pendentes se ainda estiver no critério da fila.`)) return
  reabrindoId.value = c.caso.id
  try {
    await crmService.reabrirCaso(c.caso.id)
    toast.success('Caso reaberto')
    await Promise.all([recarregarFilas(), carregarContadores(), carregarRegistrosHoje()])
  } catch {
    toast.error('Não foi possível reabrir o caso')
  } finally {
    reabrindoId.value = null
  }
}

const abrirHistorico = (c: ClienteFila) => {
  clienteHistorico.value = c
}

const fecharRegistro = () => {
  clienteRegistro.value = null
  tipoFilaRegistro.value = null
}

const onRegistrado = (registro: CrmAtendimentoRegistrado) => {
  const tipo = registro.tipo_fila
  const lista = filasResp.value?.filas[tipo]?.[subAba.value]
  if (filasResp.value && lista) {
    filasResp.value.filas[tipo][subAba.value] = lista.filter((c) => c.id_cliente !== registro.id_cliente)
  }
  fecharRegistro()
  void Promise.all([recarregarFilas(), carregarContadores(), carregarRegistrosHoje()])
}

const abrirCadastroLead = () => {
  leadEdicao.value = null
  mostrarModalLead.value = true
}

const abrirEdicaoLead = (lead: CrmLead) => {
  leadEdicao.value = lead
  mostrarModalLead.value = true
}

const fecharModalLead = () => {
  mostrarModalLead.value = false
  leadEdicao.value = null
}

const onLeadSalvo = (_lead: CrmLead) => {
  fecharModalLead()
  void Promise.all([carregarMetasLeads(), carregarLeads()])
}

const onLeadsImportados = (_result: CrmLeadImportProgress) => {
  void Promise.all([carregarMetasLeads(), carregarLeads()])
}

onMounted(() => {
  void carregarTudo()
})
</script>
