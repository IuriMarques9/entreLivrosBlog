import Footer from "@/app/layout/Footer";
import Navbar from "../layout/NavBar";
import { createClient } from '@/lib/supabase/server'
import { BookReview, BookComment } from "@/interface/book";
import { Post } from "@/interface/post";
import AdminTabs from "@/components/Admin/AdminTabs";
import { getUnreadComments, getUnreadLikes, getSubscribers, getSuggestions, getCommentCounts } from "./actions";


async function getBooks() : Promise<BookReview[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('BookReview')
    .select('*')
    .order('reviewDate', { ascending: false })

  if (error) console.error(error)
  return data ?? []
}

async function getPosts(): Promise<Post[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('publishedAt', { ascending: false })

  if (error) console.error(error)
  return data ?? []
}


export default async function AdminPage() {
  const [books, unreadComments, unreadLikes, posts, subscribers, suggestions, commentCounts] = await Promise.all([
    getBooks(),
    getUnreadComments(),
    getUnreadLikes(),
    getPosts(),
    getSubscribers(),
    getSuggestions(),
    getCommentCounts(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <AdminTabs
        books={books}
        unreadComments={unreadComments}
        unreadLikes={unreadLikes}
        posts={posts}
        subscribers={subscribers}
        suggestions={suggestions}
        commentCounts={commentCounts}
      />

      <Footer />
    </div>
  );
};
