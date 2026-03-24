
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