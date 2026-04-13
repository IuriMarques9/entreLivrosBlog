"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { BookComment } from "@/interface/book";
import { markCommentAsRead, markAllCommentsAsRead } from "@/app/admin/actions";

interface NotificationCenterProps {
  initialUnreadComments: BookComment[];
}

export default function NotificationCenter({ initialUnreadComments }: NotificationCenterProps) {
  const [unreadComments, setUnreadComments] = useState<BookComment[]>(initialUnreadComments);
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

  const handleMarkAsRead = async (commentId: string) => {
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

  const handleMarkAllAsRead = async () => {
    // Atualização otimista
    setUnreadComments([]);

    try {
      const result = await markAllCommentsAsRead();
      if (!result.success) {
        // Reverter se falhar
        setUnreadComments(initialUnreadComments);
        console.error("Erro ao marcar todos como lidos:", result.error);
      }
    } catch (error) {
      // Reverter se falhar
      setUnreadComments(initialUnreadComments);
      console.error("Erro ao marcar todos como lidos:", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 hover:bg-muted transition-colors text-primary"
        aria-label="Notificações"
      >
        <Bell className="h-6 w-6" />
        {unreadComments.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white border-2 border-background">
            {unreadComments.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-popover shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notificações</h3>
              {unreadComments.length > 0 && (
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
            {unreadComments.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma notificação nova
              </div>
            ) : (
              <ul>
                {unreadComments.map((comment) => (
                  <li
                    key={comment.id}
                    className="border-b border-border last:border-b-0 p-4 hover:bg-muted/50"
                  >
                    <div className="flex justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {comment.book_title || `Comentário no livro #${comment.book_id}`}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {comment.comment_text}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleMarkAsRead(comment.id)}
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