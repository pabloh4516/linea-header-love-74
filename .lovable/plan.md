

# Plano: Motor Completo de Temas estilo Shopify

## Resumo das 6 lacunas e como resolver

### 1. Homepage dinâmica (renderizador de seções)

**Problema**: `Index.tsx` importa componentes fixos. `AdminHomepage` tem CRUD de `homepage_sections` mas a storefront ignora.

**Solução**: Criar um `SectionRenderer` que lê `homepage_sections` do banco (via `useHomepageSections(true)`) e renderiza o componente correto para cada `section_type`. O `Index.tsx` passa a usar esse renderer ao invés dos imports estáticos.

```text
Index.tsx
  └─ SectionRenderer
       ├─ reads homepage_sections (visibleOnly=true, ordered by sort_order)
       ├─ maps section_type → component
       │    hero           → ImmersiveHero
       │    fifty_fifty    → FiftyFiftySection
       │    one_third_two_thirds → OneThirdTwoThirdsSection
       │    product_carousel → ProductCarousel
       │    editorial      → EditorialSection
       │    full_width_banner → FullWidthBanner
       │    story          → StorySection
       │    large_hero     → LargeHero
       └─ passes section data as props to each component
```

### 2. Componentes recebem dados do banco (não hardcoded)

**Problema**: `ImmersiveHero` tem "Nova Coleção 2026" hardcoded, imagem local, etc.

**Solução**: Cada componente de seção recebe uma prop `section` com os campos do banco (`title`, `subtitle`, `description`, `cta_text`, `link_url`, `image_url`, `image_url_2`, `config`). Usa fallback para o conteúdo estático atual se os campos vierem nulos.

Componentes afetados:
- `ImmersiveHero` — title, subtitle, cta_text, link_url, image_url
- `AsymmetricGrid` — config.items[] com image, title, subtitle, link
- `FullWidthBanner` — title, subtitle, cta_text, link_url, image_url
- `StorySection` — title, description, cta_text, link_url, image_url
- `ProductCarousel` — title, subtitle, cta_text
- `FiftyFiftySection` — config.items[] ou image_url + image_url_2
- `OneThirdTwoThirdsSection` — config.items[]
- `EditorialSection` — title, description, cta_text, link_url, image_url
- `LargeHero` — title, subtitle, image_url

### 3. Schema por seção (campos editáveis por tipo)

**Problema**: O editor de temas edita só settings globais. Cada seção deveria ter seus próprios campos.

**Solução**: No `AdminHomepage`, ao editar uma seção, mostrar campos dinâmicos baseados no `section_type`. Definir um `SECTION_SCHEMA` que mapeia cada tipo para seus campos editáveis. Usar o campo `config` (JSONB) para dados extras como arrays de items/blocks.

```text
SECTION_SCHEMA = {
  hero: [
    { key: "title", label: "Título", type: "text" },
    { key: "subtitle", label: "Subtítulo", type: "text" },
    { key: "cta_text", label: "Texto do botão", type: "text" },
    { key: "link_url", label: "Link", type: "text" },
    { key: "image_url", label: "Imagem", type: "image" },
  ],
  fifty_fifty: [
    { key: "config.items", label: "Items", type: "blocks", blockSchema: [...] }
  ],
  ...
}
```

### 4. Sistema multi-tema (presets)

**Problema**: Sem opção de escolher entre temas pré-prontos.

**Solução**: Definir 3-4 presets no código (Minimal, Luxo, Moderno, Bold) como objetos `Record<string, string>` com valores para todas as keys de tema. Adicionar um seletor no topo do `AdminThemeEditor` que ao clicar aplica todos os valores do preset de uma vez. Não precisa de tabela nova — os presets são constantes no código, e ao aplicar, salvam nos `site_settings` normais.

### 5. Unificar editor de temas + gerenciador de seções

**Problema**: Editor de temas e AdminHomepage são páginas separadas.

**Solução**: Integrar a lista de seções da homepage dentro do `AdminThemeEditor`. Na sidebar, além dos grupos "Design", "Seções", "Configurações", adicionar um grupo "Página Inicial" que lista as seções dinâmicas do banco. Clicar numa seção abre seu formulário de edição inline no painel lateral, enquanto o preview mostra a homepage com scroll automático para a seção clicada. Manter o `AdminHomepage` como fallback mas adicionar um link "Abrir no Editor Visual" que redireciona para `/admin/theme`.

### 6. Blocks dentro de seções

**Problema**: Sem suporte a sub-itens (slides, grid items, etc).

**Solução**: Usar o campo `config` JSONB para armazenar arrays de blocks. Exemplo para `asymmetric_grid`:

```json
{
  "blocks": [
    { "image": "url", "title": "...", "subtitle": "...", "link": "/..." },
    { "image": "url", "title": "...", "subtitle": "...", "link": "/..." }
  ]
}
```

No formulário de edição, renderizar cada block como um sub-formulário com botões de adicionar/remover/reordenar.

---

## Ordem de implementação (por prioridade)

1. **SectionRenderer + props nos componentes** (lacunas 1 e 2) — é a base de tudo
2. **Schema por seção no AdminHomepage** (lacuna 3) — torna as seções realmente editáveis
3. **Blocks dentro de seções** (lacuna 6) — necessário para grids e carrosséis
4. **Unificar editor visual** (lacuna 5) — integrar seções no theme editor
5. **Presets de tema** (lacuna 4) — cereja do bolo

## Arquivos principais a criar/editar

| Arquivo | Ação |
|---------|------|
| `src/components/content/SectionRenderer.tsx` | **Criar** — renderizador dinâmico |
| `src/pages/Index.tsx` | **Editar** — usar SectionRenderer |
| `src/components/content/ImmersiveHero.tsx` | **Editar** — aceitar props do banco |
| `src/components/content/AsymmetricGrid.tsx` | **Editar** — aceitar props/blocks |
| `src/components/content/FullWidthBanner.tsx` | **Editar** — aceitar props |
| `src/components/content/StorySection.tsx` | **Editar** — aceitar props |
| `src/components/content/ProductCarousel.tsx` | **Editar** — aceitar props |
| `src/components/content/FiftyFiftySection.tsx` | **Editar** — aceitar props/blocks |
| `src/components/content/OneThirdTwoThirdsSection.tsx` | **Editar** — aceitar props/blocks |
| `src/components/content/EditorialSection.tsx` | **Editar** — aceitar props |
| `src/components/content/LargeHero.tsx` | **Editar** — aceitar props |
| `src/pages/admin/AdminHomepage.tsx` | **Editar** — schema dinâmico + blocks UI |
| `src/pages/admin/AdminThemeEditor.tsx` | **Editar** — integrar seções + presets |
| `src/hooks/useHomepageSections.ts` | Sem mudança (já funciona) |

Nenhuma migração de banco necessária — o schema atual (`homepage_sections` com `config` JSONB) já suporta tudo.

