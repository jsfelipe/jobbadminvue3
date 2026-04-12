let sharedCtx: AudioContext | null = null
let userGestureListenersArmed = false

function getSharedCtx(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }
  if (sharedCtx) {
    return sharedCtx
  }
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) {
    return null
  }
  sharedCtx = new Ctor()
  return sharedCtx
}

async function tryResumeSharedAudio(): Promise<void> {
  const ctx = getSharedCtx()
  if (!ctx || ctx.state === 'closed') {
    return
  }
  try {
    await ctx.resume()
  } catch {
    /* noop */
  }
}

export function armTicketNotifyAudioOnUserGesture(): void {
  if (userGestureListenersArmed || typeof window === 'undefined') {
    return
  }
  userGestureListenersArmed = true
  const unlock = (): void => {
    void tryResumeSharedAudio()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { passive: true, capture: true })
  window.addEventListener('keydown', unlock, { capture: true })
}

export function playTicketNotifySound(): void {
  void playTicketNotifySoundInner()
}

async function playTicketNotifySoundInner(): Promise<void> {
  const ctx = getSharedCtx()
  if (!ctx) {
    return
  }
  try {
    await ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.35)
  } catch {
    /* noop */
  }
}
