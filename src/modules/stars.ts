export function initStars(): void {
  const c = document.getElementById('stars') as HTMLCanvasElement | null
  if (!c) return

  const ctx = c.getContext('2d')
  if (!ctx) return

  let W = window.innerWidth
  let H = window.innerHeight
  c.width = W
  c.height = H

  interface Star {
    x: number
    y: number
    r: number
    a: number
    s: number
  }

  const stars: Star[] = []
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.3 + Math.random() * 1.2,
      a: 0.3 + Math.random() * 0.7,
      s: 0.2 + Math.random() * 0.6,
    })
  }

  function draw(): void {
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    for (const s of stars) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      const p = 0.5 + 0.5 * Math.sin(Date.now() / 1000 * s.s + s.x)
      ctx.fillStyle = `rgba(244,242,255,${s.a * p})`
      ctx.fill()
    }
    requestAnimationFrame(draw)
  }

  draw()

  window.addEventListener('resize', () => {
    W = window.innerWidth
    H = window.innerHeight
    c.width = W
    c.height = H
  })
}
