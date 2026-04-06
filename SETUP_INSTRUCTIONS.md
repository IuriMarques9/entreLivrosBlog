# Setup de Comentários - Instruções

## 1. Criar Tabela no Supabase

No painel do Supabase, execute o seguinte SQL:

```sql
CREATE TABLE book_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id INT NOT NULL,
  user_identifier TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(book_id, user_identifier)
);

CREATE INDEX idx_book_comments_book_id ON book_comments(book_id);
CREATE INDEX idx_book_comments_user ON book_comments(user_identifier);
```

## 2. Criar a API Route

Cria um ficheiro em `src/app/api/comments/route.ts` com o seguinte conteúdo:

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const bookId = request.nextUrl.searchParams.get("bookId");

    if (!bookId) {
      return NextResponse.json(
        { error: "bookId parameter is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("book_comments")
      .select("*")
      .eq("book_id", parseInt(bookId))
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch comments" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { book_id, user_identifier, comment_text } = body;

    if (!book_id || !user_identifier || !comment_text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (comment_text.length > 250) {
      return NextResponse.json(
        { error: "Comment exceeds 250 character limit" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: existingComment, error: checkError } = await supabase
      .from("book_comments")
      .select("id")
      .eq("book_id", book_id)
      .eq("user_identifier", user_identifier)
      .single();

    if (existingComment) {
      return NextResponse.json(
        { error: "You have already commented on this book" },
        { status: 409 }
      );
    }

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Supabase error:", checkError);
      return NextResponse.json(
        { error: "Failed to validate comment" },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from("book_comments")
      .insert([
        {
          book_id,
          user_identifier,
          comment_text,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create comment" },
        { status: 500 }
      );
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/comments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

## 3. Verificar a Integração

Os seguintes ficheiros foram criados/modificados:

- `src/interface/book.ts` - Adicionadas interfaces `BookComment` e `CreateCommentInput`
- `src/hooks/useBookComments.ts` - Hook para gerir comentários
- `src/components/Home/CommentsSection.tsx` - Componente com a secção de comentários
- `src/components/Home/CommentForm.tsx` - Formulário para enviar comentários
- `src/components/Home/BookCard.tsx` - Integração do CommentsSection no card

## 4. Funcionalidades

✅ Secção de comentários com collapse/expand
✅ Formulário para adicionar comentários (máx. 250 caracteres)
✅ Validação: um comentário por utilizador por livro
✅ Contador de comentários
✅ Ordenação por data (mais recentes primeiro)
✅ Identificação de utilizador por IP/session (anónimo)

## 5. Notas de Segurança

- A validação de "um comentário por utilizador" usa um hash baseado em dados do browser
- O comentário máximo é de 250 caracteres conforme solicitado
- A tabela usa UNIQUE constraint para garantir unicidade no banco de dados
