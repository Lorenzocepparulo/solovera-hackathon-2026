import { startLaunchCountdown } from './countdown'

export function initForm(): void {
  const f = document.getElementById('hack-form') as HTMLFormElement | null
  const o = document.getElementById('launch-overlay')
  const os = document.getElementById('form-success')
  if (!f || !o || !os) return

  f.addEventListener('submit', function (e) {
    e.preventDefault()
    const fd = new FormData(f)

    fetch(f.action, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
      .catch(() => { /* silent fallback - server handles redirect */ })

    f.style.display = 'none'
    os.style.display = 'block'

    setTimeout(() => {
      o.classList.add('on')
      setTimeout(() => o.classList.add('launching'), 100)
      setTimeout(() => {
        o.classList.remove('launching')
        o.classList.add('landed')
      }, 2400)
      startLaunchCountdown('lo-cd')
    }, 800)
  })
}
