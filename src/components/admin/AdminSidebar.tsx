import { LayoutDashboard, Package, FolderOpen, Home, Settings, LogOut, Store, Search, ShoppingCart, Users, Palette, BarChart3, Tag, Zap, FileText } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Início", url: "/admin", icon: Home },
  { title: "Pedidos", url: "/admin/orders", icon: ShoppingCart },
  { title: "Produtos", url: "/admin/products", icon: Package },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpen },
  { title: "Clientes", url: "/admin/customers", icon: Users },
];

const marketingItems = [
  { title: "Cupons", url: "/admin/coupons", icon: Tag },
  { title: "Order Bumps", url: "/admin/order-bumps", icon: Zap },
];

const contentItems = [
  { title: "Homepage", url: "/admin/homepage", icon: LayoutDashboard },
  { title: "Páginas", url: "/admin/pages", icon: FileText },
  { title: "Editor de Tema", url: "/admin/theme", icon: Palette },
  { title: "Relatórios", url: "/admin/analytics", icon: BarChart3 },
];

const settingsItems = [
  { title: "Configurações", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  const menuButtonClass = "h-8 text-[13px] font-normal data-[active=true]:bg-[hsl(var(--sidebar-accent))] data-[active=true]:text-[hsl(var(--sidebar-accent-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-accent-foreground))]";

  const renderGroup = (items: typeof mainItems, label?: string) => (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[11px] font-medium uppercase tracking-wider text-[hsl(var(--sidebar-foreground)/0.5)] px-3">
          {!collapsed && label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} className={menuButtonClass}>
                <Link to={item.url}>
                  <item.icon className="h-[18px] w-[18px]" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--sidebar-primary))]">
            <Store className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-[13px] font-semibold text-[hsl(var(--sidebar-accent-foreground))] truncate">
              Linea Jewelry
            </span>
          )}
        </div>
      </SidebarHeader>

      {!collapsed && (
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--sidebar-accent))] px-3 py-1.5 text-[13px] text-[hsl(var(--sidebar-foreground))]">
            <Search className="h-3.5 w-3.5" />
            <span>Buscar</span>
          </div>
        </div>
      )}

      <SidebarContent>
        {renderGroup(mainItems)}
        {renderGroup(contentItems, "Loja Online")}
        {renderGroup(settingsItems, "Configuração")}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className={menuButtonClass}>
              <Link to="/" target="_blank">
                <Store className="h-[18px] w-[18px]" />
                {!collapsed && <span>Ver Loja</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className={menuButtonClass}>
              <LogOut className="h-[18px] w-[18px]" />
              {!collapsed && <span>Sair</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
