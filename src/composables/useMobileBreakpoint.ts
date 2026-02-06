/**
 * Composable para detectar viewport mobile (breakpoint 768px).
 * Usado para trocar HandsOnTable por tabela de itens simplificada no orçamento trabalho.
 */
import { ref, onMounted, onUnmounted } from 'vue'

const MOBILE_BREAKPOINT = 768

export function useMobileBreakpoint() {
  const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false)

  function update() {
    if (typeof window === 'undefined') return
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { isMobile }
}
