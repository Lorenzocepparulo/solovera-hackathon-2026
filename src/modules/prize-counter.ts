import { CONFIG } from '../config'

export function initPrizeCounter(): void {
  const el = document.getElementById('prize-counter')
  if (!el) return

  const target = CONFIG.PRIZE_TARGET
  let startTime = 0
  const duration = 1500

  function animate(): void {
    if (!el) return
    const elapsed = Date.now() - startTime
    const progress = Math.min(1, elapsed / duration)
    const current = Math.floor(progress * target)
    el.textContent = '€' + current.toLocaleString()
    if (progress < 1) requestAnimationFrame(animate)
  }

  const ob = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      ob.disconnect()
      startTime = Date.now()
      animate()
    }
  })
  ob.observe(el)
}
