<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <header class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <img src="/images/logo/logo-jobb.svg" alt="Jobb" class="h-8 w-auto" />
          <h1 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Portal de Chamados</h1>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>
