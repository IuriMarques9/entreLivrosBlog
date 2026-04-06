"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, BookOpen } from "lucide-react";
import StarRating from "../../app/layout/StarRating";
import type { BookReview } from "@/interface/book";
import Image from "next/image";
import CommentsSection from "./CommentsSection";
import { useBookComments } from "@/hooks/useBookComments";

interface BookDetailModalProps {
  book: BookReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookDetailModal = ({ book, open, onOpenChange }: BookDetailModalProps) => {
  if (!book) return null;

  const { comments, loading, error, addComment, setRefreshKey } = useBookComments(book.id);

  const handleCommentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[90vw] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-foreground">
            {book.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-6 mt-2">
          <div className="w-40 shrink-0 self-center sm:self-start">
            <Image
              src={book.bookCoverUrl || ""}
              alt={`Capa de ${book.title}`}
              width={160}
              height={240}
              className="w-full rounded-md shadow-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-muted-foreground">de {book.author}</p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={book.rating} />
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-body text-xs font-medium text-secondary-foreground">
                {book.genre}
              </span>
              {book.recommendation && (
                <span className="flex items-center gap-1 font-body text-xs text-primary font-medium">
                  <Heart className="h-3.5 w-3.5 fill-primary" />
                  Recomendado
                </span>
              )}
            </div>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              Avaliação {book?.reviewDate ? new Date(book.reviewDate).toLocaleDateString('pt-PT') : new Date().toLocaleDateString('pt-PT')}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-primary">
              <BookOpen className="h-4 w-4" />
              <span className="font-display text-sm font-semibold">A minha avaliação</span>
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto pr-2 whitespace-pre-wrap">
              <p className="font-body text-sm leading-relaxed text-foreground/90">
                {book.fullReview}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CommentsSection
            bookId={book.id}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            isLoading={loading}
            error={error}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailModal;