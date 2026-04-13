'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BookReview, BookComment } from '@/interface/book'

export async function addBook(data: Omit<BookReview, 'id' | 'reviewDate'>) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('BookReview')
    .insert(data)

  if (error) return { error: error.message }
 
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function updateBook(id: number , data: Omit<BookReview, 'id'>) {
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
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  console.log('user autenticado:', user)
  
  const { error } = await supabase
    .from('BookReview')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/')
}

export async function getBookCommentsForAdmin(bookId: number): Promise<BookComment[]> {
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

export async function countBookComments(bookId: number): Promise<number> {
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