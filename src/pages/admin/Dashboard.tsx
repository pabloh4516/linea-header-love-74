import { useAllProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Package, FolderOpen, LayoutDashboard, ArrowRight, TrendingUp, Eye, ShoppingCart, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const useOrders = () => useQuery({
  queryKey: ["orders"],
  queryFn: async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});

const useCustomers = () => useQuery({
  queryKey: ["customers"],
  queryFn: async () => {
    const { data, error } = await supabase.from("customers").select("*");
    if (error) throw error;
    return data;
  },
});

const Dashboard = () => {
  const { data: products } = useAllProducts();
  const { data: categories } = useCategories();
  const { data: sections } = useHomepageSections();
  const { data: orders } = useOrders();
  const { data: customers } = useCustomers();

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length ?? 0;

  // Generate chart data from orders (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayStr = date.toISOString().split("T")[0];
    const dayOrders = orders?.filter(o => o.created_at.startsWith(dayStr)) ?? [];
    return {
      day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
      orders: dayOrders.length,
    };
  });

  // Orders by status for bar chart
  const statusData = [
    { status: "Pendente", count: orders?.filter(o => o.status === "pending").length ?? 0, fill: "hsl(40, 96%, 64%)" },
    { status: "Processando", count: orders?.filter(o => o.status === "processing").length ?? 0, fill: "hsl(210, 100%, 52%)" },
    { status: "Enviado", count: orders?.filter(o => o.status === "shipped").length ?? 0, fill: "hsl(152, 56%, 48%)" },
    { status: "Entregue", count: orders?.filter(o => o.status === "delivered").length ?? 0, fill: "hsl(152, 56%, 38%)" },
    { status: "Cancelado", count: orders?.filter(o => o.status === "cancelled").length ?? 0, fill: "hsl(0, 84%, 60%)" },
  ].filter(d => d.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Visão geral da sua loja.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Total", value: `€${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "hsl(var(--admin-success))" },
          { label: "Pedidos", value: orders?.length ?? 0, icon: ShoppingCart, sub: pendingOrders > 0 ? `${pendingOrders} pendentes` : undefined, color: "hsl(var(--admin-info))" },
          { label: "Produtos", value: products?.length ?? 0, icon: Package, sub: `${products?.filter(p => p.is_visible).length ?? 0} ativos`, color: "hsl(var(--admin-warning))" },
          { label: "Clientes", value: customers?.length ?? 0, icon: Users, color: "hsl(152, 56%, 48%)" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-muted-foreground">{stat.label}</p>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="h-4 w-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="text-2xl font-semibold mt-2">{stat.value}</p>
            {stat.sub && <p className="text-[11px] text-muted-foreground mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <h2 className="text-[14px] font-semibold mb-4">Receita (7 dias)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 56%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 56%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(210, 10%, 70%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210, 10%, 70%)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(152, 56%, 48%)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <h2 className="text-[14px] font-semibold mb-4">Pedidos por Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} stroke="hsl(210, 10%, 70%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(210, 10%, 70%)" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Bar key={index} dataKey="count" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-[13px] text-muted-foreground">
              Sem pedidos ainda
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))]">
        <div className="p-4 border-b border-[hsl(var(--admin-border))]">
          <h2 className="text-[14px] font-semibold">Ações Rápidas</h2>
        </div>
        <div className="divide-y divide-[hsl(var(--admin-border))]">
          {[
            { label: "Gerenciar Produtos", desc: `${products?.length ?? 0} produtos`, url: "/admin/products", icon: Package },
            { label: "Ver Pedidos", desc: `${pendingOrders} pendentes`, url: "/admin/orders", icon: ShoppingCart },
            { label: "Personalizar Tema", desc: "Cores, fontes e layout", url: "/admin/theme", icon: Eye },
            { label: "Editar Homepage", desc: `${sections?.length ?? 0} seções`, url: "/admin/homepage", icon: LayoutDashboard },
          ].map((action) => (
            <Link key={action.url} to={action.url} className="flex items-center justify-between p-3.5 hover:bg-[hsl(var(--admin-surface-hover))] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[hsl(var(--admin-bg))] flex items-center justify-center">
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[13px] font-medium">{action.label}</p>
                  <p className="text-[11px] text-muted-foreground">{action.desc}</p>
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
