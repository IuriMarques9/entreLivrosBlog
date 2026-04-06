-- ============================================================
-- FIX: ADICIONAR PERMISSÃO DE DELETE PARA ADMIN
-- ============================================================
-- Executa isto no Supabase SQL Editor se já fizeste o setup anterior
-- Path: https://app.supabase.com/project/YOUR_PROJECT/sql
-- ============================================================

-- 1. Remover a política antiga que bloqueava DELETE
DROP POLICY IF EXISTS "Comentários não podem ser apagados" ON book_comments;

-- 2. Adicionar nova política que permite DELETE para admin (autenticado)
CREATE POLICY "Admin pode eliminar comentários"
  ON book_comments
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================
-- Após executar, verifica as políticas:
-- SELECT * FROM pg_policies WHERE tablename = 'book_comments';

-- Agora o admin consegue eliminar comentários na dashboard!
