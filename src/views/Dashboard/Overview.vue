<template>
  <admin-layout>
    <div class="flex h-full w-full flex-col space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <!-- Stats cards: flex wrap para preencher o espaço sem buracos -->
      <div class="flex flex-wrap gap-6">
        <div
          v-for="stats in displayedStatsCards"
          :key="stats.title"
          class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 min-w-[200px] flex-1"
        >
          <div class="flex items-center">
            <div
              :class="[
                'flex h-12 w-12 items-center justify-center rounded-lg',
                {
                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400':
                    stats.type === 'warning',
                  'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400':
                    stats.type === 'success',
                  'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400':
                    stats.type === 'info',
                },
              ]"
            >
              <i :class="stats.icon" class="text-xl"></i>
            </div>
            <div class="ml-4 flex-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ stats.title }}
              </p>
              <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
                {{ stats.value || '—' }}
              </p>
            </div>
          </div>
          <div class="mt-4 flex items-center text-xs text-gray-500 dark:text-gray-400">
            <i :class="stats.footerIcon" class="mr-1"></i>
            {{ stats.title === 'Vendas Mês Atual' && !isPerfil1 ? 'Primeiros pgts do cliente no mês' : stats.footerText }}
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="space-y-6">
        <!-- Valor Mensal de faturamento (apenas perfil 1) -->
        <div v-if="isPerfil1" class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Valor Mensal de faturamento
          </h4>
          <div class="h-[400px] w-full">
            <VueApexCharts
              v-if="!loading && vendasData.length > 0"
              height="400"
              :options="chartOptionsVendas"
              :series="chartSeriesVendas"
            />
            <div
              v-else
              class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400"
            >
              Carregando...
            </div>
          </div>
          <!-- Top 20 lançamentos por valor -->
          <div class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <h5 class="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">Top 20 lançamentos por valor</h5>
            <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por mês</label>
            <select
              v-model="lancamentosFaturamentoFiltro"
              class="mb-3 rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="carregarTopLancamentosFaturamento"
            >
              <option
                v-for="opt in opcoesMesAno"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                    <th scope="col" class="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">ID</th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Cliente</th>
                    <th scope="col" class="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Valor</th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Data</th>
                    <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Venc.</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  <tr v-if="loadingTopLancamentos" class="text-center text-gray-500 dark:text-gray-400">
                    <td colspan="6" class="px-4 py-6">Carregando...</td>
                  </tr>
                  <tr v-else-if="!topLancamentosFaturamento.length" class="text-center text-gray-500 dark:text-gray-400">
                    <td colspan="6" class="px-4 py-6">Nenhum lançamento.</td>
                  </tr>
                  <tr
                    v-else
                    v-for="(row, idx) in topLancamentosFaturamento"
                    :key="idx"
                    class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{{ idx + 1 }}</td>
                    <td class="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-500 dark:text-gray-400">{{ row.cliente_id ?? '—' }}</td>
                    <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ truncateNome(row.nome) }}</td>
                    <td class="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">{{ formatBr(row.valor) }}</td>
                    <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.data) }}</td>
                    <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.vencimento) || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Leads por Mês e Vendas por mês: 2 colunas quando os dois existem, 1 coluna quando só Leads -->
        <div
          :class="[
            'grid gap-6',
            isPerfil1ou6 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
          ]"
        >
          <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 min-w-0">
            <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Leads por Mês
            </h4>
            <div class="h-[400px] w-full">
              <VueApexCharts
                v-if="!loadingLeads && leadsData.length > 0"
                type="area"
                height="400"
                :options="chartOptionsLeads"
                :series="chartSeriesLeads"
              />
            <div
              v-else
              class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400"
            >
                Carregando...
              </div>
            </div>
            <!-- Detalhe leads por mês: select + tabela -->
            <div class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por mês</label>
              <select
                v-model="leadsMesFiltro"
                class="rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @change="carregarDetalheLeadsMes"
              >
                <option
                  v-for="opt in opcoesMesAno"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <div class="mt-3 overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Cliente</th>
                      <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Data cadastro</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    <tr v-if="loadingDetalheLeads" class="text-center text-gray-500 dark:text-gray-400">
                      <td colspan="2" class="px-4 py-6">Carregando...</td>
                    </tr>
                    <tr v-else-if="!detalheLeadsMes.length" class="text-center text-gray-500 dark:text-gray-400">
                      <td colspan="2" class="px-4 py-6">Nenhum lead neste mês.</td>
                    </tr>
                    <tr
                      v-else
                      v-for="(row, idx) in detalheLeadsMes"
                      :key="idx"
                      class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ truncateNome(row.nome) }}</td>
                      <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.data_cadastro) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div v-if="isPerfil1ou6" class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
            <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Vendas por mês (Setup + primeira mensalidade)
            </h4>
            <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
              
              <span v-if="!isPerfil1" class="block mt-1 font-medium"></span>
            </p>
            <div class="h-[400px] w-full">
              <VueApexCharts
                v-if="!loadingPrimeiras && primeirasData.length > 0"
                type="area"
                height="400"
                :options="chartOptionsPrimeiras"
                :series="chartSeriesPrimeiras"
              />
              <div
                v-else
                class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400"
              >
                Carregando...
              </div>
            </div>
            <!-- Detalhe por mês: select + tabela -->
            <div class="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por mês</label>
              <select
                v-model="vendasMesFiltro"
                class="rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                @change="carregarDetalheVendasMes"
              >
                <option
                  v-for="opt in opcoesMesAno"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </select>
              <div class="mt-3 overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Cliente</th>
                      <th scope="col" class="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Valor pago</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    <tr v-if="loadingDetalheVendas" class="text-center text-gray-500 dark:text-gray-400">
                      <td colspan="2" class="px-4 py-6">Carregando...</td>
                    </tr>
                    <tr v-else-if="!detalheVendasMes.length" class="text-center text-gray-500 dark:text-gray-400">
                      <td colspan="2" class="px-4 py-6">Nenhum cliente neste mês.</td>
                    </tr>
                    <tr
                      v-else
                      v-for="(row, idx) in detalheVendasMes"
                      :key="idx"
                      class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ truncateNome(row.nome) }}</td>
                      <td class="whitespace-nowrap px-4 py-2 text-right text-sm text-gray-700 dark:text-gray-300">{{ formatBr(row.valor) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Crescimento da base (clientes ativos) -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Crescimento da base (clientes ativos)
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Clientes com pelo menos 1 acesso nos últimos 2 meses, ao fim de cada mês (ano atual).
          </p>
          <div class="h-[300px] w-full">
            <VueApexCharts
              v-if="crescimentoBaseData.length > 0"
              type="area"
              height="300"
              :options="chartOptionsCrescimento"
              :series="chartSeriesCrescimento"
            />
            <div v-else class="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
              Carregando...
            </div>
          </div>
        </div>

        <!-- Top clientes com mais acesso -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Top clientes com mais acesso
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Maior número de acessos nos últimos 3 meses.
          </p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">#</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nome</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Acessos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-if="loadingTopAcesso" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="3" class="px-4 py-6">Carregando...</td>
                </tr>
                <tr v-else-if="!topClientesAcesso.length" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="3" class="px-4 py-6">Nenhum dado.</td>
                </tr>
                <tr
                  v-else
                  v-for="(row, idx) in topClientesAcesso"
                  :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-500 dark:text-gray-400">{{ (pageTopAcesso - 1) * perPageTopAcesso + idx + 1 }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ truncateNome(row.nome) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.total_acessos ?? '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="totalTopAcesso > 0" class="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-3 dark:border-gray-700">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ totalTopAcesso }} cliente(s)
            </span>
            <select
              v-model="perPageTopAcesso"
              class="rounded border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              @change="onPerPageTopAcessoChange"
            >
              <option :value="10">10 por página</option>
              <option :value="15">15 por página</option>
              <option :value="25">25 por página</option>
            </select>
            <div class="flex items-center gap-1">
              <button
                type="button"
                class="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :disabled="pageTopAcesso <= 1 || loadingTopAcesso"
                @click="goPageTopAcesso(pageTopAcesso - 1)"
              >
                Anterior
              </button>
              <span class="px-2 text-sm text-gray-600 dark:text-gray-400">
                Página {{ pageTopAcesso }} de {{ totalPagesTopAcesso || 1 }}
              </span>
              <button
                type="button"
                class="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                :disabled="pageTopAcesso >= totalPagesTopAcesso || loadingTopAcesso"
                @click="goPageTopAcesso(pageTopAcesso + 1)"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>

        <!-- Clientes em risco de abandono (10 dias ou mais sem acesso) -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Clientes em risco de abandono
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Sem acesso há 10 dias ou mais. Máx. 30.
          </p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nome</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Domínio</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Último acesso</th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">WhatsApp</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Responsável</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-if="loadingRisco" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="5" class="px-4 py-6">Carregando...</td>
                </tr>
                <tr v-else-if="!clientesRiscoAbandono.length" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="5" class="px-4 py-6">Nenhum cliente em risco no período.</td>
                </tr>
                <tr
                  v-else
                  v-for="(row, idx) in clientesRiscoAbandono"
                  :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ truncateNome(row.nome) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.dominio || '—' }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.ultimo_acesso) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-right">
                    <a
                      v-if="whatsappUrl(row.telefone)"
                      :href="whatsappUrl(row.telefone)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center rounded p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                      title="Abrir WhatsApp"
                    >
                      <i class="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                    </a>
                    <span v-else class="text-gray-400 dark:text-gray-500" title="Telefone não cadastrado">—</span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.responsavel || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Clientes inadimplentes -->
        <div class="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Clientes inadimplentes
          </h4>
          <p class="mb-3 text-sm text-gray-500 dark:text-gray-400">
            Vencimento em atraso há mais de 15 dias. Ordenado por vencimento (mais atrasados primeiro). Máx. 30.
          </p>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Nome</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Domínio</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">E-mail</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Vencimento</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Último acesso</th>
                  <th scope="col" class="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">WhatsApp</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">Responsável</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                <tr v-if="loadingSemUso" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="7" class="px-4 py-6">Carregando...</td>
                </tr>
                <tr v-else-if="!clientesSemUso.length" class="text-center text-gray-500 dark:text-gray-400">
                  <td colspan="7" class="px-4 py-6">Nenhum cliente inadimplente.</td>
                </tr>
                <tr
                  v-else
                  v-for="(row, idx) in clientesSemUso"
                  :key="idx"
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-white">{{ truncateNome(row.nome) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.dominio || '—' }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ primeiroEmail(row.email) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.vencimento) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ formatDate(row.ultimo_acesso) }}</td>
                  <td class="whitespace-nowrap px-4 py-2 text-right">
                    <a
                      v-if="whatsappUrl(row.telefone)"
                      :href="whatsappUrl(row.telefone)"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center rounded p-1.5 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/30"
                      title="Enviar mensagem no WhatsApp para o cliente"
                    >
                      <i class="fab fa-whatsapp text-xl" aria-hidden="true"></i>
                    </a>
                    <span v-else class="text-gray-400 dark:text-gray-500" title="Telefone não cadastrado ou inválido">—</span>
                  </td>
                  <td class="whitespace-nowrap px-4 py-2 text-sm text-gray-700 dark:text-gray-300">{{ row.responsavel || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  </admin-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import VueApexCharts from 'vue3-apexcharts'
import { dashboardAdmin, clearDashboardCache } from '@/services/dashboard-admin'
import { ElMessage } from 'element-plus'

const store = useStore()
const isPerfil1 = computed(() => {
  const data = store.state.Login?.data
  const id = data?.id_perfil ?? data?.id_usuario_tipo
  return id == 1 || id === '1'
})

const isPerfil6 = computed(() => {
  const data = store.state.Login?.data
  const id = data?.id_perfil ?? data?.id_usuario_tipo
  return id == 6 || id === '6'
})

const isPerfil1ou6 = computed(() => isPerfil1.value || isPerfil6.value)

const isPerfil4 = computed(() => {
  const data = store.state.Login?.data
  const id = data?.id_perfil ?? data?.id_usuario_tipo
  return id == 4 || id === '4'
})

const displayedStatsCards = computed(() => {
  let list = statsCards.value
  if (!isPerfil1.value) {
    list = list.filter((s) => s.title !== 'Total Mês Atual' && s.title !== 'Ticket médio')
  }
  if (!isPerfil1ou6.value) {
    list = list.filter((s) => s.title !== 'Vendas Mês Atual')
  }
  if (isPerfil4.value) {
    list = list.filter((s) => s.title !== 'Ticket médio')
  }
  return list
})

const loading = ref(true)
const loadingLeads = ref(true)
const loadingsetup = ref(true)
const loadingPrimeiras = ref(true)
const refreshing = ref(false)

const statsCards = ref([
  {
    type: 'warning',
    icon: 'ti-server',
    title: 'QTD de Clientes',
    value: '',
    footerText: 'Updated now',
    footerIcon: 'ti-reload',
  },
  {
    type: 'info',
    icon: 'ti-target',
    title: 'Clientes Ativos',
    value: '',
    footerText: 'Com pelo menos 1 acesso (últimos 2 meses)',
    footerIcon: 'ti-reload',
  },
  {
    type: 'success',
    icon: 'ti-pulse',
    title: 'Total Mês Atual',
    value: '',
    footerText: 'Updated now',
    footerIcon: 'ti-reload',
  },
  {
    type: 'info',
    icon: 'ti-user',
    title: 'QTD de Leads Mês Atual',
    value: '',
    footerText: 'Total de clientes cadastrados no mês',
    footerIcon: 'ti-reload',
  },
  {
    type: 'success',
    icon: 'ti-wallet',
    title: 'Vendas Mês Atual',
    value: '',
    footerText: 'Primeiras transações (setup + 1ª mensalidade)',
    footerIcon: 'ti-reload',
  },
  {
    type: 'info',
    icon: 'ti-currency-dollar',
    title: 'Ticket médio',
    value: '',
    footerText: 'Média valor/dia (Período Plano). Apenas perfil 1.',
    footerIcon: 'ti-reload',
  },
  {
    type: 'warning',
    icon: 'ti-user-off',
    title: 'Churn',
    value: '',
    footerText: 'Mais de 60 dias sem pagar',
    footerIcon: 'ti-reload',
  },
])

const vendasData = ref([])
const vendasTrendData = ref([])
const vendasInadimplenciaData = ref([]) // inadimplência por mês (vencido no mês, pago com >30 dias atraso)
const topLancamentosFaturamento = ref([])
const loadingTopLancamentos = ref(true)
const lancamentosFaturamentoFiltro = ref('')
const leadsData = ref([])
const setupData = ref([])
const primeirasData = ref([])
const clientesSemUso = ref([])
const loadingSemUso = ref(true)
const crescimentoBaseData = ref([])
const crescimentoBaseDataAnoAnterior = ref([])
const crescimentoBaseCurrentMonth = ref(12)
const topClientesAcesso = ref([])
const loadingTopAcesso = ref(true)
const pageTopAcesso = ref(1)
const perPageTopAcesso = ref(10)
const totalTopAcesso = ref(0)
const clientesRiscoAbandono = ref([])
const loadingRisco = ref(true)
const detalheVendasMes = ref([])
const loadingDetalheVendas = ref(false)
const vendasMesFiltro = ref('')
const detalheLeadsMes = ref([])
const loadingDetalheLeads = ref(false)
const leadsMesFiltro = ref('')

const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

const opcoesMesAno = (() => {
  const anoAtual = new Date().getFullYear()
  const opts = []
  for (let ano = anoAtual; ano >= anoAtual - 1; ano--) {
    for (let mes = 1; mes <= 12; mes++) {
      opts.push({
        value: `${ano}-${mes}`,
        label: `${mesesNomes[mes - 1]} ${ano}`,
        ano,
        mes,
      })
    }
  }
  return opts
})()

const totalPagesTopAcesso = computed(() =>
  Math.max(1, Math.ceil(totalTopAcesso.value / perPageTopAcesso.value))
)

async function carregarTopClientesAcesso(pg) {
  const page = pg ?? pageTopAcesso.value
  loadingTopAcesso.value = true
  try {
    const res = await dashboardAdmin.topClientesAcesso(page, perPageTopAcesso.value)
    const list = res.data?.data ?? []
    const total = res.data?.total ?? 0
    topClientesAcesso.value = Array.isArray(list) ? list : []
    totalTopAcesso.value = total
    pageTopAcesso.value = page
  } catch (err) {
    console.error('Erro ao carregar top clientes acesso:', err)
    topClientesAcesso.value = []
    totalTopAcesso.value = 0
  } finally {
    loadingTopAcesso.value = false
  }
}

function onPerPageTopAcessoChange() {
  pageTopAcesso.value = 1
  carregarTopClientesAcesso(1)
}

function goPageTopAcesso(page) {
  if (page < 1 || page > totalPagesTopAcesso.value) return
  carregarTopClientesAcesso(page)
}

function getMesAnoFromFiltro() {
  const v = vendasMesFiltro.value || ''
  const [ano, mes] = v.split('-').map(Number)
  const y = new Date().getFullYear()
  return { mes: mes || new Date().getMonth() + 1, ano: ano || y }
}

function getMesAnoFromLeadsFiltro() {
  const v = leadsMesFiltro.value || ''
  const [ano, mes] = v.split('-').map(Number)
  const y = new Date().getFullYear()
  return { mes: mes || new Date().getMonth() + 1, ano: ano || y }
}

function getMesAnoFromLancamentosFiltro() {
  const v = lancamentosFaturamentoFiltro.value || ''
  const [ano, mes] = v.split('-').map(Number)
  const y = new Date().getFullYear()
  return { mes: mes || new Date().getMonth() + 1, ano: ano || y }
}

async function carregarTopLancamentosFaturamento() {
  const { mes, ano } = getMesAnoFromLancamentosFiltro()
  if (!mes || !ano) return
  loadingTopLancamentos.value = true
  try {
    const res = await dashboardAdmin.topLancamentosFaturamento(mes, ano)
    const list = res.data?.data ?? res.data ?? []
    topLancamentosFaturamento.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar top lançamentos faturamento:', err)
    topLancamentosFaturamento.value = []
  } finally {
    loadingTopLancamentos.value = false
  }
}

async function carregarDetalheLeadsMes() {
  const { mes, ano } = getMesAnoFromLeadsFiltro()
  if (!mes || !ano) return
  loadingDetalheLeads.value = true
  try {
    const res = await dashboardAdmin.leadsDetalheMes(mes, ano)
    const list = res.data?.data ?? res.data ?? []
    detalheLeadsMes.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar detalhe leads por mês:', err)
    detalheLeadsMes.value = []
  } finally {
    loadingDetalheLeads.value = false
  }
}

const formatBr = (val) => 'R$ ' + (Number(val) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = String(d).split(/[-T]/)
  if (!y || !m || !day) return d
  return `${day}/${m}/${y}`
}
const truncateNome = (s, max = 30) => {
  if (s == null || s === '') return '—'
  const str = String(s)
  return str.length <= max ? str : str.slice(0, max) + '...'
}
const primeiroEmail = (s) => {
  if (s == null || s === '') return '—'
  const first = String(s).split(/[,;]/)[0]?.trim()
  return first || '—'
}

const MSG_WHATSAPP_SEM_USO = 'Olá! Notamos que faz um tempo que você não acessa o Jobb. Está tudo bem? Precisa de algum suporte ou tem alguma dúvida? Estamos à disposição!'
/** Normaliza telefone para wa.me: só dígitos; se já começar com 55, mantém; senão se 10 ou 11 dígitos (DDD+numero BR), adiciona 55. Retorna null se inválido. */
const normalizarTelefoneWhatsApp = (telefone) => {
  if (!telefone) return null
  const num = String(telefone).replace(/\D/g, '')
  if (num.length < 10) return null
  const full = num.startsWith('55') ? num : (num.length <= 11 ? '55' + num : num)
  return full
}
const whatsappUrl = (telefone) => {
  const full = normalizarTelefoneWhatsApp(telefone)
  if (!full) return null
  return `https://wa.me/${full}?text=${encodeURIComponent(MSG_WHATSAPP_SEM_USO)}`
}

const chartOptionsVendas = computed(() => ({
  chart: {
    type: 'line',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { show: true, curve: 'smooth', width: [2, 2, 2, 2], dashArray: [0, 6, 0, 6] },
  markers: { size: 0 },
  xaxis: { categories: meses },
  yaxis: {
    labels: {
      formatter: (val) => formatBr(val),
    },
  },
  fill: {
    type: 'gradient',
    opacity: [0.85, 0, 0, 0],
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#10b981', '#f59e0b', '#ef4444', '#ef4444'],
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => formatBr(val),
    },
  },
}))

const chartSeriesVendas = computed(() => {
  const inad = [...(vendasInadimplenciaData.value || [])]
  const mesAtual = new Date().getMonth()
  const inadReal = inad.map((v, i) => (i <= mesAtual ? v : null))
  const inadProj = inad.map((v, i) => (i >= mesAtual ? v : null))
  return [
    {
      name: 'Faturamento',
      type: 'area',
      data: [...(vendasData.value || [])],
    },
    {
      name: 'Tendência (ano ant. − inad.)',
      type: 'line',
      data: [...(vendasTrendData.value || [])],
    },
    {
      name: 'Inadimplência',
      type: 'line',
      data: inadReal,
    },
    {
      name: 'Inadimplência (proj.)',
      type: 'line',
      data: inadProj,
    },
  ]
})

const chartOptionsLeads = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {},
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#3b82f6'],
  tooltip: {
    theme: 'dark',
  },
}))

