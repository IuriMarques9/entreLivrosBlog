
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function middleware(request: NextRequest) {
  
  let response = NextResponse.next({
    request: { headers: request.headers },
  })


  // 1. INICIALIZAR SUPABASE (Necessário para atualizar o token)
  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          
          response = NextResponse.next({request })

          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  );

  // 2. VERIFICAR AUTENTICAÇÃO
  const { data: { user } } = await supabase.auth.getUser()

  // 3. LÓGICA DE REDIRECIONAMENTO
  // Se não houver utilizador e tentar aceder a uma página protegida (ex: /admin)
  if (!user && request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se o utilizador já estiver logado e tentar ir ao login, manda para a dashboard
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
};

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
