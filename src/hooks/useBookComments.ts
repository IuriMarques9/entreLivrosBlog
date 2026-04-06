import { BookComment, CreateCommentInput } from "@/interface/book";
import { getBookComments, createBookComment } from "@/app/commentActions";
import { useEffect, useState } from "react";

export const useBookComments = (bookId: number) => {
  const [comments, setComments] = useState<BookComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookComments(bookId);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setComments([]);
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (input: CreateCommentInput & { user_identifier: string }) => {
    setError(null);
    try {
      const result = await createBookComment(input);
      
      if (!result.success) {
        setError(result.error || "Failed to add comment");
        return false;
      }

      if (result.data) {
        setComments((prev) => [result.data, ...prev]);
      }
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error adding comment";
      setError(message);
      return false;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [bookId, refreshKey]);

  return { comments, loading, error, addComment, refetch: fetchComments, setRefreshKey };
};