const chartSeriesLeads = computed(() => [
  {
    name: 'Leads',
    data: leadsData.value,
  },
])

const chartOptionsSetup = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {},
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#10b981'],
  tooltip: {
    theme: 'dark',
  },
}))

const chartSeriesSetup = computed(() => [
  {
    name: 'Setup',
    data: setupData.value,
  },
])

const chartOptionsPrimeiras = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth' },
  xaxis: { categories: meses },
  yaxis: {
    labels: {
      formatter: (val) => formatBr(val),
    },
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 90, 100],
    },
  },
  colors: ['#8b5cf6'],
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val) => formatBr(val),
    },
  },
}))

const chartSeriesPrimeiras = computed(() => [
  {
    name: 'Primeiras transações',
    data: primeirasData.value,
  },
])

const chartOptionsCrescimento = computed(() => ({
  chart: { type: 'area', height: 300, toolbar: { show: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2, dashArray: [0, 6] },
  xaxis: { categories: meses },
  yaxis: {},
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.9, stops: [0, 90, 100] },
  },
  colors: ['#0ea5e9', '#f97316'],
  tooltip: { theme: 'dark' },
  legend: { show: true },
  plotOptions: {
    area: {
      fillTo: 'origin',
    },
  },
}))
const chartSeriesCrescimento = computed(() => {
  const data = crescimentoBaseData.value
  const anoAnt = crescimentoBaseDataAnoAnterior.value
  const curIdx = Math.max(0, Math.min(11, (crescimentoBaseCurrentMonth.value || 1) - 1))
  if (data.length !== 12) return [{ name: 'Clientes ativos', data }]
  const real = data.map((v, i) => (i <= curIdx ? v : null))
  if (curIdx >= 11) return [{ name: 'Clientes ativos', data: real }]
  const atuais = Number(data[curIdx]) || 0
  const anoPassadoMesAtual = Number(anoAnt[curIdx]) || 0
  const proj = data.map((v, i) => {
    if (i < curIdx) return null
    if (anoPassadoMesAtual <= 0) return atuais
    const anoPassadoM = Number(anoAnt[i]) || 0
    return Math.round(atuais * (anoPassadoM / anoPassadoMesAtual))
  })
  return [
    { name: 'Clientes ativos', data: real },
    { name: 'Projeção', data: proj },
  ]
})

