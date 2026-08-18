'use server'

import { createClient } from '@/lib/supabase/server'
import { rateLimitDistributed, getRequestIp } from '@/lib/rate-limit'

export interface BookLikesState {
  count: number
  likedByMe: boolean
}

// Count + whether the current session already liked this book. Passive readers
// have no session, so likedByMe is simply false for them — no session is
// created just for reading.
export async function getBookLikes(bookId: number): Promise<BookLikesState> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { count, error } = await supabase
    .from('book_likes')
    .select('id', { count: 'exact', head: true })
    .eq('book_id', bookId)

  if (error) {
    console.error('Error fetching likes:', error)
    return { count: 0, likedByMe: false }
  }

  let likedByMe = false
  if (user) {
    const { data: mine } = await supabase
      .from('book_likes')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .maybeSingle()
    likedByMe = !!mine
  }

  return { count: count ?? 0, likedByMe }
}

// Like/unlike toggle. Ownership is enforced by RLS (insert only as yourself,
// delete only your own row) and the UNIQUE(book_id, user_id) constraint stops
// double likes even if two requests race — this code is defence-in-depth.
export async function toggleBookLike(
  bookId: number
): Promise<{ success: boolean; error?: string; liked?: boolean }> {
  const ip = await getRequestIp()
  const rl = await rateLimitDistributed(`like:toggle:${ip}`, 30, 60 * 1000)
  if (!rl.allowed) {
    return { success: false, error: 'Demasiados pedidos. Tenta novamente mais tarde.' }
  }

  if (!bookId || bookId <= 0) {
    return { success: false, error: 'Missing required fields' }
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // The client calls ensureAnonUserId() before this action; no session here
  // means anonymous sign-ins are unavailable, and likes need real ownership.
  if (!user) {
    return { success: false, error: 'Sessão indisponível. Tenta novamente.' }
  }

  try {
    const { data: existing, error: checkError } = await supabase
      .from('book_likes')
      .select('id')
      .eq('book_id', bookId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing like:', checkError)
      return { success: false, error: 'Failed to validate like' }
    }

    if (existing) {
      const { error } = await supabase
        .from('book_likes')
        .delete()
        .eq('id', existing.id)

      if (error) {
        console.error('Error removing like:', error)
        return { success: false, error: 'Failed to remove like' }
      }
      return { success: true, liked: false }
    }

    const { error } = await supabase
      .from('book_likes')
      .insert([{ book_id: bookId, user_id: user.id }])

    if (error) {
      // 23505 = unique_violation: a concurrent request already liked — fine.
      if (error.code === '23505') return { success: true, liked: true }
      console.error('Error creating like:', error)
      return { success: false, error: 'Failed to like' }
    }

    return { success: true, liked: true }
  } catch (error) {
    console.error('Error in toggleBookLike:', error)
    return { success: false, error: 'Internal server error' }
  }
}
