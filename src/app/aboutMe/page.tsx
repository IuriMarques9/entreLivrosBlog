import type { Metadata } from "next";
import Content from "@/components/AboutMe/Content";
import Footer from "@/app/layout/Footer";
import Navbar from "../layout/NavBar";
import { createClient } from "@/lib/supabase/client";
import { BookReview } from "@/interface/book";

export const metadata: Metadata = {
  title: "Sobre Mim",
  description:
    "Conhece a Tatiana Felicio, a leitora por detras do blog Entre Livros. Descobre a sua historia, os seus gostos literarios e o que a inspira.",
};

async function getBooks() : Promise<BookReview[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('BookReview')
    .select('*')
    .order('reviewDate', { ascending: false })

  if (error) console.error(error)
  return data ?? []
}


const About = async () => {

  const livros = await getBooks();
  const quantidadeDeLivros = livros.length;
  const favCategory = livros.reduce((acc, livro) => {
    acc[livro.genre] = (acc[livro.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const categoriaFavorita = Object.keys(favCategory).reduce((a, b) => favCategory[a] > favCategory[b] ? a : b);
  
  console.log(livros)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <Content quantidadeDeLivros={quantidadeDeLivros} categoriaFavorita={categoriaFavorita} />

      <Footer />

    </div>
  );
};

export default About;