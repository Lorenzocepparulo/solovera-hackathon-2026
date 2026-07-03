interface Env {
  HACKATHON_KV?: KVNamespace
  MATON_API_KEY?: string
}

interface FormDataFields {
  nome: string
  email: string
  phone: string
  ruolo: string
  disponibile: string
}

const BASE = 'https://hackaton.solovera.work'
const FILE_ID = '1qK4H4kI0XV8catF9GumVuQ48leYZKOZx'

function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown'
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  if (!phone) return false
  return /^[\d\s\-\+\(\)]{7,20}$/.test(phone.replace(/\s/g, ''))
}

async function checkRateLimit(env: Env, ip: string): Promise<boolean> {
  if (!env.HACKATHON_KV) return true
  const windowKey = new Date().toISOString().slice(0, 13)
  const key = `ratelimit:${ip}:${windowKey}`
  try {
    const count = parseInt((await env.HACKATHON_KV.get(key)) || '0', 10)
    if (count >= 10) return false
    await env.HACKATHON_KV.put(key, String(count + 1), { expirationTtl: 3600 })
    return true
  } catch {
    return true
  }
}

async function saveToKV(env: Env, data: FormDataFields): Promise<void> {
  if (!env.HACKATHON_KV) return
  const regKey = 'reg:' + Date.now() + ':' + data.email.replace(/[^a-zA-Z0-9]/g, '_')
  await env.HACKATHON_KV.put(regKey, JSON.stringify(data))
}

function buildEmailContent(data: FormDataFields): string {
  const text = [
    'Nuova registrazione Solovera AI Hackathon\n',
    `Nome: ${data.nome}`,
    `Email: ${data.email}`,
    `Telefono: ${data.phone || '—'}`,
    `Ruolo: ${data.ruolo || '—'}`,
    `Disponibilità: ${data.disponibile}\n`,
    'hackaton.solovera.work',
  ].join('\n')

  const raw = btoa(
    'From: "Solovera Hackathon" <psigewebmarketing@gmail.com>\r\n' +
    'To: psigewebmarketing@gmail.com, info@solovera.it\r\n' +
    `Subject: Nuova iscrizione Hackathon - ${data.nome}\r\n` +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    text
  )
  return raw
}

async function sendEmail(env: Env, data: FormDataFields): Promise<void> {
  const key = env.MATON_API_KEY
  if (!key) return

  const raw = buildEmailContent(data)
  await fetch('https://api.maton.ai/google-mail/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
}

function csvEscape(v: string): string {
  return v.includes(',') || v.includes('"') ? '"' + v.replace(/"/g, '""') + '"' : v
}

async function appendToDrive(env: Env, data: FormDataFields): Promise<void> {
  const key = env.MATON_API_KEY
  if (!key) return

  const readRes = await fetch(
    'https://api.maton.ai/google-drive/drive/v3/files/' + FILE_ID + '?alt=media',
    { headers: { Authorization: 'Bearer ' + key } }
  )
  let csv = readRes.ok ? await readRes.text() : ''
  if (!csv.trim() || !csv.includes('Telefono')) {
    csv = 'Nome,Email,Telefono,Ruolo,Disponibile,DataOra'
  }

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const newRow = [data.nome, data.email, data.phone, data.ruolo, data.disponibile, timestamp]
    .map(csvEscape).join(',')

  await fetch(
    'https://api.maton.ai/google-drive/upload/drive/v3/files/' + FILE_ID + '?uploadType=media',
    {
      method: 'PATCH',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'text/csv' },
      body: csv + '\n' + newRow,
    }
  )
}

function redirect(path: string, status: number = 302): Response {
  return Response.redirect(BASE + path, status)
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  if (request.method === 'GET') return new Response('Use POST to submit', { status: 405 })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const ip = getClientIP(request)

    const allowed = await checkRateLimit(env, ip)
    if (!allowed) {
      return redirect('/?error=rate')
    }

    const fd = await request.formData()
    const nome = ((fd.get('name') as string) || '').trim()
    const email = ((fd.get('email') as string) || '').trim()
    const phone = ((fd.get('phone') as string) || '').trim()
    const ruolo = (fd.get('role') as string) || ''
    const conferma = (fd.get('conferma') as string) || ''
    const disponibile = conferma === 'si' ? 'Sì' : 'No'

    if (!nome || !email) return redirect('/?error=missing')
    if (!validateEmail(email)) return redirect('/?error=bad_email')
    if (!validatePhone(phone)) return redirect('/?error=bad_phone')

    const data: FormDataFields = { nome, email, phone, ruolo, disponibile }

    await Promise.allSettled([
      saveToKV(env, data),
      sendEmail(env, data).catch(() => {}),
      appendToDrive(env, data).catch(() => {}),
    ])

    return redirect('/?success=1')
  } catch (e) {
    console.error('Handler:', e instanceof Error ? e.message : e)
    return redirect('/?error=exc')
  }
}
