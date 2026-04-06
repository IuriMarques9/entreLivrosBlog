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