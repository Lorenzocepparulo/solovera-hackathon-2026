export function initReveal(): void {
  const els = document.querySelectorAll('.reveal')
  const ob = new IntersectionObserver(
    entries => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('on')
          ob.unobserve(e.target)
        }
      }
    },
  )
  els.forEach(e => ob.observe(e))
}
