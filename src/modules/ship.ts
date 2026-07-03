export function initShip(): void {
  const ship = document.getElementById('ship')
  const tl = document.getElementById('timeline')
  if (!ship || !tl) return

  const ob = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      let last = 0
      const update = () => {
        const now = Date.now()
        if (now - last < 150) return
        last = now
        const r = tl.getBoundingClientRect()
        const total = r.height - 100
        const p = Math.max(0, Math.min(1, (-r.top + 100) / total))
        ship.style.top = (p * 100) + '%'
      }
      window.addEventListener('scroll', update, { passive: true })
      ob.disconnect()
    }
  })
  ob.observe(tl)
}