const graficoVendasAnual = async () => {
  try {
    const resposta = await dashboardAdmin.graficoVendasMes()
    const raw = resposta.data?.data ?? resposta.data
    let valoresAno = Array(12).fill(0)
    let valoresAnoAnterior = []
    let inadimplenciaMedia = 0.05

    if (Array.isArray(raw)) {
      raw.forEach((v, i) => { if (i < 12) valoresAno[i] = parseFloat(v) || 0 })
    } else if (raw && Array.isArray(raw.valores)) {
      raw.valores.forEach((v, i) => { if (i < 12) valoresAno[i] = parseFloat(v) || 0 })
      if (Array.isArray(raw.valoresAnoAnterior)) {
        const arr = raw.valoresAnoAnterior.map((v) => parseFloat(v) || 0)
        valoresAnoAnterior = Array(12).fill(0).map((_, i) => arr[i] ?? 0)
      }
      if (typeof raw.inadimplenciaMedia === 'number') inadimplenciaMedia = raw.inadimplenciaMedia
    }

    let inadimplenciaPorMes = Array(12).fill(0)
    if (raw && Array.isArray(raw.inadimplenciaPorMes)) {
      raw.inadimplenciaPorMes.forEach((v, i) => { if (i < 12) inadimplenciaPorMes[i] = parseFloat(v) || 0 })
    }
    vendasInadimplenciaData.value = inadimplenciaPorMes

    vendasData.value = valoresAno

    let trend
    if (raw && Array.isArray(raw.tendenciaPorMes) && raw.tendenciaPorMes.length >= 12) {
      trend = raw.tendenciaPorMes.map((v) => Math.round(parseFloat(v) * 100) / 100)
    } else {
      const temAnoAnterior = valoresAnoAnterior.length >= 12 && valoresAnoAnterior.some((v) => v > 0)
      if (temAnoAnterior) {
        trend = Array(12)
          .fill(0)
          .map((_, i) => Math.round((valoresAnoAnterior[i] ?? 0) * (1 - inadimplenciaMedia) * 100) / 100)
      } else {
        const mesAtual = new Date().getMonth()
        const inicio = Math.max(0, mesAtual - 5)
        const base = valoresAno.slice(inicio, mesAtual + 1)
        const media = base.length ? base.reduce((a, b) => a + b, 0) / base.length : 0
        const mediaVal = Math.round(media * 100) / 100
        trend = Array(12).fill(mediaVal)
      }
    }
    vendasTrendData.value = trend
    loading.value = false
  } catch (error) {
    vendasData.value = Array(12).fill(0)
    vendasTrendData.value = Array(12).fill(0)
    vendasInadimplenciaData.value = Array(12).fill(0)
    loading.value = false
  }
}

