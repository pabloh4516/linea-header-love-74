import { useAllProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { Package, FolderOpen, LayoutDashboard, ArrowRight, TrendingUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: products } = useAllProducts();
  const { data: categories } = useCategories();
  const { data: sections } = useHomepageSections();

  const visibleProducts = products?.filter(p => p.is_visible).length ?? 0;
  const newProducts = products?.filter(p => p.is_new).length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Visão Geral</h1>
        <p className="text-sm text-muted-foreground mt-1">Bem-vindo ao painel administrativo da sua loja.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Total de Produtos</p>
              <p className="text-2xl font-semibold mt-1">{products?.length ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[12px]">
            <Eye className="h-3 w-3 text-[hsl(var(--admin-success))]" />
            <span className="text-muted-foreground">{visibleProducts} visíveis</span>
            {newProducts > 0 && (
              <>
                <span className="text-muted-foreground">·</span>
                <TrendingUp className="h-3 w-3 text-[hsl(var(--admin-success))]" />
                <span className="text-muted-foreground">{newProducts} novos</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Categorias</p>
              <p className="text-2xl font-semibold mt-1">{categories?.length ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-muted-foreground">Seções da Homepage</p>
              <p className="text-2xl font-semibold mt-1">{sections?.length ?? 0}</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-[12px]">
            <Eye className="h-3 w-3 text-[hsl(var(--admin-success))]" />
            <span className="text-muted-foreground">
              {sections?.filter(s => s.is_visible).length ?? 0} visíveis
            </span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="p-5 border-b border-[hsl(var(--admin-border))]">
          <h2 className="text-[15px] font-semibold">Ações Rápidas</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--admin-border))]">
          {[
            { label: "Gerenciar Produtos", desc: "Adicionar, editar e organizar produtos", url: "/admin/products", icon: Package },
            { label: "Gerenciar Categorias", desc: "Criar e editar categorias da loja", url: "/admin/categories", icon: FolderOpen },
            { label: "Editar Homepage", desc: "Personalizar as seções da página inicial", url: "/admin/homepage", icon: LayoutDashboard },
          ].map((action) => (
            <Link
              key={action.url}
              to={action.url}
              className="flex items-center justify-between p-4 hover:bg-[hsl(var(--admin-surface-hover))] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-foreground">{action.label}</p>
                  <p className="text-[12px] text-muted-foreground">{action.desc}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
