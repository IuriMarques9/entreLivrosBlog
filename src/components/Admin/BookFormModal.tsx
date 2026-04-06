import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { BookReview } from "@/interface/book";
import { ImagePlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BookCommentsAdmin from "./BookCommentsAdmin";

interface BookFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: BookReview | null;
  onSubmit: (data: Omit<BookReview, "id">) => void;
  onCommentDeleted?: () => void;
}

const emptyForm = {
  title: "",
  author: "",
  rating: 0,
  genre: "",
  reviewDate: new Date().toISOString(),
  sinopse: "",
  fullReview: "",
  recommendation: true,
  bookCoverUrl: "",
};

const genres = [
  "Autoajuda",
  "Ficção",
  "História",
  "Sociologia e Política",
  "Livros Técnicos",
  "Romance",
  "Drama",
  "Biografia",
  "Fantasia",
  "Mistério",
  "Ficção Científica",
  "Filosofia",
  "Psicologia",
  "Clássicos",
  "Desenvolvimento Pessoal",
  "Policial e Thriller",
  "Não Ficção",
  "BD/Novela Gráfica",
];

const BookFormModal = ({ open, onOpenChange, book, onSubmit, onCommentDeleted }: BookFormModalProps) => {
  const [form, setForm] = useState(emptyForm);

  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        rating: book.rating,
        genre: book.genre,
        reviewDate: book.reviewDate,
        sinopse: book.sinopse,
        fullReview: book.fullReview,
        recommendation: book.recommendation,
        bookCoverUrl: book.bookCoverUrl || "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [book, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    set("bookCoverUrl", "");
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    set("bookCoverUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let bookCoverUrl = form.bookCoverUrl;

    if (coverFile) {
      const supabase = createClient();

      // Sanitize filename to avoid issues with special characters on supabase storage
      const sanitizedName = coverFile.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .toLowerCase();
      const fileName = `${Date.now()}-${sanitizedName}`;

      const { error } = await supabase.storage
        .from('BookCovers')
        .upload(fileName, coverFile);

      if (error) {
        console.error('Erro ao fazer upload:', error);
        return;
      }

    const { data } = supabase.storage
      .from('BookCovers')
      .getPublicUrl(fileName);

      bookCoverUrl = data.publicUrl;
      console.log('bookCoverUrl gerado:', bookCoverUrl)
    }
  
    onSubmit({
      ...form,
      reviewDate: book?.reviewDate || new Date().toISOString(),
      bookCoverUrl,
    });

    onOpenChange(false);
  };

  const set = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {book ? "Editar Livro" : "Adicionar Livro"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" required value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="author">Autor(a)</Label>
              <Input id="author" required value={form.author} onChange={(e) => set("author", e.target.value)} />
            </div>
          </div>

          
          <div className="space-y-1.5">
            <Label htmlFor="genre">Género</Label>
            <Select value={form.genre} onValueChange={(v) => set("genre", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rating">Avaliação (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min={0}
                max={5}
                required
                value={form.rating}
                onChange={(e) => set("rating", Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reviewDate">Data</Label>
                <Input 
                    id="reviewDate" 
                    value={book?.reviewDate ? new Date(book.reviewDate).toLocaleDateString('pt-PT') : new Date().toLocaleDateString('pt-PT')}
                    disabled
                />            
            </div>
          </div>

          {/* Cover image upload */}
          <div className="space-y-1.5">
            <Label>Capa do Livro</Label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {coverPreview ? (
                <div className="relative shrink-0">
                  <Image
                    src={coverPreview}
                    alt="Preview da capa"
                    width={16}
                    height={24}
                    className="h-24 w-16 rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 flex-1 items-center justify-center gap-2 rounded-md border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-sm font-medium">{coverPreview ? "Alterar imagem" : "Selecionar imagem"}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sinopse">Sinopse do livro</Label>
            <Textarea id="sinopse" required rows={2} value={form.sinopse} onChange={(e) => set("sinopse", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="fullReview">Avaliação Completa</Label>
            <Textarea id="fullReview" required rows={4} value={form.fullReview} onChange={(e) => set("fullReview", e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="recommendation"
              checked={form.recommendation}
              onCheckedChange={(v) => set("recommendation", v)}
            />
            <Label htmlFor="recommendation">Recomendado</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {book ? "Guardar" : "Adicionar"}
            </Button>
          </div>
        </form>

        {book && (
          <BookCommentsAdmin bookId={book.id} bookTitle={book.title} onCommentDeleted={onCommentDeleted} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookFormModal;