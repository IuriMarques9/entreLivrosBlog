"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { createBookComment } from "@/app/commentActions";

interface CommentFormProps {
  bookId: number;
  onCommentAdded: () => void;
}

const CommentForm = ({ bookId, onCommentAdded }: CommentFormProps) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error("Por favor, escreve um comentário");
      return;
    }

    if (comment.length > 250) {
      toast.error("O comentário excede o limite de 250 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const userIdentifier = await generateUserIdentifier();

      const result = await createBookComment({
        book_id: bookId,
        user_identifier: userIdentifier,
        comment_text: comment.trim(),
      });

      if (!result.success) {
        if (result.error === "You have already commented on this book") {
          toast.error("Já comentaste este livro");
        } else {
          toast.error(result.error || "Erro ao adicionar comentário");
        }
        return;
      }

      setComment("");
      setCharCount(0);
      toast.success("Comentário adicionado com sucesso!");
      onCommentAdded();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Erro ao adicionar comentário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= 250) {
      setComment(text);
      setCharCount(text.length);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="rounded-md border border-border/50 bg-card p-2">
        <textarea
          value={comment}
          onChange={handleChange}
          placeholder="Partilha a tua opinião sobre este livro..."
          className="w-full resize-none rounded border-none bg-transparent font-body text-xs text-foreground placeholder-muted-foreground focus:outline-none"
          rows={3}
          disabled={isSubmitting}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="font-body text-xs text-muted-foreground">
            {charCount}/250
          </span>
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 font-body text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="h-3 w-3" />
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </div>
    </form>
  );
};

// Generate a unique user identifier using browser data
async function generateUserIdentifier(): Promise<string> {
  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const screenResolution = `${window.innerWidth}x${window.innerHeight}`;

  const combined = `${userAgent}|${language}|${timezone}|${screenResolution}`;

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return `user_${Math.abs(hash).toString(36)}`;
}

export default CommentForm;
