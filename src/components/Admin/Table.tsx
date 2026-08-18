"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { BookReview, BookComment, BookLikeNotification } from "@/interface/book";
import { addBook, updateBook, deleteBook } from '@/app/admin/actions'
import BookFormModal from "./BookFormModal";
import BookCommentCount from "./BookCommentCount";
import NotificationCenter from "@/components/Admin/NotificationCenterSimple";


const Dashboard = (
  { tabela, unreadComments, unreadLikes, commentCounts }:
  { tabela: BookReview[], unreadComments: BookComment[], unreadLikes: BookLikeNotification[], commentCounts: Record<number, number> }
) => {

  const [formOpen, setFormOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<BookReview | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)

  const handleEdit = (book: BookReview) => {
    setEditingBook(book)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditingBook(null)
    setFormOpen(true)
  }

  // Lança erro para o BookFormModal manter o modal aberto e mostrar o estado.
  const handleSubmit = async (data: Omit<BookReview, 'id'>) => {
    const result = editingBook
      ? await updateBook(editingBook.id, data)
      : await addBook(data)

    if (result?.error) {
      toast.error(result.error)
      throw new Error(result.error)
    }

    setFormOpen(false)
    toast.success(editingBook ? "Review atualizada" : "Review adicionada")
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const result = await deleteBook(deleteTarget)
    setDeleteTarget(null)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Review eliminada")
    }
  }
  
 
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row gap-5 justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Reviews
              </h1>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Gere as tuas recomendações de livros
              </p>
            </div>

            <div className="flex items-center gap-2">
              <NotificationCenter initialUnreadComments={unreadComments} initialUnreadLikes={unreadLikes} />
              
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Livro
              </Button>
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden sm:table-cell">Autor(a)</TableHead>
                  <TableHead className="hidden md:table-cell">Género</TableHead>
                  <TableHead className="text-center">Avaliação</TableHead>
                  <TableHead className="text-center">Comentários</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tabela.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {book.author}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                        {book.genre}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[hsl(var(--star-filled))] text-[hsl(var(--star-filled))]" />
                        <span className="text-sm">{book.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <BookCommentCount count={commentCounts[book.id] ?? 0} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(book)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(book.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tabela.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                      Ainda não há livros. Adiciona o primeiro!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </main>

      <BookFormModal
        key={editingBook?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        book={editingBook}
        onSubmit={handleSubmit}
      />
      
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar livro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser revertida. O livro será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;