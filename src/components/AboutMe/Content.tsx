"use client";

import { motion } from "framer-motion";
import { BookOpen, Heart, Mail } from "lucide-react";

const Content = ( { quantidadeDeLivros, categoriaFavorita }: { quantidadeDeLivros: number; categoriaFavorita: string } ) => {
  
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-display text-4xl font-bold text-foreground">
            Quem sou eu?
          </h1>
          <div className="mt-2 h-1 w-16 rounded-full bg-primary" />

          <div className="mt-8 space-y-4 font-body text-base leading-relaxed text-foreground/85">
            <p>
              Olá! Bem-vindo(a) ao <span className="font-semibold text-primary">Entre Livros</span> — o espaço na internet onde partilho as minhas leituras, reflexões e recomendações de livros.
            </p>
            <p>
              Chamo-me Tatiana e, além de jornalista, uma leitora apaixonada que acredita que um bom livro pode mudar a nossa perspetiva sobre o mundo. 
            </p>
            <p>
              O meu objetivo é simples: ajudar-te a encontrar a tua próxima leitura favorita.
            </p>
            <p>
              Cada avaliação é escrita com honestidade, porque acredito que os leitores merecem opiniões genuínas.
            </p>
            <p>
              Espero que gostes tanto de estar “Entre Livros” como eu!
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{quantidadeDeLivros}</p>
              <p className="font-body text-sm text-muted-foreground">Livros lidos</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <Heart className="mx-auto h-6 w-6 fill-primary text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">{categoriaFavorita}</p>
              <p className="font-body text-sm text-muted-foreground">Género favorito</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <Mail className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">Contacto</p>
              <p className="font-body text-xs md:text-sm text-muted-foreground">tatilopesfelicio@hotmail.com</p>
            </div>
          </div>
        </motion.div>
      </main>

    </div>
  );
};

export default Content;