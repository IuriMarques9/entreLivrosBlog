"use client";

import { useState } from "react";
import Table from "./Table";
import PostsTable from "./PostsTable";
import SubscribersTable from "./SubscribersTable";
import SuggestionsTable from "./SuggestionsTable";
import type { BookReview, BookComment, BookLikeNotification } from "@/interface/book";
import type { Post } from "@/interface/post";
import type { NewsletterSubscriber } from "@/interface/newsletter";
import type { Suggestion } from "@/interface/suggestion";

interface AdminTabsProps {
  books: BookReview[];
  unreadComments: BookComment[];
  unreadLikes: BookLikeNotification[];
  posts: Post[];
  subscribers: NewsletterSubscriber[];
  suggestions: Suggestion[];
  commentCounts: Record<number, number>;
}

type TabKey = "reviews" | "posts" | "newsletter" | "suggestions";

const AdminTabs = ({
  books,
  unreadComments,
  unreadLikes,
  posts,
  subscribers,
  suggestions,
  commentCounts,
}: AdminTabsProps) => {
  const [tab, setTab] = useState<TabKey>("reviews");

  const unreadSuggestions = suggestions.filter((s) => !s.is_read).length;

  const tabClass = (key: TabKey) =>
    `rounded-md px-4 py-1.5 font-body text-sm font-medium transition-colors ${
      tab === key
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="mx-auto min-h-[70vh] max-w-5xl px-4 pt-8 pb-24 sm:px-6">
      <div className="inline-flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        <button type="button" onClick={() => setTab("reviews")} className={tabClass("reviews")}>
          Reviews
        </button>
        <button type="button" onClick={() => setTab("posts")} className={tabClass("posts")}>
          Publicações
        </button>
        <button type="button" onClick={() => setTab("newsletter")} className={tabClass("newsletter")}>
          Newsletter
        </button>
        <button
          type="button"
          onClick={() => setTab("suggestions")}
          className={`relative ${tabClass("suggestions")}`}
        >
          Sugestões
          {unreadSuggestions > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
              {unreadSuggestions}
            </span>
          )}
        </button>
      </div>

      {tab === "reviews" && (
        <Table tabela={books} unreadComments={unreadComments} unreadLikes={unreadLikes} commentCounts={commentCounts} />
      )}

      {tab === "posts" && (
        <div className="mt-8">
          <PostsTable
            posts={posts}
            books={books.map((b) => ({ id: b.id, title: b.title }))}
          />
        </div>
      )}

      {tab === "newsletter" && <SubscribersTable subscribers={subscribers} />}

      {tab === "suggestions" && <SuggestionsTable suggestions={suggestions} />}
    </div>
  );
};

export default AdminTabs;
