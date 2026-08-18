'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import type { BookReview, BookComment, BookLikeNotification } from '@/interface/book'
import type { NewsletterSubscriber } from '@/interface/newsletter'
import type { Suggestion } from '@/interface/suggestion'
import { notifyNewContent } from '@/lib/email/notify'
import { SITE_URL } from '@/lib/site'

export async function addBook(data: Omit<BookReview, 'id' | 'reviewDate'>) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }

  const supabase = await createClient()

  const { data: inserted, error } = await supabase
    .from('BookReview')
    .insert(data)
    .select('id')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')

  if (inserted) {
    // Send after the response so the publish returns immediately (Vercel keeps
    // the function alive via waitUntil). notifyNewContent guards on notified_at.
    after(() =>
      notifyNewContent({
        table: 'BookReview',
        id: inserted.id,
        url: SITE_URL,
      })
    )
  }
}

export async function updateBook(id: number , data: Omit<BookReview, 'id'>) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('BookReview')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function deleteBook(id: number) {
  const guard = await requireAdmin()
  if (!guard.ok) return { error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('BookReview')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function getBookCommentsForAdmin(bookId: number): Promise<BookComment[]> {
  const guard = await requireAdmin()
  if (!guard.ok) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('book_comments')
    .select('*')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data || []
}

export async function deleteBookComment(commentId: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('book_comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/')
  return { success: true }
}

// Conta comentários de TODOS os livros numa só query (evita 1 POST por linha).
export async function getCommentCounts(): Promise<Record<number, number>> {
  const guard = await requireAdmin()
  if (!guard.ok) return {}

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('book_comments')
    .select('book_id')

  if (error) {
    console.error('Error fetching comment counts:', error)
    return {}
  }

  return (data ?? []).reduce((acc, row) => {
    acc[row.book_id] = (acc[row.book_id] ?? 0) + 1
    return acc
  }, {} as Record<number, number>)
}

export async function countBookComments(bookId: number): Promise<number> {
  const guard = await requireAdmin()
  if (!guard.ok) return 0

  const supabase = await createClient()

  const { count, error } = await supabase
    .from('book_comments')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', bookId)

  if (error) {
    console.error('Error counting comments:', error)
    return 0
  }

  return count || 0
}

// Funções para o Centro de Notificações
export async function getUnreadComments(): Promise<BookComment[]> {
  const guard = await requireAdmin()
  if (!guard.ok) return []

  const supabase = await createClient()

  // Primeiro buscamos os comentários não lidos
  const { data: comments, error: commentsError } = await supabase
    .from('book_comments')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (commentsError) {
    console.error('Error fetching unread comments:', commentsError)
    return []
  }

  // Se não há comentários, retornamos array vazio
  if (!comments || comments.length === 0) {
    return []
  }

  // Pegamos os IDs únicos dos livros
  const bookIds = [...new Set(comments.map(comment => comment.book_id))]

  // Buscamos os títulos dos livros
  const { data: books, error: booksError } = await supabase
    .from('BookReview')
    .select('id, title')
    .in('id', bookIds)

  if (booksError) {
    console.error('Error fetching book titles:', booksError)
    // Retornamos os comentários sem os títulos dos livros
    return comments as BookComment[]
  }

  // Criamos um mapa de ID do livro para título
  const bookTitlesMap = books.reduce((acc, book) => {
    acc[book.id] = book.title
    return acc
  }, {} as Record<number, string>)

  // Mapeamos os comentários para incluir os títulos dos livros
  return comments.map(comment => ({
    ...comment,
    book_title: bookTitlesMap[comment.book_id] || `Livro #${comment.book_id}`
  })) as BookComment[]
}

export async function markCommentAsRead(commentId: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('book_comments')
    .update({ is_read: true })
    .eq('id', commentId)

  if (error) {
    console.error('Error marking comment as read:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function markAllCommentsAsRead() {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('book_comments')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all comments as read:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

// Likes não lidos para o Centro de Notificações — mesmo fluxo dos comentários.
export async function getUnreadLikes(): Promise<BookLikeNotification[]> {
  const guard = await requireAdmin()
  if (!guard.ok) return []

  const supabase = await createClient()

  const { data: likes, error: likesError } = await supabase
    .from('book_likes')
    .select('id, book_id, created_at, is_read')
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (likesError) {
    console.error('Error fetching unread likes:', likesError)
    return []
  }

  if (!likes || likes.length === 0) {
    return []
  }

  const bookIds = [...new Set(likes.map(like => like.book_id))]

  const { data: books, error: booksError } = await supabase
    .from('BookReview')
    .select('id, title')
    .in('id', bookIds)

  if (booksError) {
    console.error('Error fetching book titles:', booksError)
    return likes as BookLikeNotification[]
  }

  const bookTitlesMap = books.reduce((acc, book) => {
    acc[book.id] = book.title
    return acc
  }, {} as Record<number, string>)

  return likes.map(like => ({
    ...like,
    book_title: bookTitlesMap[like.book_id] || `Livro #${like.book_id}`
  })) as BookLikeNotification[]
}

export async function markLikeAsRead(likeId: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('book_likes')
    .update({ is_read: true })
    .eq('id', likeId)

  if (error) {
    console.error('Error marking like as read:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function markAllLikesAsRead() {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('book_likes')
    .update({ is_read: true })
    .eq('is_read', false)

  if (error) {
    console.error('Error marking all likes as read:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

// ===================== Newsletter (admin) =====================
export async function getSubscribers(): Promise<NewsletterSubscriber[]> {
  const guard = await requireAdmin()
  if (!guard.ok) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching subscribers:', error)
    return []
  }

  return data ?? []
}

export async function deleteSubscriber(id: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('newsletter_subscribers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting subscriber:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

// ===================== Sugestões (admin) =====================
export async function getSuggestions(): Promise<Suggestion[]> {
  const guard = await requireAdmin()
  if (!guard.ok) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching suggestions:', error)
    return []
  }

  return data ?? []
}

export async function getUnreadSuggestions(): Promise<Suggestion[]> {
  const guard = await requireAdmin()
  if (!guard.ok) return []

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching unread suggestions:', error)
    return []
  }

  return data ?? []
}

export async function markSuggestionAsRead(id: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('suggestions')
    .update({ is_read: true })
    .eq('id', id)

  if (error) {
    console.error('Error marking suggestion as read:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deleteSuggestion(id: string) {
  const guard = await requireAdmin()
  if (!guard.ok) return { success: false, error: guard.error }

  const supabase = await createClient()

  const { error } = await supabase
    .from('suggestions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting suggestion:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}