const graficoLeadsPorMes = async () => {
  try {
    const resposta = await dashboardAdmin.graficoLeadsPorMes()
    // Tenta diferentes estruturas de resposta
    const dados = Array.isArray(resposta.data) 
      ? resposta.data 
      : (resposta.data?.data || resposta.data || [])
    
    // Garante que seja um array com 12 elementos (um para cada mês)
    const mesesComDados = Array(12).fill(0)
    dados.forEach((valor, index) => {
      if (index < 12) {
        mesesComDados[index] = parseFloat(valor) || 0
      }
    })
    
    leadsData.value = mesesComDados
    loadingLeads.value = false
  } catch (error) {
    console.error('Erro ao carregar gráfico de leads:', error)
    leadsData.value = Array(12).fill(0)
    loadingLeads.value = false
  }
}

const dadosSetup = async () => {
  try {
    const resposta = await dashboardAdmin.setupAnual()
    // Tenta diferentes estruturas de resposta
    const dados = Array.isArray(resposta.data) 
      ? resposta.data 
      : (resposta.data?.data || resposta.data || [])
    
    // Garante que seja um array com 12 elementos (um para cada mês)
    const mesesComDados = Array(12).fill(0)
    dados.forEach((valor, index) => {
      if (index < 12) {
        mesesComDados[index] = parseFloat(valor) || 0
      }
    })
    
    setupData.value = mesesComDados
    loadingsetup.value = false
  } catch (error) {
    console.error('Erro ao carregar dados de setup:', error)
    setupData.value = Array(12).fill(0)
    loadingsetup.value = false
  }
}

