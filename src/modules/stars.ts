let warpScaleX = 1
let warpScaleY = 1
let warpRotation = 0
let warpActive = false

export function initStars(): void {
  const layer1 = document.getElementById('stars-layer1')
  const layer2 = document.getElementById('stars-layer2')
  const layer3 = document.getElementById('stars-layer3')
  if (!layer1 || !layer2 || !layer3) return

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const multipliers = [0.05, 0.1, 0.2]
  const layers = [layer1, layer2, layer3]
  let ticking = false

  function applyTransforms() {
    const y = window.scrollY
    layers.forEach((layer, i) => {
      const scrollY = y * -multipliers[i]
      const sx = warpActive ? warpScaleX : 1
      const sy = warpActive ? warpScaleY : 1
      const rot = warpActive ? warpRotation : 0
      layer.style.transform = `translateY(${scrollY}px) scale(${sx},${sy}) rotate(${rot}deg)`
    })
  }

  function onScroll(): void {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => {
      applyTransforms()
      ticking = false
    })
  }

  window.addEventListener('warp:tick', ((e: CustomEvent) => {
    warpActive = true
    warpScaleX = e.detail.scaleX
    warpScaleY = e.detail.scaleY
    warpRotation = e.detail.rotation
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => {
        applyTransforms()
        ticking = false
      })
    }
  }) as EventListener)

  window.addEventListener('warp:exit', () => {
    warpActive = false
    warpScaleX = 1
    warpScaleY = 1
    warpRotation = 0
  })

  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}
