import nodemailer from 'nodemailer'

// Use || (not ??) so an empty-string env var still falls back to the real
// domain — otherwise email links become relative ("/newsletter/...") and 404
// from inside the reader's webmail.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.entrelivrosblog.pt'

const FROM =
  process.env.SMTP_FROM ?? 'Entre Livros <newsletter@entrelivrosblog.pt>'

export interface SubscriberTarget {
  email: string
  unsubscribe_token: string
}

export interface NewContentEmail {
  url: string
}

export interface ConfirmTarget {
  email: string
  confirm_token: string
}

const CONTENT_SUBJECT = 'Há novidades no Entre Livros 📚'
const WELCOME_SUBJECT = 'Bem-vindo à newsletter do Entre Livros 📚'
const CONFIRM_SUBJECT = 'Confirma a tua subscrição · Entre Livros 📚'

const CHUNK = 25

// Avoid writing full subscriber e-mails (PII) into server logs. Keep just
// enough to correlate a failure without persisting the address in clear.
function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@')
  const head = local.slice(0, 1)
  return `${head}***@${domain.slice(0, 1)}***`
}

/**
 * Builds the SMTP transport from env. Returns null when SMTP is not
 * configured so sending no-ops (logs) instead of throwing.
 *
 * Required env:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional:
 *   SMTP_SECURE ("true" for implicit TLS / port 465; default inferred from port)
 *   SMTP_FROM   (defaults to "Entre Livros <newsletter@entrelivrosblog.pt>")
 */
function getTransport() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const port = Number(process.env.SMTP_PORT ?? 465)

  if (!host || !user || !pass) return null

  const secure =
    process.env.SMTP_SECURE !== undefined
      ? process.env.SMTP_SECURE === 'true'
      : port === 465

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

function shellHtml(inner: string) {
  return `<!doctype html>
<html lang="pt">
  <body style="margin:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a">
    <div style="max-width:560px;margin:0 auto;padding:32px 24px">
      <p style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#999;margin:0 0 24px">Entre Livros</p>
      ${inner}
    </div>
  </body>
</html>`
}

function buildContentHtml(content: NewContentEmail, unsubscribeUrl: string) {
  return shellHtml(`
      <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px">Há novidades no site 📚</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 24px">
        Foi adicionado conteúdo novo ao Entre Livros. Passa pelo site para ver.
      </p>
      <a href="${content.url}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px">Ver no site</a>
      <hr style="border:none;border-top:1px solid #e5e0d8;margin:32px 0 16px" />
      <p style="font-size:12px;color:#999;line-height:1.5;margin:0">
        Recebes este email porque subscreveste a newsletter do Entre Livros.
        <a href="${unsubscribeUrl}" style="color:#999">Cancelar subscrição</a>.
      </p>`)
}

function buildWelcomeHtml(unsubscribeUrl: string) {
  return shellHtml(`
      <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px">Subscrição confirmada 📚</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 24px">
        Obrigado por te juntares à newsletter do Entre Livros! A partir de agora
        recebes um email sempre que houver uma nova review ou publicação.
      </p>
      <a href="${SITE_URL}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px">Visitar o site</a>
      <hr style="border:none;border-top:1px solid #e5e0d8;margin:32px 0 16px" />
      <p style="font-size:12px;color:#999;line-height:1.5;margin:0">
        Recebes este email porque subscreveste a newsletter do Entre Livros.
        <a href="${unsubscribeUrl}" style="color:#999">Cancelar subscrição</a>.
      </p>`)
}

function buildConfirmHtml(confirmUrl: string) {
  return shellHtml(`
      <h1 style="font-size:22px;line-height:1.3;margin:0 0 16px">Confirma a tua subscrição 📚</h1>
      <p style="font-size:15px;line-height:1.6;color:#444;margin:0 0 24px">
        Falta só um passo: carrega no botão para confirmares que queres receber
        a newsletter do Entre Livros. Sem esta confirmação não te enviamos nada.
      </p>
      <a href="${confirmUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px">Confirmar subscrição</a>
      <hr style="border:none;border-top:1px solid #e5e0d8;margin:32px 0 16px" />
      <p style="font-size:12px;color:#999;line-height:1.5;margin:0">
        Se não foste tu a subscrever, ignora este email — sem a confirmação, o
        teu endereço não fica na lista.
      </p>`)
}

/**
 * Sends the double opt-in confirmation email (RGPD). Until the reader clicks
 * the link, the subscription stays unconfirmed and receives no content.
 * No-ops (logs) when SMTP is not configured. Never throws.
 */
export async function sendConfirmationEmail(
  subscriber: ConfirmTarget
): Promise<void> {
  const transport = getTransport()
  if (!transport) {
    console.warn('SMTP not configured — skipping confirmation email')
    return
  }

  const confirmUrl = `${SITE_URL}/newsletter/confirm?token=${subscriber.confirm_token}`
  try {
    await transport.sendMail({
      from: FROM,
      to: subscriber.email,
      subject: CONFIRM_SUBJECT,
      html: buildConfirmHtml(confirmUrl),
    })
  } catch (err) {
    console.error(
      `Confirmation email failed for ${maskEmail(subscriber.email)}:`,
      err
    )
  }
}

/**
 * Sends the new-content email to every subscriber via SMTP.
 * No-ops (logs) when SMTP is not configured so publishing never breaks.
 */
export async function sendNewContentEmail(
  subscribers: SubscriberTarget[],
  content: NewContentEmail
): Promise<void> {
  const transport = getTransport()
  if (!transport) {
    console.warn('SMTP not configured — skipping newsletter send')
    return
  }
  if (subscribers.length === 0) return

  for (let i = 0; i < subscribers.length; i += CHUNK) {
    const batch = subscribers.slice(i, i + CHUNK)
    await Promise.all(
      batch.map((s) => {
        const unsubscribeUrl = `${SITE_URL}/newsletter/unsubscribe?token=${s.unsubscribe_token}`
        return transport
          .sendMail({
            from: FROM,
            to: s.email,
            subject: CONTENT_SUBJECT,
            html: buildContentHtml(content, unsubscribeUrl),
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          })
          .catch((err) =>
            console.error(`SMTP send failed for ${maskEmail(s.email)}:`, err)
          )
      })
    )
  }
}

/**
 * Sends a one-off welcome email on first subscription.
 * No-ops (logs) when SMTP is not configured. Never throws.
 */
export async function sendWelcomeEmail(
  subscriber: SubscriberTarget
): Promise<void> {
  const transport = getTransport()
  if (!transport) {
    console.warn('SMTP not configured — skipping welcome email')
    return
  }

  const unsubscribeUrl = `${SITE_URL}/newsletter/unsubscribe?token=${subscriber.unsubscribe_token}`
  try {
    await transport.sendMail({
      from: FROM,
      to: subscriber.email,
      subject: WELCOME_SUBJECT,
      html: buildWelcomeHtml(unsubscribeUrl),
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    })
  } catch (err) {
    console.error(`Welcome email failed for ${maskEmail(subscriber.email)}:`, err)
  }
}
