-- ============================================================
-- SETUP SQL PARA SISTEMA DE COMENTÁRIOS
-- ============================================================
-- Executa isto no Supabase SQL Editor
-- Path: https://app.supabase.com/project/YOUR_PROJECT/sql
-- ============================================================

-- 1. Criar tabela principal
CREATE TABLE IF NOT EXISTS book_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id INT NOT NULL,
  user_identifier TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- CONSTRAINT: um comentário por utilizador por livro
  UNIQUE(book_id, user_identifier)
);

-- 2. Criar indexes para performance
CREATE INDEX IF NOT EXISTS idx_book_comments_book_id 
  ON book_comments(book_id);

CREATE INDEX IF NOT EXISTS idx_book_comments_user 
  ON book_comments(user_identifier);

CREATE INDEX IF NOT EXISTS idx_book_comments_created 
  ON book_comments(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE book_comments ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Qualquer um pode ver comentários
CREATE POLICY "Comentários são públicos para leitura"
  ON book_comments
  FOR SELECT
  USING (true);

-- 5. Policy: Qualquer um pode inserir comentários
CREATE POLICY "Qualquer um pode comentar"
  ON book_comments
  FOR INSERT
  WITH CHECK (true);

-- 6. Policy: Admin pode eliminar comentários
CREATE POLICY "Admin pode eliminar comentários"
  ON book_comments
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- 7. (Opcional) Comentários não podem ser editados
CREATE POLICY "Comentários não podem ser editados"
  ON book_comments
  FOR UPDATE
  USING (false);

-- ============================================================
-- VERIFICAÇÃO (executar após setup)
-- ============================================================
-- Contar comentários por livro:
-- SELECT book_id, COUNT(*) as total FROM book_comments GROUP BY book_id;

-- Ver todos os comentários de um livro (ID = 5):
-- SELECT * FROM book_comments WHERE book_id = 5 ORDER BY created_at DESC;

-- Verificar se um utilizador já comentou num livro:
-- SELECT * FROM book_comments WHERE book_id = 5 AND user_identifier = 'user_a1b2c3';

-- ============================================================
-- LIMPEZA (se necessário)
-- ============================================================
-- Apagar todos os comentários:
-- DELETE FROM book_comments;

-- Apagar a tabela:
-- DROP TABLE IF EXISTS book_comments CASCADE;

-- ============================================================
-- DADOS DE EXEMPLO (para testes)
-- ============================================================
-- INSERT INTO book_comments (book_id, user_identifier, comment_text)
-- VALUES 
--   (1, 'user_abc123', 'Adorei este livro, recomendo muito!'),
--   (1, 'user_def456', 'Uma excelente leitura, muito bem escrito.'),
--   (1, 'user_ghi789', 'Um clássico que todos devem ler.'),
--   (2, 'user_abc123', 'Não gostei muito da escrita.');

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 1. RLS está habilitado para segurança
-- 2. INSERT e SELECT são permitidos para todos
-- 3. DELETE é permitido apenas para utilizadores autenticados (admin)
-- 4. UPDATE está bloqueado (comentários imutáveis)
-- 5. UNIQUE constraint em (book_id, user_identifier)
-- 6. Índices otimizam queries por livro e data

-- Após criar a tabela, a aplicação Next.js pode começar
-- a salvar comentários imediatamente.
