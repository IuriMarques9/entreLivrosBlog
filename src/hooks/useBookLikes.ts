import { getBookLikes, toggleBookLike } from "@/app/likeActions";
import { ensureAnonUserId } from "@/lib/supabase/anon";
import { useEffect, useState } from "react";

export const useBookLikes = (bookId: number) => {
  const [count, setCount] = useState(0);
  const [likedByMe, setLikedByMe] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    // No book selected (the always-mounted modal passes 0) — skip the fetch.
    if (!bookId || bookId <= 0) {
      setCount(0);
      setLikedByMe(false);
      return;
    }
    let cancelled = false;
    getBookLikes(bookId)
      .then((state) => {
        if (cancelled) return;
        setCount(state.count);
        setLikedByMe(state.likedByMe);
      })
      .catch((err) => console.error("Error fetching likes:", err));
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  const toggleLike = async () => {
    if (toggling || !bookId || bookId <= 0) return false;
    setToggling(true);

    // Optimistic flip; rolled back if the server refuses.
    const prevCount = count;
    const prevLiked = likedByMe;
    setLikedByMe(!prevLiked);
    setCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      // Liking is the act that creates the anonymous session (same rule as
      // commenting) — passive readers never get one.
      await ensureAnonUserId();
      const result = await toggleBookLike(bookId);

      if (!result.success) {
        setLikedByMe(prevLiked);
        setCount(prevCount);
        return false;
      }

      if (result.liked !== undefined) setLikedByMe(result.liked);
      return true;
    } catch (err) {
      console.error("Error toggling like:", err);
      setLikedByMe(prevLiked);
      setCount(prevCount);
      return false;
    } finally {
      setToggling(false);
    }
  };

  return { count, likedByMe, toggling, toggleLike };
};
