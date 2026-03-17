import Footer from "@/app/layout/Footer";
import Navbar from "../layout/NavBar";
import { createClient } from '@/lib/supabase/server'
import { BookReview } from "@/interface/book";
import Table from "@/components/Admin/Table";


async function getBooks() : Promise<BookReview[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('BookReview')
    .select('*')
    .order('reviewDate', { ascending: false })

  if (error) console.error(error)
  return data ?? []
}


export default async function AdminPage() {

  const tabela = await getBooks();

  return (
    <div className="min-h-screen bg-background">
        <Navbar />
      
        <Table tabela={tabela} />
        
        <Footer />
    </div>
  );
};