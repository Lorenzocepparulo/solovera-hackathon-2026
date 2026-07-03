export const CONFIG = {
  LAUNCH_DATE: new Date('2026-09-26T07:00:00Z'),
  TOTAL_SEATS: 20,
  DEFAULT_SEATS_LEFT: 17,
  BASE_URL: 'https://hackathon.solovera.work',
  PRIZE_TARGET: 5000,
}

export async function fetchSeatsLeft(): Promise<number> {
  try {
    const res = await fetch('/api/seats')
    if (!res.ok) return CONFIG.DEFAULT_SEATS_LEFT
    const data = await res.json()
    return typeof data.seats === 'number' ? data.seats : CONFIG.DEFAULT_SEATS_LEFT
  } catch {
    return CONFIG.DEFAULT_SEATS_LEFT
  }
}

export function updateSeatsDisplay(count: number): void {
  const ids = ['seats-cta', 'seats-hero', 'seats-form', 'seats-sticky']
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el) el.textContent = String(count)
  }
}
