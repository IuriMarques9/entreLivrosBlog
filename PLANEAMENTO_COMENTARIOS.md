# Planeamento: Sistema de Comentários (Entrelivros Blog)

Este documento foi criado para planearmos juntos a finalização deste sistema. Podes editar este ficheiro ou responder-me no chat sobre o que queres mudar.

## 🎯 Objetivos Atuais

1. **Configuração da Base de Dados**: Aplicar o script `SQL_SETUP.sql` no Supabase.
2. **Verificação da Interface**: Garantir que o componente `CommentsSection` está a funcionar no `BookCard.tsx`.
3. **Melhoria do Admin**: Validar se o painel admin permite apagar comentários indesejados.

## 📝 Próximos Passos (Checklist)

- [ ] **Passo 1: Setup SQL**
  - Copiar o conteúdo de `SQL_SETUP.sql`.
  - Executar no SQL Editor do Supabase.
  - Verificar se a tabela `book_comments` foi criada.

- [ ] **Passo 2: Teste de Fluxo**
  - Tentar adicionar um comentário num livro.
  - Verificar se o contador de comentários atualiza.
  - Testar o bloqueio de comentários duplicados.

- [ ] **Passo 3: Polish do Admin**
  - Abrir o dashboard de admin do blog.
  - Verificar se a lista de comentários está visível e funcional.

---
**Nota do teu assistente:** Diz-me por onde queres começar ou se queres adicionar mais alguma funcionalidade aqui!
