import { CONFIG } from '../config'

export function initCountdown(): void {
  const T = CONFIG.LAUNCH_DATE

  function update(): void {
    const now = Date.now()
    const diff = Math.max(0, T.getTime() - now)
    const dd = Math.floor(diff / 864e5)
    const hh = Math.floor((diff % 864e5) / 36e5)
    const mm = Math.floor((diff % 36e5) / 6e4)
    const ss = Math.floor((diff % 6e4) / 1e3)

    const ids = ['d', 'h', 'm', 's'] as const
    const vals = [dd, hh, mm, ss]
    for (let i = 0; i < ids.length; i++) {
      const els = document.querySelectorAll(`#cd-${ids[i]}`)
      els.forEach(el => el.textContent = String(vals[i]).padStart(2, '0'))
    }

    const cd = document.getElementById('countdown')
    if (cd) cd.classList.toggle('urgent', diff < 864e5)
  }

  update()
  setInterval(update, 1000)
}

export function startLaunchCountdown(elId: string): void {
  const T = CONFIG.LAUNCH_DATE
  const el = document.getElementById(elId)
  if (!el) return

  function update(): void {
    if (!el) return
    const now = Date.now()
    const diff = Math.max(0, T.getTime() - now)
    const dd = Math.floor(diff / 864e5)
    const hh = Math.floor((diff % 864e5) / 36e5)
    const mm = Math.floor((diff % 36e5) / 6e4)
    const ss = Math.floor((diff % 6e4) / 1e3)
    el.textContent = `${String(dd).padStart(2, '0')}:${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }

  update()
  setInterval(update, 1000)
}
