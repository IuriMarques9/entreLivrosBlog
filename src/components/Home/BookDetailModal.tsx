"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart, BookOpen, ChevronDown, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import StarRating from "../../app/layout/StarRating";
import type { BookReview } from "@/interface/book";
import Image from "next/image";
import CommentsSection from "./CommentsSection";
import { useBookComments } from "@/hooks/useBookComments";
import { bookHref } from "@/lib/bookSlug";

interface BookDetailModalProps {
  book: BookReview | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Section = "review" | "sinopse";

const BookDetailModal = ({ book, open, onOpenChange }: BookDetailModalProps) => {
  const { comments, loading, error, addComment, setRefreshKey } = useBookComments(book?.id ?? 0);
  const [openSection, setOpenSection] = useState<Section | null>("review");

  const toggleSection = (section: Section) =>
    setOpenSection((prev) => (prev === section ? null : section));

  const handleCommentAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!book) return null;

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
            {book.bookCoverUrl ? (
              <Image
                src={book.bookCoverUrl}
                alt={`Capa de ${book.title}`}
                width={160}
                height={240}
                className="w-full rounded-md shadow-md"
                sizes="160px"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center rounded-md shadow-md">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
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

            {/* Colapsos ao lado da capa: A minha avaliação (em cima) / Sinopse (em baixo). Um aberto de cada vez. */}
            <div className="mt-4 divide-y divide-border">
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("review")}
                  aria-expanded={openSection === "review"}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-primary">
                    <Heart className="h-4 w-4" />
                    A minha avaliação
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "review" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "review" && (
                  <div className="max-h-60 overflow-y-auto pb-3 pr-2 whitespace-pre-wrap">
                    <p className="font-body text-sm leading-relaxed text-foreground/90">
                      {book.fullReview}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toggleSection("sinopse")}
                  aria-expanded={openSection === "sinopse"}
                  className="flex w-full items-center justify-between py-3 text-left"
                >
                  <span className="flex items-center gap-1.5 font-display text-sm font-semibold text-primary">
                    <BookOpen className="h-4 w-4" />
                    Sinopse
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openSection === "sinopse" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "sinopse" && (
                  <div className="max-h-60 overflow-y-auto pb-3 pr-2 whitespace-pre-wrap">
                    <p className="font-body text-sm leading-relaxed text-foreground/90">
                      {book.sinopse}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Link
              href={bookHref(book)}
              className="mt-3 inline-flex items-center gap-1 font-body text-xs font-medium text-primary hover:underline"
            >
              Abrir página da avaliação
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
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