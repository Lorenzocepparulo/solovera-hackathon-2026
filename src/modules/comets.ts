export function initComets(): void {
  function spawn(): void {
    const c = document.createElement('div')
    c.className = 'comet'
    c.style.left = (Math.random() * 80 + 10) + '%'
    c.style.top = (Math.random() * 50) + '%'
    const ang = -30 + Math.random() * 60
    c.style.setProperty('--ang', ang + 'deg')
    c.style.setProperty('--dx', (Math.cos(ang * Math.PI / 180) * 150) + 'px')
    c.style.setProperty('--dy', (Math.sin(ang * Math.PI / 180) * 150) + 'px')
    document.body.appendChild(c)
    setTimeout(() => c.remove(), 1200)
  }

  setInterval(spawn, 8000)
  spawn()
}
