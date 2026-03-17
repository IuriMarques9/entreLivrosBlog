'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BookReview } from '@/interface/book'

export async function addBook(data: Omit<BookReview, 'id'>) {
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