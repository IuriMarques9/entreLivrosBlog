"use client";

import { BookComment } from "@/interface/book";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useState } from "react";
import CommentForm from "./CommentForm";

interface CommentsSectionProps {
  bookId: number;
  comments: BookComment[];
  onCommentAdded: () => void;
  isLoading: boolean;
  error: string | null;
}

const CommentsSection = ({
  bookId,
  comments,
  onCommentAdded,
  isLoading,
  error,
}: CommentsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mt-4 border-t border-border/50 pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 font-body text-sm font-medium text-secondary-foreground hover:bg-secondary transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span>
            Comentários ({comments.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {isLoading && (
            <p className="text-center font-body text-xs text-muted-foreground py-4">
              ⏳ Carregando comentários...
            </p>
          )}

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 font-body text-xs text-destructive">
              ❌ Erro: {error}
            </div>
          )}

          {!isLoading && comments.length === 0 && (
            <p className="text-center font-body text-sm text-muted-foreground py-4">
              📝 Sem comentários ainda. Seja o primeiro a comentar!
            </p>
          )}

          <CommentForm bookId={bookId} onCommentAdded={onCommentAdded} />

          {comments.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-md bg-muted/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1 font-body text-xs text-foreground break-words">
                      {comment.comment_text}
                    </p>
                  </div>
                  <p className="mt-1.5 font-body text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
