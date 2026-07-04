export function initWarp(): void {
  const btn = document.querySelector('.btn-warp') as HTMLElement | null
  if (!btn) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const ENTER_DURATION = 700
  const MAX_SCALE_X = 5
  const MAX_SCALE_Y = 3
  const MAX_ROTATION = 15

  let active = false
  let rafId = 0
  let warpStart = 0

  function engage() {
    if (active) return
    active = true
    document.body.setAttribute('data-warp', '')
    warpStart = performance.now()
    tick()
  }

  function disengage() {
    if (!active) return
    active = false
    document.body.removeAttribute('data-warp')
    cancelAnimationFrame(rafId)
    window.dispatchEvent(new CustomEvent('warp:exit'))
  }

  function tick() {
    if (!active) return
    const elapsed = (performance.now() - warpStart) / 1000
    const t = Math.min(elapsed / (ENTER_DURATION / 1000), 1)
    const eased = t * t * (3 - 2 * t)
    const scaleX = 1 + (MAX_SCALE_X - 1) * eased
    const scaleY = 1 + (MAX_SCALE_Y - 1) * eased
    const rotation = MAX_ROTATION * eased

    window.dispatchEvent(new CustomEvent('warp:tick', {
      detail: { scaleX, scaleY, rotation }
    }))

    rafId = requestAnimationFrame(tick)
  }

  btn.addEventListener('mouseenter', engage)
  btn.addEventListener('mouseleave', disengage)
  btn.addEventListener('focus', engage)
  btn.addEventListener('blur', disengage)

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && active) disengage()
  })
}
