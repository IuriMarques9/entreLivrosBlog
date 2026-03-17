import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, BookOpen } from "lucide-react";
import StarRating from "../../app/layout/StarRating";
import type { BookReview } from "@/data/books";
import bookPlaceholder from "../../assets/book-placehoder.jpg";
import Image from "next/image";

interface BookDetailModalProps {
  book: BookReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookDetailModal = ({ book, open, onOpenChange }: BookDetailModalProps) => {
  if (!book) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold text-foreground">
            {book.title}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-6 mt-2">
          <div className="w-40 shrink-0 self-center sm:self-start">
            <Image
              src={book.coverUrl || bookPlaceholder}
              alt={`Cover of ${book.title}`}
              className="w-full rounded-md shadow-md"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-muted-foreground">by {book.author}</p>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={book.rating} />
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-body text-xs font-medium text-secondary-foreground">
                {book.genre}
              </span>
              {book.recommendation && (
                <span className="flex items-center gap-1 font-body text-xs text-primary font-medium">
                  <Heart className="h-3.5 w-3.5 fill-primary" />
                  Recommended
                </span>
              )}
            </div>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              Reviewed {book.reviewDate}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-primary">
              <BookOpen className="h-4 w-4" />
              <span className="font-display text-sm font-semibold">My Review</span>
            </div>
            <p className="mt-2 font-body text-sm leading-relaxed text-foreground/90">
              {book.fullReview}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookDetailModal;