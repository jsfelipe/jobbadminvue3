<template>
  <FullScreenLayout>
    <div class="flex min-h-screen w-full flex-col lg:flex-row">
      <!-- Painel esquerdo: logo + texto -->
      <div
        class="relative flex flex-shrink-0 flex-col justify-between bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 px-6 py-8 text-white lg:w-[45%] lg:min-h-screen lg:px-12 lg:py-12 xl:px-16"
      >
        <div class="flex flex-col gap-8 lg:gap-12">
          <router-link
            to="/signin"
            class="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
            aria-label="Voltar ao login"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar ao login
          </router-link>
          <div class="mt-4 lg:mt-8">
            <img
              src="/images/logo/logo-jobb.svg"
              alt="Jobb"
              class="h-9 w-auto brightness-0 invert lg:h-11"
              width="120"
              height="40"
            />
            <h1 class="mt-8 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:mt-10 lg:text-4xl xl:text-[2.75rem]">
              Esqueceu a senha?
            </h1>
            <p class="mt-4 max-w-md text-base leading-relaxed text-white/90 sm:text-lg lg:mt-6">
              Informe o domínio e o e-mail cadastrado no seu usuário. A nova senha será enviada para esse e-mail.
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
              Redefinir senha
            </h2>
            <p class="mt-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-gray-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-gray-300">
              Para receber uma nova senha por e-mail, é necessário que o <strong>e-mail esteja cadastrado no seu usuário</strong>. A nova senha será enviada exclusivamente para esse e-mail. Caso não esteja cadastrado, entre em contato com o suporte.
            </p>
          </div>

          <form @submit.prevent="submitForm" class="space-y-6">
            <div>
              <label
                for="dominio"
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Domínio <span class="text-error-500">*</span>
              </label>
              <Field name="dominio" rules="required" v-slot="{ field, errorMessage }">
                <input
                  v-bind="field"
                  type="text"
                  id="dominio"
                  placeholder="Insira seu domínio"
                  autocomplete="organization"
                  class="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                  :class="{ 'border-error-500 focus:border-error-500 focus:ring-error-500/20': errorMessage }"
                />
                <span v-if="errorMessage" class="mt-1.5 block text-sm text-error-500">
                  {{ errorMessage }}
                </span>
              </Field>
            </div>

            <div>
              <label
                for="email"
                class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                E-mail <span class="text-error-500">*</span>
              </label>
              <Field name="email" rules="required|email" v-slot="{ field, errorMessage }">
                <input
                  v-bind="field"
                  type="email"
                  id="email"
                  placeholder="Insira o e-mail cadastrado no seu usuário"
                  autocomplete="email"
                  class="h-14 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                  :class="{ 'border-error-500 focus:border-error-500 focus:ring-error-500/20': errorMessage }"
                />
                <span v-if="errorMessage" class="mt-1.5 block text-sm text-error-500">
                  {{ errorMessage }}
                </span>
              </Field>
            </div>

            <div class="pt-2">
              <button
                type="submit"
                class="flex h-14 w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-60 dark:focus:ring-offset-gray-900"
                :disabled="loading"
              >
                <span v-if="loading">Enviando...</span>
                <span v-else>Enviar nova senha por e-mail</span>
              </button>
            </div>
          </form>

          <p class="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            Lembrou a senha?
            <router-link
              to="/signin"
              class="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300"
            >
              Voltar ao login
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { defineRule, Field, useForm } from 'vee-validate'
import { required, email } from '@vee-validate/rules'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { redefinirSenha } from '@/services/auth'
import { toast } from 'vue3-toastify'

defineRule('required', required)
defineRule('email', email)

const { handleSubmit } = useForm()
const loading = ref(false)

const submitForm = handleSubmit(async (values: { dominio: string; email: string }) => {
  loading.value = true
  try {
    const result = await redefinirSenha(values.dominio, values.email)
    if (result?.success) {
      toast.success(result.msg ?? 'Nova senha enviada por e-mail. Verifique sua caixa de entrada.', {
        autoClose: 5000,
      })
    } else {
      toast.error(result?.msg ?? 'Não foi possível enviar a nova senha. Verifique domínio e e-mail.', {
        autoClose: 4000,
      })
    }
  } catch (error: unknown) {
    console.error('Redefinir senha failed:', error)
    const err = error as { response?: { data?: { msg?: string } } }
    const msg = err?.response?.data?.msg
    toast.error(msg ?? 'Erro ao solicitar nova senha. Tente novamente.', {
      autoClose: 4000,
    })
  } finally {
    loading.value = false
  }
})
</script>
