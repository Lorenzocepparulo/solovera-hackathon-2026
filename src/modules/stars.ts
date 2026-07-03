export function initStars(): void {
  const c = document.getElementById('stars') as HTMLCanvasElement | null
  if (!c) return

  const ctx = c.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  let W = window.innerWidth
  let H = window.innerHeight
  c.width = W * dpr
  c.height = H * dpr
  c.style.width = W + 'px'
  c.style.height = H + 'px'
  ctx.scale(dpr, dpr)

  interface Star {
    x: number
    y: number
    r: number
    a: number
    s: number
  }

  const stars: Star[] = []
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.3 + Math.random() * 1.2,
      a: 0.3 + Math.random() * 0.7,
      s: 0.2 + Math.random() * 0.6,
    })
  }

  let paused = false
  let raf = 0

  function draw(): void {
    if (paused) return
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    for (const s of stars) {
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      const p = 0.5 + 0.5 * Math.sin(Date.now() / 1000 * s.s + s.x)
      ctx.fillStyle = `rgba(244,242,255,${s.a * p})`
      ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }

  function start(): void {
    if (!paused) return
    paused = false
    raf = requestAnimationFrame(draw)
  }

  function stop(): void {
    paused = true
    if (raf) cancelAnimationFrame(raf)
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop()
    else start()
  })

  draw()

  let resizeTimer: ReturnType<typeof setTimeout>
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      W = window.innerWidth
      H = window.innerHeight
      c.width = W * dpr
      c.height = H * dpr
      c.style.width = W + 'px'
      c.style.height = H + 'px'
      ctx.scale(dpr, dpr)
      for (const s of stars) {
        s.x = Math.random() * W
        s.y = Math.random() * H
      }
    }, 200)
  })
}
