import Hero from "@/components/Home/Hero";
import Recomendations from "@/components/Home/Recomendations";
import Footer from "@/app/layout/Footer";
import Navbar from "./layout/NavBar";
import { createClient } from '@/lib/supabase/server'
import { BookReview } from "@/interface/book";

export const revalidate = 3600;

async function getBooks() : Promise<BookReview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('BookReview')
    .select('id, title, author, rating, genre, reviewDate, sinopse, fullReview, recommendation, bookCoverUrl')
    .order('reviewDate', { ascending: false })

  if (error) {
    console.error('Failed to fetch books:', error)
    throw new Error('Failed to load book reviews')
  }

  return data ?? []
}


const Home = async () => {
  let livros: BookReview[] = []
  let fetchError = false

  try {
    livros = await getBooks()
  } catch (e) {
    console.error(e)
    fetchError = true
  }

  const categories = ['Todos', ...new Set(livros.map((livro) => livro.genre))]

  return (
    <div className="min-h-screen bg-background">
        <Navbar />

        <Hero />

        {fetchError ? (
          <div className="mx-auto max-w-5xl px-4 py-12 text-center">
            <p className="text-muted-foreground">Não foi possível carregar as avaliações. Tenta novamente mais tarde.</p>
          </div>
        ) : (
          <Recomendations livros={livros} categories={categories}/>
        )}

        <Footer />
    </div>
  );
};

export default Home;