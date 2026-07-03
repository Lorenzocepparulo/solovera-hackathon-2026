// Hackathon form handler — 3 backup layers: KV → Email → Google Drive CSV
export async function onRequest(context) {
  const { request, env } = context
  const BASE = 'https://hackaton.solovera.work'
  const FILE_ID = '1qK4H4kI0XV8catF9GumVuQ48leYZKOZx'

  if (request.method === 'GET') return new Response('Use POST to submit', { status: 405 })
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  try {
    const fd = await request.formData()
    const nome = (fd.get('name') || '').trim()
    const email = (fd.get('email') || '').trim()
    const phone = (fd.get('phone') || '').trim()
    const ruolo = fd.get('role') || ''
    const conferma = fd.get('conferma') || ''
    const disponibile = conferma === 'si' ? 'Sì' : 'No'
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19)

    if (!nome || !email) return Response.redirect(BASE + '/?error=missing', 302)

    // ── LAYER 1: KV (Cloudflare native, zero external deps) ──
    try {
      const regKey = 'reg:' + Date.now() + ':' + email.replace(/[^a-zA-Z0-9]/g, '_')
      if (env.HACKATHON_KV) {
        await env.HACKATHON_KV.put(regKey, JSON.stringify({
          nome, email, phone, ruolo, disponibile, timestamp
        }))
      }
    } catch (e) {
      console.error('KV error:', e.message)
    }

    // ── LAYER 2: Email (via Maton Gmail API) ──
    const key = env.MATON_API_KEY
    if (key) {
      try {
        const text = `Nuova registrazione Solovera AI Hackathon\n\nNome: ${nome}\nEmail: ${email}\nTelefono: ${phone || '—'}\nRuolo: ${ruolo || '—'}\nDisponibilità: ${disponibile}\n\nhackaton.solovera.work`
        const raw = btoa(
          'From: "Solovera Hackathon" <psigewebmarketing@gmail.com>\r\n' +
          'To: psigewebmarketing@gmail.com, info@solovera.it\r\n' +
          'Subject: Nuova iscrizione Hackathon - ' + nome + '\r\n' +
          'Content-Type: text/plain; charset=UTF-8\r\n\r\n' + text
        )
        await fetch('https://api.maton.ai/google-mail/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ raw }),
        })
      } catch (e) {
        console.error('Email error:', e.message)
      }
    }

    // ── LAYER 3: Google Drive CSV (via Maton Drive API) ──
    if (key) {
      try {
        const readRes = await fetch(
          'https://api.maton.ai/google-drive/drive/v3/files/' + FILE_ID + '?alt=media',
          { headers: { 'Authorization': 'Bearer ' + key } }
        )
        let csv = readRes.ok ? await readRes.text() : ''
        // Auto-detect header: if doesn't have Telefono, add it
        if (!csv.trim() || !csv.includes('Telefono')) {
          csv = 'Nome,Email,Telefono,Ruolo,Disponibile,DataOra'
        }
        const esc = v => v.includes(',') || v.includes('"') ? '"' + v.replace(/"/g, '""') + '"' : v
        const newRow = '\n' + [nome, email, phone, ruolo, disponibile, timestamp].map(esc).join(',')
        await fetch(
          'https://api.maton.ai/google-drive/upload/drive/v3/files/' + FILE_ID + '?uploadType=media',
          {
            method: 'PATCH',
            headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'text/csv' },
            body: csv + newRow,
          }
        )
      } catch (e) {
        console.error('GD error:', e.message)
      }
    }

    return Response.redirect(BASE + '/?success=1', 302)
  } catch (e) {
    console.error('Handler:', e.message)
    return Response.redirect(BASE + '/?error=exc', 302)
  }
}
