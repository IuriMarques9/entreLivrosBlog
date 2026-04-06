'use server'

import { createClient } from '@/lib/supabase/server'
import type { BookComment, CreateCommentInput } from '@/interface/book'

export async function getBookComments(bookId: number): Promise<BookComment[]> {
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

export async function createBookComment(
  input: CreateCommentInput & { user_identifier: string }
): Promise<{ success: boolean; error?: string; data?: BookComment }> {
  const supabase = await createClient()

  if (!input.book_id || !input.user_identifier || !input.comment_text) {
    return { success: false, error: 'Missing required fields' }
  }

  if (input.comment_text.length > 250) {
    return { success: false, error: 'Comment exceeds 250 character limit' }
  }

  try {
    const { data: existingComment, error: checkError } = await supabase
      .from('book_comments')
      .select('id')
      .eq('book_id', input.book_id)
      .eq('user_identifier', input.user_identifier)
      .single()

    if (existingComment) {
      return { success: false, error: 'You have already commented on this book' }
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing comment:', checkError)
      return { success: false, error: 'Failed to validate comment' }
    }

    const { data, error } = await supabase
      .from('book_comments')
      .insert([
        {
          book_id: input.book_id,
          user_identifier: input.user_identifier,
          comment_text: input.comment_text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating comment:', error)
      return { success: false, error: 'Failed to create comment' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Error in createBookComment:', error)
    return { success: false, error: 'Internal server error' }
  }
}