async function carregarDetalheVendasMes() {
  const { mes, ano } = getMesAnoFromFiltro()
  if (!mes || !ano) return
  loadingDetalheVendas.value = true
  try {
    const res = await dashboardAdmin.primeirasTransacoesDetalheMes(mes, ano)
    const list = res.data?.data ?? res.data ?? []
    detalheVendasMes.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar detalhe vendas por mês:', err)
    detalheVendasMes.value = []
  } finally {
    loadingDetalheVendas.value = false
  }
}

const dadosPrimeirasTransacoes = async () => {
  try {
    const resposta = await dashboardAdmin.primeirasTransacoesAnual()
    const dados = Array.isArray(resposta.data)
      ? resposta.data
      : (resposta.data?.data || resposta.data || [])
    const mesesComDados = Array(12).fill(0)
    dados.forEach((valor, index) => {
      if (index < 12) {
        mesesComDados[index] = parseFloat(valor) || 0
      }
    })
    primeirasData.value = mesesComDados
  } catch (error) {
    console.error('Erro ao carregar primeiras transações:', error)
    primeirasData.value = Array(12).fill(0)
  } finally {
    loadingPrimeiras.value = false
  }
}

async function carregarDashboard() {
  if (store.state.Login?.token && !store.state.Login?.data) {
    try {
      await store.dispatch('Login/me')
    } catch (_) {}
  }

  loading.value = true
  loadingLeads.value = true
  loadingsetup.value = true
  loadingPrimeiras.value = true
  loadingSemUso.value = true
  loadingTopAcesso.value = true
  loadingRisco.value = true
  if (isPerfil1.value) loadingTopLancamentos.value = true

  const promises = [graficoLeadsPorMes(), dadosSetup()]
  if (isPerfil1ou6.value) promises.push(dadosPrimeirasTransacoes())
  if (isPerfil1.value) promises.unshift(graficoVendasAnual())
  await Promise.allSettled(promises)

  if (isPerfil1.value) {
    if (!lancamentosFaturamentoFiltro.value) {
      const d = new Date()
      lancamentosFaturamentoFiltro.value = `${d.getFullYear()}-${d.getMonth() + 1}`
    }
    await carregarTopLancamentosFaturamento()
  } else {
    loadingTopLancamentos.value = false
  }

  try {
    const res = await dashboardAdmin.clientesSemUso()
    const list = res.data?.data ?? res.data ?? []
    clientesSemUso.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar clientes sem uso:', err)
    clientesSemUso.value = []
  } finally {
    loadingSemUso.value = false
  }

  try {
    const res = await dashboardAdmin.crescimentoBase()
    const payload = res.data
    const list = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
    crescimentoBaseData.value = list.length >= 12 ? list.slice(0, 12) : Array(12).fill(0)
    const anoAnt = Array.isArray(payload?.dataAnoAnterior) ? payload.dataAnoAnterior : []
    crescimentoBaseDataAnoAnterior.value = anoAnt.length >= 12 ? anoAnt.slice(0, 12) : Array(12).fill(0)
    const cur = payload?.currentMonth
    crescimentoBaseCurrentMonth.value = typeof cur === 'number' && cur >= 1 && cur <= 12 ? cur : new Date().getMonth() + 1
  } catch (err) {
    console.error('Erro ao carregar crescimento da base:', err)
    crescimentoBaseData.value = Array(12).fill(0)
    crescimentoBaseDataAnoAnterior.value = Array(12).fill(0)
    crescimentoBaseCurrentMonth.value = new Date().getMonth() + 1
  }

  try {
    await carregarTopClientesAcesso(1)
  } catch (_) {}

  try {
    const res = await dashboardAdmin.clientesRiscoAbandono()
    const list = res.data?.data ?? res.data ?? []
    clientesRiscoAbandono.value = Array.isArray(list) ? list : []
  } catch (err) {
    console.error('Erro ao carregar clientes em risco:', err)
    clientesRiscoAbandono.value = []
  } finally {
    loadingRisco.value = false
  }

  if (isPerfil1.value && !isPerfil4.value) {
    try {
      const res = await dashboardAdmin.ticketMedio()
      const val = res.data?.data ?? res.data
      statsCards.value[5].value = val != null ? 'R$ ' + Number(val).toFixed(2).replace('.', ',') + '/dia' : '—'
    } catch (err) {
      statsCards.value[5].value = '—'
    }
  }

  try {
    const res = await dashboardAdmin.churn()
    statsCards.value[6].value = res.data?.data ?? res.data ?? 0
  } catch (err) {
    console.error('Erro ao carregar churn:', err)
    statsCards.value[6].value = 0
  }

  try {
    const qtdClientesRes = await dashboardAdmin.qtdclientes()
    statsCards.value[0].value = qtdClientesRes.data?.data || qtdClientesRes.data || 0
  } catch (error) {
    console.error('Erro ao carregar quantidade de clientes:', error)
    statsCards.value[0].value = 0
  }

  try {
    const ativosRes = await dashboardAdmin.qtdClientesAtivos()
    statsCards.value[1].value = ativosRes.data?.data ?? ativosRes.data ?? 0
  } catch (error) {
    console.error('Erro ao carregar clientes ativos:', error)
    statsCards.value[1].value = 0
  }

  if (isPerfil1.value) {
    try {
      const vendasRes = await dashboardAdmin.amountVendasMes()
      const result = vendasRes.data?.data || vendasRes.data || []
      if (Array.isArray(result)) {
        const totalMes = result.reduce((soma, item) => soma + parseFloat(item.amount || 0), 0)
        statsCards.value[2].value = 'R$ ' + totalMes.toFixed(2).replace('.', ',')
      } else {
        statsCards.value[2].value = 'R$ 0,00'
      }
    } catch (error) {
      console.error('Erro ao carregar vendas do mês:', error)
      statsCards.value[2].value = 'R$ 0,00'
    }
  }

  try {
    const leadsRes = await dashboardAdmin.qtdLeadsMesAtual()
    statsCards.value[3].value = leadsRes.data?.data || leadsRes.data || 0
  } catch (error) {
    console.error('Erro ao carregar quantidade de leads:', error)
    statsCards.value[3].value = 0
  }

  if (isPerfil1ou6.value) {
    try {
      const vendasMesRes = await dashboardAdmin.primeirasTransacoesMesAtual()
      const total = Number(vendasMesRes.data?.data ?? vendasMesRes.data ?? 0)
      statsCards.value[4].value = 'R$ ' + total.toFixed(2).replace('.', ',')
    } catch (error) {
      console.error('Erro ao carregar vendas mês atual (primeiras):', error)
      statsCards.value[4].value = 'R$ 0,00'
    }
  }
}

async function limparCacheERecarregar() {
  refreshing.value = true
  clearDashboardCache()
  try {
    await carregarDashboard()
    ElMessage.success('Cache limpo e dados atualizados')
  } finally {
    refreshing.value = false
  }
}

function onDashboardRefresh() {
  limparCacheERecarregar()
}

onMounted(() => {
  const d = new Date()
  const mesAno = `${d.getFullYear()}-${d.getMonth() + 1}`
  if (!vendasMesFiltro.value) vendasMesFiltro.value = mesAno
  if (!leadsMesFiltro.value) leadsMesFiltro.value = mesAno
  carregarDashboard()
  if (isPerfil1ou6.value) carregarDetalheVendasMes()
  carregarDetalheLeadsMes()
  window.addEventListener('dashboard-refresh', onDashboardRefresh)
})
onUnmounted(() => {
  window.removeEventListener('dashboard-refresh', onDashboardRefresh)
})
</script>

<style scoped>
:deep(.apexcharts-tooltip) {
  color: #fff !important;
}
:deep(.apexcharts-tooltip span),
:deep(.apexcharts-tooltip .apexcharts-tooltip-title) {
  color: #fff !important;
}
</style>
