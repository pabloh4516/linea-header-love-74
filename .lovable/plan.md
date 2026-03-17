

# Painel Admin 100% Configuravel com Lovable Cloud

Este e um projeto grande. Vou dividir em fases para manter qualidade e nao sobrecarregar. Aqui esta o plano completo, comecando pela **Fase 1** que estabelece a base.

---

## Fase 1 -- Base de dados + Painel Admin (o que faremos agora)

### 1. Banco de Dados (Lovable Cloud / Supabase)

Criar as seguintes tabelas:

- **products** -- id, name, category, price, image_url, hover_image_url, is_new, description, material, dimensions, weight, sku, sort_order, created_at
- **categories** -- id, name, slug, description, header_image_url, sort_order
- **site_settings** -- id, key, value (pares chave/valor para: nome da loja, logo_url, cores do tema, texto do status bar, moeda, etc.)
- **homepage_sections** -- id, section_type (hero, fifty_fifty, editorial, carousel, one_third_two_thirds), title, subtitle, description, link_url, sort_order, is_visible, image_url, image_url_2, cta_text

### 2. Painel Admin (`/admin`)

Uma area protegida com sidebar contendo:

- **Dashboard** -- visao geral (total de produtos, categorias)
- **Produtos** -- CRUD completo: listar, criar, editar, deletar produtos com upload de imagem via Supabase Storage
- **Categorias** -- CRUD de categorias
- **Homepage** -- Gerenciar secoes da homepage (reordenar, editar textos/imagens, ativar/desativar)
- **Configuracoes** -- Logo, nome da loja, cores do tema, texto do status bar

### 3. Loja Dinamica

Atualizar os componentes existentes para buscar dados do banco:

- `ProductCarousel`, `ProductGrid` --> buscam da tabela `products`
- `FiftyFiftySection`, `LargeHero`, `EditorialSection`, `OneThirdTwoThirdsSection` --> buscam de `homepage_sections`
- `Navigation` logo e `Footer` --> buscam de `site_settings`
- `Category` page --> busca produtos filtrados por categoria

### 4. Autenticacao Admin

- Login simples com email/senha via Supabase Auth
- Tabela `user_roles` com role `admin`
- RLS policies para proteger as tabelas (somente admins editam, leitura publica)

---

## Fase 2 (futuro)

- Upload de imagens com drag & drop
- Preview ao vivo das alteracoes
- Gerenciamento de pedidos
- Configuracao de navegacao (menu items)
- Paginas "Sobre" editaveis

---

## Detalhes Tecnicos

- Usaremos **Lovable Cloud** para provisionar o Supabase automaticamente
- Migrations para criar as tabelas
- Seed data com os produtos/secoes atuais (para nao perder nada)
- `@tanstack/react-query` para fetch de dados (ja instalado)
- Supabase Storage para imagens de produtos
- Componentes admin usando shadcn/ui existentes (Table, Dialog, Form, Sidebar)
- Rota `/admin` com layout separado (sidebar + content area)

---

## Escopo da Implementacao

Serao criados/modificados aproximadamente 20-25 arquivos:
- 6+ migrations SQL
- 1 client config (`src/integrations/supabase/client.ts`)
- 8+ componentes admin (layout, sidebar, paginas CRUD)
- 5+ componentes da loja atualizados para dados dinamicos
- Auth context + login page
- Edge function para role check

Este e um projeto substancial. Recomendo comecar pela **Fase 1** e iterar. Quer que eu comece?

