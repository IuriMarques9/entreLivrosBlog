"use client";
import { BookOpen, Heart, Search, X } from "lucide-react";
import BookCard from "../Home/BookCard";
import { BookReview } from "@/interface/book";
import { useState } from "react";
import BookDetailModal from "./BookDetailModal";

// Diacritics-insensitive so "Felicio" matches "Felício".
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const Recomendations = ({ livros, categories }: { livros: BookReview[]; categories: string[] }) => {

    const [selectedBook, setSelectedBook] = useState<BookReview | null>(null);
    const [activeGenre, setActiveGenre] = useState("Todos");
    const [query, setQuery] = useState("");

    const [expandedId, setExpandedId] = useState<number | null>(null);

    const byGenre = activeGenre === "Todos" ? livros : livros.filter((b) => b.genre === activeGenre);
    const q = normalize(query.trim());
    const filtered = q === ""
        ? byGenre
        : byGenre.filter((b) => normalize(b.title).includes(q) || normalize(b.author).includes(q));

    return (
        <main id="main-content" className="min-w-0">

            {/* Search */}
            <div className="relative mb-6 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar por título ou autor..."
                aria-label="Pesquisar livros por título ou autor"
                className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-9 font-body text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
            />
            {query !== "" && (
                <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpar pesquisa"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                <X className="h-4 w-4" aria-hidden="true" />
                </button>
            )}
            </div>
            <p className="sr-only" role="status" aria-live="polite">
            {q !== ""
              ? filtered.length === 1
                ? "1 livro encontrado"
                : `${filtered.length} livros encontrados`
              : ""}
            </p>

            {/* Genre filter */}
            <div className="mb-8 flex flex-wrap items-center gap-2">
            {categories.map((genre) => (
                <button
                key={genre}
                onClick={() => setActiveGenre(genre)}
                aria-pressed={activeGenre === genre}
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
            <div className="grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
            {filtered.map((book, i) => (
                <BookCard
                key={book.id}
                book={book}
                index={i}
                onSelect={setSelectedBook}
                isExpanded={expandedId === book.id} 
                onToggle={() => setExpandedId(expandedId === book.id ? null : book.id)} 
                />
            ))}
            </div>

            {filtered.length === 0 && (
            <p className="py-16 text-center font-body text-muted-foreground">
                {q !== ""
                  ? <>Nenhum livro encontrado para &ldquo;{query.trim()}&rdquo;.</>
                  : "Ainda sem recomendações. Fica atento!"}
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