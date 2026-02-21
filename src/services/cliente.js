import { api } from '@/services/http'

/**
 * Serviços de cliente para API jobbadmin (porta 8001)
 */

export const clienteService = {
  listar: (params) => {
    // Salva filtros no localStorage (igual ao projeto antigo)
    localStorage.setItem("searchClientes", JSON.stringify(params))
    const savedParams = JSON.parse(localStorage.getItem("searchClientes"))
    return api.get("/clientes", { params: savedParams })
  },

  listarDesbloqueio: (params) => {
    localStorage.setItem("searchDesbloqueio", JSON.stringify(params))
    const savedParams = JSON.parse(localStorage.getItem("searchDesbloqueio"))
    return api.get("/clientes", { params: savedParams })
  },

  listarId: (id) => {
    return api.get(`/clientes/${id}`)
  },

  listarResponsaveis: () => {
    return api.get('/clientes/responsaveis/listar')
  },

  listarObs: (id) => {
    return api.get(`observacoes/${id}`)
  },

  alterarObs: (id, obs) => {
    return api.put(`observacoes/${id}`, { obs })
  },

  salvarObs: (id, obs) => {
    return api.post(`observacoes/`, {
      id_cliente: id,
      obs: obs,
    })
  },

  listarboletos: (id) => {
    return api.get(`payment/${id}`)
  },

  cadastrar: (cliente) => {
    return api.post("/clientes", {
      empresa: cliente.empresa,
      nome: cliente.nome,
      uf: cliente.uf,
      tipo_jobb: cliente.tipojobb,
      subdominio: cliente.subdominio,
      email: cliente.email,
      telefone: cliente.telefone,
      login: cliente.login,
      senha: cliente.senha,
    })
  },

  alterar: async (data) => {
    try {
      const response = await api.put(`/clientes/${data.id_cliente}`, data)
      return { ...response, status: true }
    } catch (error) {
      return { ...error.response?.data, status: false }
    }
  },

  apagarBoleto: (transaction_id) => {
    return api.post(`payment/apagarboleto`, {
      id_user: 4,
      transaction_id: transaction_id,
    })
  },

  novoBoleto: (amount, data, row) => {
    return api.post(`payment/novoboleto`, {
      amount: amount,
      boleto_expiration_date: data,
      user: 4,
      cliente_id: row.cliente_id,
      competencia_mes: row.competencia_mes,
      competencia_ano: row.competencia_ano,
      email: row.email,
    })
  },

  boletoAvulso: (amount, data, idCliente) => {
    return api.post(`payment/novoboleto`, {
      amount: amount,
      boleto_expiration_date: data,
      user: 4,
      cliente_id: idCliente,
    })
  },

  getNotas: async (id) => {
    const axios = (await import('axios')).default
    const paymentApiUrl = import.meta.env.VITE_PAYMENT_API || 
      (import.meta.env.PROD ? 'https://paymentv2.sistemajobb.com.br' : 'http://localhost:9093')
    return axios.get(`${paymentApiUrl}/api/nfes`, {
      params: {
        id_user: 'J',
        cliente_id: id,
      },
    })
  },

  createNF: async (data) => {
    const axios = (await import('axios')).default
    const paymentApiUrl = import.meta.env.VITE_PAYMENT_API || 
      (import.meta.env.PROD ? 'https://paymentv2.sistemajobb.com.br' : 'http://localhost:9093')
    return axios.post(`${paymentApiUrl}/api/create-nf`, {
      id_user: 1,
      clientIdConexa: data.clientIdConexa,
      transaction_id: data.transaction_id,
      amount: parseFloat(data.amount),
    })
  },

  consultarStatusNF: async (nfId, transactionId) => {
    const axios = (await import('axios')).default
    const paymentApiUrl = import.meta.env.VITE_PAYMENT_API || 
      (import.meta.env.PROD ? 'https://paymentv2.sistemajobb.com.br' : 'http://localhost:9093')
    return axios.get(`${paymentApiUrl}/api/nfes/status`, {
      params: {
        nf_id: nfId || null,
        transaction_id: transactionId || null,
      },
    })
  },
}
