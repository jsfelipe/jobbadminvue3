import './assets/main.css'
import './assets/meu-estilo.css'

// Handsontable: registra todos os cell types (autocomplete, numeric, etc.) para uso com HotTable
import Handsontable from 'handsontable/base'
import { registerAllModules } from 'handsontable/registry'
registerAllModules()

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router/index.js'
import store from './store/index.js'
import VueApexCharts from 'vue3-apexcharts'
import ElementPlus from 'element-plus'
import ptBr from 'element-plus/es/locale/lang/pt-br'
import { api, $api, bucketS3 } from './services/http'
import notificationPlugin from './plugins/notification'
import 'element-plus/dist/index.css'
import './assets/element-overrides.css'
import './assets/jobb-table.css'
import './assets/sweetalert_button.css'
import '@fortawesome/fontawesome-free/css/all.css'

import numbro from 'numbro'
import ptBR from 'numbro/languages/pt-BR'

numbro.registerLanguage(ptBR)
numbro.setLanguage('pt-BR')

// Configuração do i18n
const i18n = createI18n({
  legacy: false,
  locale: 'pt-br',
  fallbackLocale: 'pt-br',
  messages: {
    'pt-br': {
      padrao: {
        cadastrar: 'Cadastrar',
        excluirVarios: 'Excluir Vários',
        unificar: 'Unificar',
        importar: 'Importar',
        CCPersonalizados: 'Campos Personalizados',
        configColunas: 'Configurar Colunas',
        periodo: 'Período',
        pesquisar: 'Pesquisar',
        fechar: 'Fechar',
        confirmar: 'Confirmar',
        criteriosPesquisa: 'Critérios de pesquisa',
        camposPersonalizados: 'Campos personalizados'
      },
      pessoa: {
        nomeRazao: 'Nome/Razão Social',
        fantasiaEmail: 'Fantasia/Email',
        cpfCnpj: 'CPF/CNPJ',
        camposPersonalizados: 'Campos Personalizados',
        criarCampoP: 'Criar campo personalizado',
        txtComoUnificar: 'Selecione na tabela qual registro será o principal (destino da unificação). Os demais serão fundidos nele.'
      },
      dadosgerais: {
        categoria: 'Categoria',
        cidade: 'Cidade',
        logradouro: 'Logradouro',
        fone: 'Telefone',
        celular: 'Celular',
        email: 'Email',
        uf: 'UF'
      }
    }
  }
})

const app = createApp(App)
// Adiciona $api como uma propriedade global
app.config.globalProperties.$api = $api
app.config.globalProperties.$bucketS3 = bucketS3

app.config.globalProperties.$http = (token) => $api(token)
app.config.globalProperties.$rt = router

app.use(router)
app.use(store)
app.use(ElementPlus, { locale: ptBr })
app.use(VueApexCharts)
app.use(notificationPlugin)
app.use(i18n)

app.mount('#app')
