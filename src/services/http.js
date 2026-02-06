import axios from 'axios'
import swal from 'sweetalert2'

// Função para criar instâncias da API
const createInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    timeout: 60000,
  })

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const { response, config } = error
      if (!response) return Promise.reject(error)

      const { status } = response
      const { _retry } = config

      if (status === 409 && !_retry) {
        let isInterceptorExecuted = false

        if (!isInterceptorExecuted) {
          isInterceptorExecuted = true

          let countdown = localStorage.getItem('countdown') || 10

          function updateCountdownButton() {
            if (countdown >= 0) {
              const okButton = document.querySelector('.swal2-confirm')
              if (okButton) {
                okButton.textContent = `OK (${countdown})`
                okButton.disabled = true
              }
              countdown--
              localStorage.setItem('countdown', countdown)
              setTimeout(updateCountdownButton, 1000)
            } else {
              const okButton = document.querySelector('.swal2-confirm')
              if (okButton) {
                okButton.textContent = 'OK'
                okButton.disabled = false
              }
              localStorage.removeItem('countdown')
            }
          }

          swal
            .fire({
              title: 'Sessão Expirada',
              text: 'Sua sessão expirou. Por favor, faça login novamente.',
              icon: 'warning',
              confirmButtonText: 'OK',
              allowOutsideClick: false,
              allowEscapeKey: false,
            })
            .then(() => {
              localStorage.removeItem('auth-jobb')
              window.location.href = '/signin'
            })

          updateCountdownButton()
        }

        config._retry = true
        return Promise.reject(error)
      }

      if (status === 401) {
        localStorage.removeItem('auth-jobb')
        delete api.defaults.headers.common['Authorization']
        window.location.href = '/signin'
      }

      return Promise.reject(error)
    }
  )

  return instance
}

// Cria instância da API principal
const api = createInstance(import.meta.env.VITE_API || 'http://localhost:8001/api')

// apiV2 aponta para a mesma instância da API principal (não usa mais API V2)
const apiV2 = api

// Bucket S3
const bucketS3 = import.meta.env.VITE_APP_BUCKET_S3 || ''

// Inicializa token se existir no localStorage
const token = localStorage.getItem('auth-jobb')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Interceptador para adicionar o token de autenticação nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-jobb')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Função global $api
const $api = (token) => {
  let headers = {
    'Content-type': 'application/json',
  }

  if (token) {
    Object.assign(headers, { Authorization: `${token}` })
  }

  return api
}

export { api, apiV2, $api, bucketS3 }
