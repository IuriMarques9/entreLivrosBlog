import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimitDistributed, getRequestIp } from '@/lib/rate-limit'

// Double opt-in confirmation landing. A subscription created via
// subscribeNewsletter starts unconfirmed and receives no content until the
// reader opens this link. Styled to match the unsubscribe route (same warm
// palette, Playfair headings, terracotta button).
function shell(title: string, inner: string, ok: boolean) {
  const accent = ok ? 'hsl(20 8% 40%)' : 'hsl(0 60% 42%)'
  return `<!doctype html>
<html lang="pt">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${title} · Entre Livros</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet" />
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:48px 20px;background:hsl(36 33% 97%);color:hsl(20 10% 15%);font-family:'Source Sans 3',system-ui,sans-serif">
    <main style="width:100%;max-width:440px;background:hsl(36 30% 95%);border:1px solid hsl(30 15% 85%);border-radius:14px;padding:40px 32px;text-align:center;box-shadow:0 1px 3px rgba(20,16,12,.05)">
      <p style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:hsl(20 8% 50%);margin:0 0 18px">Newsletter</p>
      <h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:600;font-size:26px;line-height:1.25;margin:0 0 14px;color:hsl(20 10% 15%)">${title}</h1>
      <div style="font-size:16px;line-height:1.65;color:${accent}">${inner}</div>
    </main>
  </body>
</html>`
}

function html(title: string, inner: string, ok: boolean, status = 200) {
  return new Response(shell(title, inner, ok), {
    status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

const LINK_BACK =
  'display:inline-block;margin-top:24px;color:hsl(16 65% 45%);text-decoration:none;font-weight:500;font-size:15px'

function backLink() {
  return `<a href="/" style="${LINK_BACK}">Voltar ao site</a>`
}

// Validate the token shape before touching the DB.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token || !UUID_RE.test(token)) {
    return html(
      'Link inválido',
      `<p style="margin:0">Falta o código de confirmação.</p>${backLink()}`,
      false,
      400
    )
  }

  const ip = await getRequestIp()
  const rl = await rateLimitDistributed(`confirm:${ip}`, 20, 10 * 60 * 1000)
  if (!rl.allowed) {
    return html(
      'Demasiados pedidos',
      `<p style="margin:0">Recebemos demasiados pedidos deste dispositivo. Tenta novamente mais tarde.</p>${backLink()}`,
      false,
      429
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('newsletter_confirm', {
    p_token: token,
  })

  if (error) {
    console.error('Confirm error:', error)
    return html(
      'Algo correu mal',
      `<p style="margin:0">Não foi possível confirmar agora. Tenta de novo mais tarde.</p>${backLink()}`,
      false,
      500
    )
  }

  if (data === true) {
    return html(
      'Subscrição confirmada',
      `<p style="margin:0">Está tudo certo — a partir de agora recebes um email sempre que houver novidades no Entre Livros.</p>${backLink()}`,
      true
    )
  }

  // Token not found or already confirmed. Either way the reader's intent —
  // being a confirmed subscriber — is met (or the link is stale).
  return html(
    'Subscrição confirmada',
    `<p style="margin:0">A tua subscrição já estava confirmada. Não precisas de fazer mais nada.</p>${backLink()}`,
    true
  )
}
