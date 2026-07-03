"use client";

import { useState, useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Post, PostInput } from "@/interface/post";
import type { BookReview } from "@/interface/book";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PostFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post | null;
  books: Pick<BookReview, "id" | "title">[];
  onSubmit: (data: Omit<PostInput, "slug" | "publishedAt"> & { publishedAt?: string }) => void | Promise<void>;
}

const NO_BOOK = "__none__";

type FormState = {
  title: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  bookId: number | null;
  published: boolean;
};

const initialForm = (post?: Post | null): FormState => ({
  title: post?.title ?? "",
  excerpt: post?.excerpt ?? "",
  body: post?.body ?? "",
  coverImageUrl: post?.coverImageUrl ?? "",
  bookId: post?.bookId ?? null,
  published: post?.published ?? true,
});

const PostFormModal = ({ open, onOpenChange, post, books, onSubmit }: PostFormModalProps) => {
  const [form, setForm] = useState<FormState>(() => initialForm(post));
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.coverImageUrl ?? null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview(null);
    set("coverImageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let coverImageUrl = form.coverImageUrl;

    if (coverFile) {
      setUploading(true);
      const supabase = createClient();
      const sanitized = coverFile.name
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .toLowerCase();
      const fileName = `${Date.now()}-${sanitized}`;
      // cache longo é seguro: o fileName é único (Date.now()), nunca é reescrito
      const { error } = await supabase.storage.from("PostCovers").upload(fileName, coverFile, { cacheControl: "31536000" });
      if (error) {
        console.error("Erro upload cover post:", error);
        setUploading(false);
        return;
      }
      const { data } = supabase.storage.from("PostCovers").getPublicUrl(fileName);
      coverImageUrl = data.publicUrl;
      setUploading(false);
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: form.title,
        excerpt: form.excerpt || null,
        body: form.body,
        coverImageUrl: coverImageUrl || null,
        bookId: form.bookId,
        published: form.published,
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {post ? "Editar Publicação" : "Nova Publicação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="excerpt">Resumo (opcional, aparece na homepage)</Label>
            <Textarea
              id="excerpt"
              rows={2}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Conteúdo</Label>
            <Textarea
              id="body"
              required
              rows={10}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Livro associado (opcional)</Label>
            <Select
              value={form.bookId === null ? NO_BOOK : String(form.bookId)}
              onValueChange={(v) => set("bookId", v === NO_BOOK ? null : Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_BOOK}>— Nenhum —</SelectItem>
                {books.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Imagem de capa</Label>
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
                    alt="Preview"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-md border border-border object-cover"
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
                <span className="text-sm font-medium">
                  {coverPreview ? "Alterar imagem" : "Selecionar imagem"}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="published"
              checked={form.published}
              onCheckedChange={(v) => set("published", v)}
            />
            <Label htmlFor="published">Publicado</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={uploading || submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading || submitting}>
              {uploading ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />A carregar imagem...</span>
              ) : submitting ? (
                <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />A guardar...</span>
              ) : post ? "Guardar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PostFormModal;
