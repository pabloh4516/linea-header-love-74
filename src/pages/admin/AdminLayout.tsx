import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  "/admin": "Início",
  "/admin/products": "Produtos",
  "/admin/categories": "Categorias",
  "/admin/homepage": "Homepage",
  "/admin/settings": "Configurações",
};

const AdminLayout = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--admin-border))] border-t-foreground" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--admin-bg))]">
        <div className="text-center space-y-2">
          <h1 className="text-xl font-medium text-foreground">Acesso Negado</h1>
          <p className="text-sm text-muted-foreground">Você não tem privilégios de administrador.</p>
        </div>
      </div>
    );
  }

  const currentLabel = routeLabels[location.pathname] || "Admin";
  const isSubPage = location.pathname !== "/admin";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[hsl(var(--admin-bg))]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 flex items-center gap-3 border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-4 shrink-0">
            <SidebarTrigger className="h-8 w-8" />
            <Separator orientation="vertical" className="h-5" />
            <Breadcrumb>
              <BreadcrumbList>
                {isSubPage && (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/admin" className="text-[13px]">Início</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[13px] font-medium">{currentLabel}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
