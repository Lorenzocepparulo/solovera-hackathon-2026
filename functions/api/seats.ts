interface Env {
  HACKATHON_KV?: KVNamespace
}

const TOTAL_SEATS = 20
const DEFAULT_SEATS_LEFT = 17

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context

  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    if (env.HACKATHON_KV) {
      const stored = await env.HACKATHON_KV.get('config:seats')
      if (stored !== null) {
        const seats = parseInt(stored, 10)
        if (!isNaN(seats) && seats >= 0 && seats <= TOTAL_SEATS) {
          return new Response(JSON.stringify({ seats }), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
          })
        }
      }
    }

    return new Response(JSON.stringify({ seats: DEFAULT_SEATS_LEFT }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    })
  } catch (e) {
    console.error('Seats API error:', e instanceof Error ? e.message : e)
    return new Response(JSON.stringify({ seats: DEFAULT_SEATS_LEFT }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
