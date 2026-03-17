"use client";
import { motion } from "framer-motion";
import { BookOpen, Heart, Mail } from "lucide-react";

const Content = () => {
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

          <div className="mt-8 space-y-6 font-body text-base leading-relaxed text-foreground/85">
            <p>
              Olá! Bem-vindo ao <span className="font-semibold text-primary">Entre Livros</span> — 
              o meu cantinho na internet onde partilho as minhas leituras, reflexões e recomendações de livros.
            </p>
            <p>
              Sou uma leitora apaixonada que acredita que um bom livro pode mudar a nossa perspetiva 
              sobre o mundo. Aqui vais encontrar resenhas honestas, desde ficção literária a memórias, 
              passando por ficção científica e desenvolvimento pessoal.
            </p>
            <p>
              O meu objetivo é simples: ajudar-te a encontrar a tua próxima leitura favorita. Cada 
              resenha é escrita com carinho e honestidade, porque acredito que os leitores merecem 
              opiniões genuínas.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <BookOpen className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">50+</p>
              <p className="font-body text-sm text-muted-foreground">Livros lidos em 2025</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <Heart className="mx-auto h-6 w-6 fill-primary text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">Ficção</p>
              <p className="font-body text-sm text-muted-foreground">Género favorito</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-5 text-center">
              <Mail className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 font-display text-2xl font-bold text-foreground">Contacto</p>
              <p className="font-body text-sm text-muted-foreground">tatilopesfelicio@gmail.com</p>
            </div>
          </div>
        </motion.div>
      </main>

    </div>
  );
};

export default Content;