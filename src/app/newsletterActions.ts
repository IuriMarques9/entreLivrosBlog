'use server'

import { createClient } from '@/lib/supabase/server'
import { rateLimitDistributed, getRequestIp } from '@/lib/rate-limit'
import { sendConfirmationEmail } from '@/lib/email/mailer'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Global daily ceiling across ALL clients: even if an attacker rotates IPs to
// dodge the per-IP limit, they can't drive more than this many subscribe
// attempts (and confirmation e-mails) per day.
const GLOBAL_DAILY_CAP = 300
const ONE_DAY_MS = 24 * 60 * 60 * 1000

export async function subscribeNewsletter(
  email: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const ip = await getRequestIp()
  const rl = await rateLimitDistributed(`newsletter:${ip}`, 5, 10 * 60 * 1000)
  if (!rl.allowed) {
    return { success: false, error: 'Demasiados pedidos. Tenta novamente mais tarde.' }
  }

  const value = (email ?? '').trim().toLowerCase()

  if (!value || !EMAIL_RE.test(value)) {
    return { success: false, error: 'Email inválido' }
  }

  // Global cap: guards the confirmation-email send path against IP rotation.
  const globalRl = await rateLimitDistributed(
    'newsletter:global:day',
    GLOBAL_DAILY_CAP,
    ONE_DAY_MS
  )
  if (!globalRl.allowed) {
    return { success: false, error: 'Não foi possível subscrever agora. Tenta mais tarde.' }
  }

  const supabase = await createClient()

  // Double opt-in: a new subscription is created unconfirmed and only counts
  // once the reader clicks the confirmation link. The admin-only SELECT policy
  // means we can't read the row back as anon, so a SECURITY DEFINER RPC does the
  // insert-or-report atomically and hands back the token to e-mail (server-side
  // only — it never reaches the browser).
  const { data, error } = await supabase.rpc('newsletter_subscribe', {
    p_email: value,
  })

  if (error) {
    console.error('Error subscribing to newsletter:', error)
    return { success: false, error: 'Não foi possível subscrever' }
  }

  const row = Array.isArray(data) ? data[0] : data
  const status: string | undefined = row?.status
  const confirmToken: string | undefined = row?.confirm_token ?? undefined

  // Send the confirmation e-mail only when there is something to confirm
  // (new or still-pending). Already-confirmed sends nothing.
  if (status !== 'already_confirmed' && confirmToken) {
    await sendConfirmationEmail({ email: value, confirm_token: confirmToken })
  }

  // Uniform response for every outcome — never reveal whether this address was
  // already a (confirmed) subscriber. Distinct messages would be an e-mail
  // enumeration oracle; keep the reply identical in all three cases.
  return {
    success: true,
    message: 'Se este email ainda não estava confirmado, enviámos-te um link para confirmares a subscrição.',
  }
}
