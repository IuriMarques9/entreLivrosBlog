# 📚 Sistema de Comentários - Guia Completo

## 🎨 Como Funciona Visualmente

```
┌─ CARD DE LIVRO ───────────────────────────────────────┐
│                                                       │
│  [Capa] Título do Livro ⭐⭐⭐⭐⭐                      │
│         de Autor                                      │
│                                                       │
│         [Sinopse...]                                  │
│                                                       │
├─ COMENTÁRIOS ────────────────────────────────────────┤
│  💬 Comentários (3) ▼                                 │
│                                                       │
│  ┌─ FORMULÁRIO ──────────────────────────────────┐   │
│  │ Partilha a tua opinião sobre este livro...   │   │
│  │ ___________________________________________   │   │
│  │ ___________________________________________   │   │
│  │ ___________________________________________   │   │
│  │                                            │   │   │
│  │ 45/250          [✉️ Enviar]                │   │   │
│  └────────────────────────────────────────────┘   │
│                                                       │
│  ┌─ COMENTÁRIOS ─────────────────────────────────┐   │
│  │ "Adorei este livro, muito bom!"               │   │
│  │ 15 de Abril, 2025                              │   │
│  │                                                 │   │
│  │ "Excelente análise, recomendo!"                │   │
│  │ 14 de Abril, 2025                              │   │
│  │                                                 │   │
│  │ "Um clássico que todos devem ler"              │   │
│  │ 13 de Abril, 2025                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## ⚙️ Fluxo de Funcionamento

### 1️⃣ Carregamento
```
Utilizador expande card
         ↓
useBookComments hook chamado
         ↓
getBookComments() (Server Action)
         ↓
Supabase fetch comentários
         ↓
CommentsSection renderiza com lista
```

### 2️⃣ Submissão
```
Utilizador escreve comentário (máx. 250 chars)
         ↓
Clica "Enviar"
         ↓
CommentForm gera identificador único
         ↓
createBookComment() (Server Action)
         ↓
Validação server-side:
  ✓ Não vazio
  ✓ ≤ 250 caracteres
  ✓ User ainda não comentou este livro
         ↓
Se OK: Insere em Supabase
         ↓
Se erro: Mostra toast com mensagem
         ↓
Lista atualiza se sucesso
```

## 🔑 Componentes Principais

### CommentsSection.tsx
```typescript
interface CommentsSectionProps {
  bookId: number
  comments: BookComment[]
  onCommentAdded: () => void
  isLoading: boolean
  error: string | null
}
```
- Renderiza botão collapse/expand
- Mostra contador de comentários
- Lista comentários com datas
- Tem scroll máx. 64px

### CommentForm.tsx
```typescript
interface CommentFormProps {
  bookId: number
  onCommentAdded: () => void
}
```
- Textarea com validação em tempo real
- Indicador de caracteres (0/250)
- Botão desativado se vazio/muito longo
- Gerador de identificador único

### useBookComments.ts
```typescript
const { comments, loading, error, addComment, refetch } = useBookComments(bookId)
```
- `comments`: BookComment[]
- `loading`: boolean
- `error`: string | null
- `addComment`: (input) => Promise<boolean>
- `refetch`: () => Promise<void>

## 📊 Estrutura de Dados

### BookComment (Interface)
```typescript
interface BookComment {
  id: string              // UUID
  book_id: number
  user_identifier: string // e.g., "user_a1b2c3"
  comment_text: string   // até 250 caracteres
  created_at: string     // ISO 8601 timestamp
  updated_at: string
}
```

### Tabela Supabase: book_comments
```
┌─────────────┬──────────────┬────────────────────────────┐
│ id (UUID)   │ book_id      │ user_identifier            │
├─────────────┼──────────────┼────────────────────────────┤
│ abc123...   │ 5            │ user_a1b2c3                │
│ def456...   │ 5            │ user_x9y8z7                │
│ ghi789...   │ 7            │ user_a1b2c3                │
│ jkl012...   │ 5            │ user_m4n5o6                │
└─────────────┴──────────────┴────────────────────────────┘

UNIQUE(book_id, user_identifier) ← Garante um comentário por user
```

## 🛡️ Validações

### Client-side (CommentForm.tsx)
- Não enviar se vazio
- Não enviar se > 250 caracteres
- Desativar botão se inválido

### Server-side (commentActions.ts)
- Verificar campos obrigatórios
- Verificar limite de 250 caracteres
- Verificar se user já comentou este livro
- Retornar erro específico se violação UNIQUE

## 📱 Responsividade

CommentsSection adapta-se automaticamente:
- Mobile: full width, scroll vertical
- Desktop: aparence semelhante

Utiliza Tailwind CSS classes:
- `max-h-64` - altura máxima com scroll
- `overflow-y-auto` - scroll vertical
- Responsive padding e spacing

## 🔔 Mensagens de Feedback

| Situação | Mensagem | Tipo |
|----------|----------|------|
| Comentário vazio | "Por favor, escreve um comentário" | Error |
| Muito longo | "O comentário excede o limite de 250 caracteres" | Error |
| Já comentou | "Já comentaste este livro" | Error |
| Erro servidor | "Erro ao adicionar comentário" | Error |
| Sucesso | "Comentário adicionado com sucesso!" | Success |

## 🆔 Identificação de Utilizador

Função `generateUserIdentifier()` cria hash baseado em:
```javascript
userAgent + language + timezone + screenResolution
↓
Hash em base36
↓
"user_a1b2c3"
```

**Vantagens:**
- ✅ Completamente anónimo
- ✅ Consistente para o mesmo utilizador
- ✅ Sem rastreamento cruzado
- ✅ Sem cookies necessários

**Notas:**
- Se utilizador limpar cookies/cache: novo identificador
- Se mudar browser: novo identificador
- Se mudar resolução: novo identificador (raro)

## 🚀 Deployment Checklist

- [ ] SQL executado no Supabase (criar tabela)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurado
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` configurado
- [ ] Build passa sem erros: `npm run build`
- [ ] Testar em produção: adicionar comentário num livro
- [ ] Verificar comentário aparece em novo carregamento

## 🐛 Troubleshooting

**Comentários não aparecem:**
- Verifica se tabela foi criada no Supabase
- Verifica permissões da tabela (deve ser pública de leitura)

**Erro "You have already commented":**
- Sistema está funcionando! Um comentário por livro por utilizador.
- Testa com outro browser ou máquina para ignorar.

**Toast notifications não aparecem:**
- `sonner` está na package.json? (já deve estar)
- Provider de Sonner em providers.tsx? (verifica)

## 📚 Referências

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations)
- [Sonner Toast](https://sonner.emilkowal.ski/)
- [Lucide React Icons](https://lucide.dev/)
