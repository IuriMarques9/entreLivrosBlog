# 🚀 Guia Passo-a-Passo: Setup do Sistema de Comentários

## ✅ O que já foi feito

O código do sistema de comentários já foi implementado. Agora precisa-se apenas de uma coisa: **criar a tabela no Supabase**.

### Ficheiros adicionados ao projeto:
- ✅ `src/hooks/useBookComments.ts` - Hook de comentários
- ✅ `src/components/Home/CommentsSection.tsx` - Secção colapsável
- ✅ `src/components/Home/CommentForm.tsx` - Formulário
- ✅ `src/app/commentActions.ts` - Server Actions
- ✅ `src/interface/book.ts` - Tipos atualizados

### Ficheiros de documentação:
- 📖 `COMMENTS_GUIDE.md` - Documentação detalhada
- 📖 `SETUP_INSTRUCTIONS.md` - Instruções iniciais
- 🔧 `SQL_SETUP.sql` - Script SQL pronto para copiar

---

## 📋 Passo 1: Ir ao Supabase

1. Abre [https://app.supabase.com](https://app.supabase.com)
2. Faz login com a tua conta
3. Seleciona o teu projeto

```
Dashboard Supabase
├── Authentication
├── Database  ← Aqui!
├── Storage
├── Functions
└── ...
```

---

## 🗂️ Passo 2: Aceder ao SQL Editor

1. No menu da esquerda, clica em **"SQL"**
2. Clica em **"SQL Editor"** (ou "New Query")

```
Supabase > Database > SQL Editor
                     ↓
            [New Query]
```

---

## 📝 Passo 3: Copiar e Executar o SQL

1. Abre o ficheiro: `SQL_SETUP.sql` (no repositório)
2. Copia TODO o conteúdo SQL (linhas 1-98)
3. Cola no Supabase SQL Editor
4. Clica no botão **"Run"** (ou Ctrl+Enter)

```
[SQL_SETUP.sql] ← Ficheiro
      ↓
Copia tudo
      ↓
Supabase SQL Editor
      ↓
Cola (Ctrl+V)
      ↓
[Run] button
      ↓
✅ Sucesso! Tabela criada
```

---

## ✔️ Verificar se Funcionou

Após executar o SQL, deves ver:

```
✓ Created table: book_comments
✓ Created index: idx_book_comments_book_id
✓ Created index: idx_book_comments_user
✓ Created index: idx_book_comments_created
✓ Created policy: Comentários são públicos para leitura
✓ Created policy: Qualquer um pode comentar
✓ Created policy: Comentários não podem ser editados
✓ Created policy: Comentários não podem ser apagados
```

---

## 🧪 Passo 4: Testar (Opcional)

Para verificar que tudo funciona, executa este SQL no Supabase:

```sql
-- Ver estrutura da tabela
SELECT * FROM book_comments LIMIT 5;

-- Inserir um comentário de teste
INSERT INTO book_comments (book_id, user_identifier, comment_text)
VALUES (1, 'user_teste123', 'Este é um teste de comentário!');

-- Ver se foi inserido
SELECT * FROM book_comments WHERE book_id = 1;
```

---

## 🏃 Passo 5: Usar a Aplicação

1. Faz `npm run dev` para iniciar a aplicação
2. Vai à página de recomendações de livros
3. Expande um card de livro (clica nele ou no botão de expandir)
4. Deverás ver a secção "💬 Comentários" no fim do card
5. Escreve um comentário e clica "Enviar"

```
Card de Livro
     ↓
Expandir (click)
     ↓
Secção de Comentários aparece
     ↓
Preencer formulário (máx. 250 chars)
     ↓
[Enviar]
     ↓
✅ Comentário salvo!
```

---

## 🎯 Fluxo Visual Esperado

### Estado Inicial (Card Fechado)
```
┌─────────────────────────────────┐
│ [Capa] Título                   │
│        Autor ⭐⭐⭐⭐⭐         │
│                                 │
│ Sinopse...                       │
└─────────────────────────────────┘
```

### Após Expandir
```
┌─────────────────────────────────────┐
│ [Capa] Título                       │
│        Autor ⭐⭐⭐⭐⭐           │
│                                     │
│ Sinopse (completa)                  │
│                                     │
├─────────────────────────────────────┤
│ 💬 Comentários (0) ▼                │
│                                     │
│ Formulário:                         │
│ [Escreve aqui...]                  │
│ 0/250            [Enviar]           │
│                                     │
│ (sem comentários ainda)             │
└─────────────────────────────────────┘
```

### Após Adicionar Comentário
```
┌─────────────────────────────────────┐
│ ...                                 │
├─────────────────────────────────────┤
│ 💬 Comentários (1) ▼                │
│                                     │
│ Formulário:                         │
│ [Escreve aqui...]                  │
│ 0/250            [Enviar]           │
│                                     │
│ "Adorei este livro!"                │
│ 06 de Abril, 2025                   │
└─────────────────────────────────────┘
```

---

## ❓ Troubleshooting

### "Tabela não existe"
- Verifica se executaste o SQL corretamente
- Clica em "Table Editor" → procura "book_comments"

### "Erro 404 ao enviar comentário"
- Cria a tabela no Supabase
- Aguarda alguns segundos após criar (sincronização)

### "Erro: Já comentaste este livro"
- Normal! Significa que comentaste o livro com este browser
- Testa com outro browser ou máquina para ignorar

### "Toast (notificações) não aparecem"
- A biblioteca `sonner` já está instalada
- Verifica que `Providers` está em `layout.tsx`

### Nenhum erro mas comentários não são salvos
- Verifica as logs do Supabase (Dashboard > Logs)
- Confirma que RLS policies foram criadas

---

## 📊 Após Setup Completo

Depois de tudo configurado, tens:

✅ **Sistema de comentários funcional**
- Utilizadores podem comentar em livros
- Limite de 1 comentário por livro por utilizador
- Máximo 250 caracteres por comentário
- Interface colapsável (limpa, não ocupa espaço)
- Sem necessidade de login (anónimo)

✅ **Identificação automática**
- Sistema gera ID único baseado em dados do browser
- Sem cookies ou tracking excessivo
- Completamente anónimo

✅ **Armazenamento seguro**
- Dados guardados no Supabase
- RLS policies garantem segurança
- Índices otimizam performance

---

## 🎓 Estrutura Técnica

```
Utilizador
   ↓
BookCard (expandir)
   ↓
CommentsSection (renderizar)
   ↓
useBookComments hook
   ↓
getBookComments() (Server Action)
   ↓
Supabase (fetch)
   ↓
Lista de comentários renderizada
   
---

CommentForm (enviar)
   ↓
generateUserIdentifier() (client)
   ↓
createBookComment() (Server Action)
   ↓
Validação server-side
   ↓
Supabase (insert)
   ↓
Toast (sucesso/erro)
   ↓
Lista atualizada
```

---

## 📚 Próximas Melhorias (Futuramente)

Se quiseres expandir o sistema no futuro:

- [ ] Rating/votação de comentários (👍👎)
- [ ] Respostas a comentários
- [ ] Moderation (admin apagar spam)
- [ ] Notificações de novo comentário
- [ ] Formulário com nome/email
- [ ] Editar comentários próprios
- [ ] Limite de comentários por hora

---

## ✅ Checklist Final

- [ ] Supabase SQL executado
- [ ] Tabela `book_comments` criada
- [ ] Aplicação iniciada (`npm run dev`)
- [ ] Página de livros carregada
- [ ] Card expandido com sucesso
- [ ] Secção de comentários visível
- [ ] Comentário testado com sucesso
- [ ] Validação funcionando (impede 2º comentário)

🎉 **Parabéns! Sistema de comentários pronto!**

---

## 📞 Suporte

Se tiveres problemas:

1. Verifica o ficheiro `COMMENTS_GUIDE.md` para mais detalhes
2. Vê `SETUP_INSTRUCTIONS.md` para configuração original
3. Consulta `SQL_SETUP.sql` para problemas de SQL
4. Abre as dev tools (F12) para ver erros no console

---

**Última atualização:** 06 de Abril, 2025
**Estado:** ✅ Pronto para Setup
