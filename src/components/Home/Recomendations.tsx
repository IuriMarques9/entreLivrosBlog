"use client";
import { BookOpen, Heart } from "lucide-react";
import BookCard from "../Home/BookCard";
import { BookReview } from "@/interface/book";
import { useState } from "react";
import BookDetailModal from "./BookDetailModal";


const Recomendations = ({ livros, categories }: { livros: BookReview[]; categories: string[] }) => {
  
    const [selectedBook, setSelectedBook] = useState<BookReview | null>(null);
    const [activeGenre, setActiveGenre] = useState("Todos");

    const filtered = activeGenre === "Todos" ? livros : livros.filter((b) => b.genre === activeGenre);

    return (
        <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            
            {/* Genre filter */}
            <div className="mb-8 flex flex-wrap items-center gap-2">
            {categories.map((genre) => (
                <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                className={`rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors ${
                    activeGenre === genre
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
                >
                {genre}
                </button>
                ))}
            </div>

            {/* Stats */}
            <div className="mb-8 flex items-center gap-6 border-b border-border pb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span className="font-body text-sm">{livros.length} livros avaliados</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4 fill-primary text-primary" />
                <span className="font-body text-sm">
                {livros.filter((b) => b.recommendation).length} recomendados
                </span>
            </div>
            </div>

            {/* Book grid */}
            <div className="grid gap-6 sm:grid-cols-2">
            {filtered.map((book, i) => (
                <BookCard
                key={book.id}
                book={book}
                index={i}
                onSelect={setSelectedBook}
                />
            ))}
            </div>

            {filtered.length === 0 && (
            <p className="py-16 text-center font-body text-muted-foreground">
                Ainda sem recomendações. Fica atento!
            </p>
            )}

            <BookDetailModal
                book={selectedBook}
                open={!!selectedBook}
                onOpenChange={(open) => !open && setSelectedBook(null)}
            />
        </main>
    );
};

export default Recomendations;