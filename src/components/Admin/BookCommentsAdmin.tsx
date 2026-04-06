'use client'

import { BookComment } from '@/interface/book'
import { Trash2, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { deleteBookComment, getBookCommentsForAdmin } from '@/app/admin/actions'
import { toast } from 'sonner'

interface BookCommentsAdminProps {
  bookId: number
  bookTitle: string
  onCommentDeleted?: () => void
}

export default function BookCommentsAdmin({ bookId, bookTitle, onCommentDeleted }: BookCommentsAdminProps) {
  const [comments, setComments] = useState<BookComment[]>([])
  const [loading, setLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadComments = async () => {
    if (hasLoaded) return // Já carregou, não carrega de novo
    
    setLoading(true)
    try {
      const data = await getBookCommentsForAdmin(bookId)
      setComments(data)
      setHasLoaded(true)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Erro ao carregar comentários')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    if (!isExpanded && !hasLoaded) {
      await loadComments()
    }
    setIsExpanded(!isExpanded)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tens a certeza que deseja eliminar este comentário?')) {
      return
    }

    try {
      const result = await deleteBookComment(commentId)
      if (result.success) {
        setComments(comments.filter(c => c.id !== commentId))
        toast.success('Comentário eliminado com sucesso')
        // Notifica o parent para fazer refresh da contagem
        onCommentDeleted?.()
      } else {
        toast.error('Erro ao eliminar comentário')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Erro ao eliminar comentário')
    }
  }

  return (
    <div className="mt-6 border border-border rounded-lg p-4 bg-muted/30">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 font-medium text-sm hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>
            Comentários
          </span>
        </div>
        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {loading && (
            <p className="text-center text-muted-foreground text-sm py-4">
              ⏳ Carregando comentários...
            </p>
          )}

          {!loading && comments.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-4">
              📝 Sem comentários neste livro
            </p>
          )}

          {comments.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-border rounded-md p-3 bg-card hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(comment.created_at).toLocaleDateString('pt-PT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-foreground break-words">
                        {comment.comment_text}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors shrink-0"
                      title="Eliminar comentário"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
