"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Heart, MessageCircle } from "lucide-react";
import { BookComment, BookLikeNotification } from "@/interface/book";
import {
  markCommentAsRead,
  markAllCommentsAsRead,
  markLikeAsRead,
  markAllLikesAsRead,
} from "@/app/admin/actions";

interface NotificationCenterProps {
  initialUnreadComments: BookComment[];
  initialUnreadLikes: BookLikeNotification[];
}

// Uma lista única, ordenada por data, com comentários e gostos misturados.
type NotificationItem =
  | { kind: "comment"; id: string; created_at: string; comment: BookComment }
  | { kind: "like"; id: string; created_at: string; like: BookLikeNotification };

export default function NotificationCenter({
  initialUnreadComments,
  initialUnreadLikes,
}: NotificationCenterProps) {
  const [unreadComments, setUnreadComments] = useState<BookComment[]>(initialUnreadComments);
  const [unreadLikes, setUnreadLikes] = useState<BookLikeNotification[]>(initialUnreadLikes);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const items: NotificationItem[] = [
    ...unreadComments.map((comment): NotificationItem => ({
      kind: "comment",
      id: comment.id,
      created_at: comment.created_at,
      comment,
    })),
    ...unreadLikes.map((like): NotificationItem => ({
      kind: "like",
      id: like.id,
      created_at: like.created_at,
      like,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalUnread = items.length;

  const handleMarkCommentAsRead = async (commentId: string) => {
    // Atualização otimista
    setUnreadComments(prev => prev.filter(comment => comment.id !== commentId));

    try {
      const result = await markCommentAsRead(commentId);
      if (!result.success) {
        // Reverter se falhar
        setUnreadComments(prev => [...prev, initialUnreadComments.find(c => c.id === commentId)!]);
        console.error("Erro ao marcar como lido:", result.error);
      }
    } catch (error) {
      // Reverter se falhar
      setUnreadComments(prev => [...prev, initialUnreadComments.find(c => c.id === commentId)!]);
      console.error("Erro ao marcar como lido:", error);
    }
  };

  const handleMarkLikeAsRead = async (likeId: string) => {
    // Atualização otimista
    setUnreadLikes(prev => prev.filter(like => like.id !== likeId));

    try {
      const result = await markLikeAsRead(likeId);
      if (!result.success) {
        // Reverter se falhar
        setUnreadLikes(prev => [...prev, initialUnreadLikes.find(l => l.id === likeId)!]);
        console.error("Erro ao marcar como lido:", result.error);
      }
    } catch (error) {
      // Reverter se falhar
      setUnreadLikes(prev => [...prev, initialUnreadLikes.find(l => l.id === likeId)!]);
      console.error("Erro ao marcar como lido:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    // Atualização otimista
    setUnreadComments([]);
    setUnreadLikes([]);

    try {
      const [commentsResult, likesResult] = await Promise.all([
        markAllCommentsAsRead(),
        markAllLikesAsRead(),
      ]);
      if (!commentsResult.success) {
        setUnreadComments(initialUnreadComments);
        console.error("Erro ao marcar todos como lidos:", commentsResult.error);
      }
      if (!likesResult.success) {
        setUnreadLikes(initialUnreadLikes);
        console.error("Erro ao marcar todos como lidos:", likesResult.error);
      }
    } catch (error) {
      // Reverter se falhar
      setUnreadComments(initialUnreadComments);
      setUnreadLikes(initialUnreadLikes);
      console.error("Erro ao marcar todos como lidos:", error);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-muted transition-colors text-primary"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-background">
            {totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute md:right-0 mt-2 w-80 rounded-md border bg-popover shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              {totalUnread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {totalUnread === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma notificação nova
              </div>
            ) : (
              <ul>
                {items.map((item) => (
                  <li
                    key={`${item.kind}-${item.id}`}
                    className="border-b border-border last:border-b-0 p-4 hover:bg-muted/50"
                  >
                    <div className="flex justify-between">
                      {item.kind === "comment" ? (
                        <div className="flex-1 min-w-0">
                          <p className="flex items-center gap-1.5 text-sm font-medium truncate">
                            <MessageCircle className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                            {item.comment.book_title || `Comentário no livro #${item.comment.book_id}`}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {item.comment.comment_text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 min-w-0">
                          <p className="flex items-center gap-1.5 text-sm font-medium truncate">
                            <Heart className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" aria-hidden="true" />
                            {item.like.book_title || `Livro #${item.like.book_id}`}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Recebeu um novo gosto
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          item.kind === "comment"
                            ? handleMarkCommentAsRead(item.id)
                            : handleMarkLikeAsRead(item.id)
                        }
                        className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
                        aria-label="Marcar como lido"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
