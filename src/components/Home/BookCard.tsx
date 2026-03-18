"use client"
import { motion } from "framer-motion";
import { BookOpen, Heart } from "lucide-react";
import StarRating from "../../app/layout/StarRating";
import type { BookReview } from "@/interface/book";
import Image from "next/image";

interface BookCardProps {
  book: BookReview;
  index: number;
  onSelect: (book: BookReview) => void;
}

const BookCard = ({ book, index, onSelect }: BookCardProps) => {
  
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer rounded-lg bg-card p-5 shadow-sm transition-shadow hover:shadow-md border border-border/50"
      onClick={() => onSelect(book)}
    >
      <div className="flex gap-5">
        <div className="w-24 shrink-0 overflow-hidden rounded-md">
        
          <Image
            src={`${book.bookCoverUrl || ""}`}
            width={160}
            height={240}
            alt={`Capa de ${book.title}`}
            className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2.5 py-0.5 font-body text-xs font-medium text-secondary-foreground">
                {book.genre}
              </span>
              {book.recommendation && (
                <Heart className="h-3.5 w-3.5 fill-primary text-primary" />
              )}
            </div>
            <h3 className="font-display text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
              {book.title}
            </h3>
            <p className="mt-0.5 font-body text-sm text-muted-foreground">
              de {book.author}
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <StarRating rating={book.rating} />
            <span className="font-body text-xs text-muted-foreground">
              {book?.reviewDate ? new Date(book.reviewDate).toLocaleDateString('pt-PT') : new Date().toLocaleDateString('pt-PT')}
            </span>
          </div>
        </div>
      </div>
      <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {book.shortReview}
      </p>
      <div className="mt-3 flex items-center gap-1.5 font-body text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
        <BookOpen className="h-3.5 w-3.5" />
        Lê a avaliação completa
      </div>
    </motion.article>
  );
};

export default BookCard;