export function initComets(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const comet = document.createElement('div')
  comet.className = 'comet'
  comet.style.display = 'none'
  document.body.appendChild(comet)

  function spawn(): void {
    if (document.hidden) return
    comet.style.left = (Math.random() * 80 + 10) + '%'
    comet.style.top = (Math.random() * 50) + '%'
    const ang = -30 + Math.random() * 60
    comet.style.setProperty('--ang', ang + 'deg')
    comet.style.setProperty('--dx', (Math.cos(ang * Math.PI / 180) * 150) + 'px')
    comet.style.setProperty('--dy', (Math.sin(ang * Math.PI / 180) * 150) + 'px')
    comet.style.display = ''
    comet.getAnimations().forEach(a => a.cancel())
    comet.style.animation = ''
    setTimeout(() => { comet.style.display = 'none' }, 1200)
  }

  setInterval(spawn, 8000)
  spawn()
}
