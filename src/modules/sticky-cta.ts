export function initStickyCta(): void {
  const s = document.getElementById('sticky-cta')
  if (!s) return

  let last = 0
  window.addEventListener('scroll', () => {
    const now = Date.now()
    if (now - last < 150) return
    last = now
    const hero = document.querySelector('.hero')
    if (!hero) return
    s.classList.toggle('show', window.scrollY > hero.getBoundingClientRect().height * 0.8)
  }, { passive: true })
}
