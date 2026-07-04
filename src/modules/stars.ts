export function initStars(): void {
  const layer1 = document.getElementById('stars-layer1')
  const layer2 = document.getElementById('stars-layer2')
  const layer3 = document.getElementById('stars-layer3')
  if (!layer1 || !layer2 || !layer3) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  let ticking = false

  function onScroll(): void {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      const y = window.scrollY
      layer1.style.transform = `translateY(${y * -0.05}px)`
      layer2.style.transform = `translateY(${y * -0.1}px)`
      layer3.style.transform = `translateY(${y * -0.2}px)`
      ticking = false
    })
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
