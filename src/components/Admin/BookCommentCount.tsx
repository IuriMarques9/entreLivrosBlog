'use client'

import { MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { countBookComments } from '@/app/admin/actions'

interface BookCommentCountProps {
  bookId: number
  refreshKey?: number
}

export default function BookCommentCount({ bookId, refreshKey = 0 }: BookCommentCountProps) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCount = async () => {
      try {
        const result = await countBookComments(bookId)
        setCount(result)
      } catch (error) {
        console.error('Error loading comment count:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCount()
  }, [bookId, refreshKey])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5">
        <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <MessageCircle className={`h-3.5 w-3.5 ${count > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
      <span className={`text-sm ${count > 0 ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
        {count}
      </span>
    </div>
  )
}
