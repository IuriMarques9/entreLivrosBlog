
export interface BookReview {
  id: number
  title: string
  author: string
  rating: number
  genre: string
  reviewDate: string
  sinopse: string
  fullReview: string
  recommendation: boolean
  bookCoverUrl?: string
}

export interface BookComment {
  id: string
  book_id: number
  user_identifier: string
  comment_text: string
  created_at: string
  updated_at: string
}

export interface CreateCommentInput {
  book_id: number
  user_identifier: string
  comment_text: string
}