"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
import type { BookReview } from "@/interface/book";
import { addBook, updateBook, deleteBook } from '@/app/admin/actions'


const Dashboard = ( { tabela }: { tabela: BookReview[] } ) => {
  
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

  const handleSubmit = async (data: Omit<BookReview, 'id'>) => {
    if (editingBook) {
      await updateBook(editingBook.id, data)
    } else {
      await addBook(data)
    }
    setFormOpen(false)
  }

  const confirmDelete = async () => {
    if (deleteTarget) {
      await deleteBook(deleteTarget)
      setDeleteTarget(null)
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="mt-1 font-body text-sm text-muted-foreground">
                Gere as tuas resenhas de livros
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Livro
            </Button>
          </div>

          <div className="mt-8 rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden sm:table-cell">Autor(a)</TableHead>
                  <TableHead className="hidden md:table-cell">Género</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-[hsl(var(--star-filled))] text-[hsl(var(--star-filled))]" />
                        <span className="text-sm">{book.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
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
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      Ainda não há livros. Adiciona o primeiro!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </main>

      
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