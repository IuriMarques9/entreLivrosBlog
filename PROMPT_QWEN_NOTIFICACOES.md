# Prompt de Implementação para o `qwen3-coder:480b-cloud`

Copia e cola o texto abaixo diretamente para o chat do modelo `qwen3-coder`:

---

**Contexto do Projeto:**
Estou a trabalhar num projeto Next.js (App Router) utilizando o Supabase como backend e Typescript. Tenho um sistema de comentários onde os utilizadores podem deixar comentários num livro (a tabela chama-se `book_comments`).
A minha página de administração está localizada em `src/app/admin/page.tsx` (que é um Server Component). Tenho também uma `<Navbar />` na pasta `src/components/Admin` (ou `src/app/layout` que uso na dashboard).

**Objetivo:**
Quero implementar um **Centro de Notificações** simples no Dashboard de Admin:
1. Quando o Admin entra na dashboard, deverá existir um ícone de sino (Bell icon) na Navbar ou no topo da página.
2. Esse ícone deverá mostrar um emblema/badge com o número de notificações NÃO LIDAS (que neste caso são os novos comentários feitos pelos utilizadores).
3. Ao clicar no ícone, abre-se um Dropdown/Popover listando esses comentários recentes.
4. Deve existir a opção num comentário (ou botão "Marcar todas como lidas") para marcar a notificação como lida, tirando-a dessa lista de unread.

Gostaria que gerasses o código passo-a-passo para a seguinte arquitetura:

### Passo 1: Atualização da Base de Dados (SQL)
Gera o script SQL para adicionar a coluna `is_read BOOLEAN DEFAULT false` à tabela `book_comments` já existente no Supabase.

### Passo 2: Server Actions para Notificações
Na pasta `src/app/admin/actions.ts` (ou ficheiro semelhante das tuas Server Actions), escreve duas funções:
- `getUnreadComments()`: vai buscar os comentários mais recentes onde `is_read` é falso (traz o nome/id do livro e o texto do comentário).
- `markCommentAsRead(commentId: string)`: atualiza o Supabase, mudando o `is_read` para `true` num determinado comentário.

### Passo 3: Componente de Dropdown (NotificationCenter.tsx)
Cria um Client Component de nome `NotificationCenter.tsx` (ex: na pasta `src/components/Admin`). 
Este componente deve:
- Iniciar com uma lista de comentários pre-fetched (passada pelas props via Server Component).
- Renderizar o ícone de sino com a contagem de mensagens unread (usando lucide-react, por exemplo).
- Ao clicar no sino, mostra o overlay com a lista.
- Quando se clica em "Marcar como lido" num comentário, chama a Server Action de forma otimista/assíncrona e remove visualmente o comentário do estado local.

### Passo 4: Integração na Admin Page
Mostra-me como buscar initialmente os unread comments na `src/app/admin/page.tsx` (ou no layout) e como injetar e usar o `<NotificationCenter />`.

Por favor, gera exemplos limpos e compatíveis com Server Actions e Tailwind CSS. Mostra todo o layout dos ficheiros.
