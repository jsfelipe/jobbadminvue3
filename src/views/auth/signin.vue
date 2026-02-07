<template>
  <FullScreenLayout>
    <div class="flex min-h-screen w-full flex-col lg:flex-row">
      <!-- Painel esquerdo: logo + texto (cores do projeto) -->
      <div
        class="relative flex flex-shrink-0 flex-col justify-between bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 px-6 py-8 text-white lg:w-[45%] lg:min-h-screen lg:px-12 lg:py-12 xl:px-16"
      >
        <div class="flex flex-col gap-8 lg:gap-12">
          <div class="mt-4 lg:mt-8">
            <img
              src="/images/logo/logo-jobb.svg"
              alt="Jobb"
              class="h-9 w-auto brightness-0 invert lg:h-11"
              width="120"
              height="40"
            />
            <h1 class="mt-8 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:mt-10 lg:text-4xl xl:text-[2.75rem]">
              Painel administrativo Jobb
            </h1>
            <p class="mt-4 max-w-md text-base leading-relaxed text-white/90 sm:text-lg lg:mt-6">
              Acesso restrito à equipe interna. Gerencie clientes, usuários e operações do sistema.
            </p>
          </div>
        </div>
        <p class="mt-8 hidden text-sm text-white/70 lg:block">
          Sistema Jobb 4.0 · Gestão integrada para sua empresa
        </p>
      </div>

      <!-- Painel direito: formulário -->
      <div
        class="flex flex-1 flex-col justify-center bg-gray-50 px-6 py-10 dark:bg-gray-900 sm:px-10 lg:px-14 lg:py-12 xl:px-20"
      >
        <div class="mx-auto w-full max-w-md">
          <div class="mb-8 lg:mb-10">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
              Acessar
            </h2>
            <p class="mt-2 text-base text-gray-500 dark:text-gray-400">
              Digite seu login e senha para entrar.
            </p>
          </div>

          <div
            v-if="loginError"
            class="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
            role="alert"
          >
            {{ loginError }}
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label
                for="email"
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                E-mail <span class="text-error-500">*</span>
              </label>
              <Field name="email" rules="required" v-slot="{ field, errorMessage }">
                <input
                  v-bind="field"
                  type="email"
                  id="email"
                  placeholder="Insira seu e-mail"
                  autocomplete="username"
                  class="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500 dark:focus:ring-gray-500/20"
                  :class="{ 'border-error-500 focus:border-error-500 focus:ring-error-500/20': errorMessage }"
                />
                <span v-if="errorMessage" class="mt-1.5 block text-sm text-error-500">
                  {{ errorMessage }}
                </span>
              </Field>
            </div>

            <div>
              <label
                for="senha"
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Senha <span class="text-error-500">*</span>
              </label>
              <Field name="password" rules="required" v-slot="{ field, errorMessage }">
                <div class="relative">
                  <input
                    v-bind="field"
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    placeholder="Insira sua senha"
                    autocomplete="current-password"
                    class="h-14 w-full rounded-xl border border-gray-300 bg-white py-3 pl-4 pr-14 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-gray-500 dark:focus:ring-gray-500/20"
                    :class="{ 'border-error-500 focus:border-error-500 focus:ring-error-500/20': errorMessage }"
                  />
                  <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                  >
                    <svg
                      v-if="!showPassword"
                      class="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  </button>
                </div>
                <span v-if="errorMessage" class="mt-1.5 block text-sm text-error-500">
                  {{ errorMessage }}
                </span>
              </Field>
            </div>

            <div class="flex justify-end">
              <router-link
                to="/esqueci-senha"
                class="text-sm font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Esqueci a senha
              </router-link>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="flex h-14 w-full items-center justify-center rounded-xl bg-gray-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-gray-900"
                :disabled="loading"
              >
                <span v-if="loading">Entrando...</span>
                <span v-else>Entrar</span>
              </button>
            </div>
          </form>

          <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Ainda não tem uma conta?
            <router-link
              to="/signup"
              class="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cadastre-se
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useStore } from 'vuex'
import { defineRule, Field, useForm } from 'vee-validate'
import { required } from '@vee-validate/rules'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { toast } from 'vue3-toastify'

defineRule('required', required)

const store = useStore()
const { handleSubmit } = useForm()

const loading = ref(false)
const showPassword = ref(false)
const loginError = ref('')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const submitForm = handleSubmit(async (values) => {
  loading.value = true
  loginError.value = ''
  try {
    await store.dispatch('Login/doLogin', values)
    
    // Tenta buscar dados do usuário, mas não bloqueia o login se falhar
    let user = null
    try {
      user = await store.dispatch('Login/me')
    } catch (meError) {
      console.warn('Erro ao buscar dados do usuário:', meError)
      // Continua mesmo se /auth/me falhar
    }

    // Se conseguiu buscar os dados do usuário, carrega permissões
    if (user && user.id_usuario_tipo) {
      try {
        await Promise.all([
          store.dispatch('Perfil/listarPermissoesUsuarios', user.id_usuario_tipo),
          store.dispatch('Permissoes/listarPermissaoUsuario', user),
        ])
      } catch (permError) {
        console.warn('Erro ao carregar permissões:', permError)
        // Continua mesmo se permissões falharem
      }
    }

    // Removido sessionUser - não usa mais API V2

    toast.success('Login realizado com sucesso!', {
      autoClose: 3000,
    })

    window.location.href = '/admin/overview'
  } catch (error: unknown) {
    console.error('Login failed:', error)

    const err = error as { response?: { data?: { msg?: string; message?: string } } }
    const msg = err?.response?.data?.msg ?? err?.response?.data?.message
    const errorMsg = msg || 'Erro ao realizar login. Verifique e-mail e senha e tente novamente.'
    loginError.value = errorMsg
    toast.error(errorMsg, { autoClose: 15000 })
  } finally {
    loading.value = false
  }
})
</script>
