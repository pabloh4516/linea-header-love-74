import { useState, useEffect } from "react";
import { useAllProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Package, LayoutDashboard, ArrowRight, ShoppingCart, Users, DollarSign, Eye, Globe, CalendarIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, startOfDay, endOfDay, startOfWeek, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

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

type DateRange = "today" | "yesterday" | "7days" | "30days" | "this_week" | "this_month";

const getDateRange = (range: DateRange) => {
  const now = new Date();
  switch (range) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "yesterday":
      const yd = subDays(now, 1);
      return { from: startOfDay(yd), to: endOfDay(yd) };
    case "7days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "30days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "this_week":
      return { from: startOfWeek(now, { locale: ptBR }), to: endOfDay(now) };
    case "this_month":
      return { from: startOfMonth(now), to: endOfDay(now) };
  }
};

const usePageViews = (range: DateRange) => {
  const { from, to } = getDateRange(range);
  return useQuery({
    queryKey: ["page-views", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 30000, // refresh every 30s
  });
};

const useLiveVisitors = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchLive = async () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("page_views")
        .select("visitor_id")
        .gte("created_at", fiveMinAgo);
      if (!error && data) {
        const unique = new Set(data.map(d => d.visitor_id));
        setCount(unique.size);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 15000);
    return () => clearInterval(interval);
  }, []);

  return count;
};

const DATE_RANGE_LABELS: Record<DateRange, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  "7days": "Últimos 7 dias",
  "30days": "Últimos 30 dias",
  this_week: "Esta semana",
  this_month: "Este mês",
};

const Dashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange>("today");
  const { data: products } = useAllProducts();
  const { data: categories } = useCategories();
  const { data: sections } = useHomepageSections();
  const { data: orders } = useOrders();
  const { data: customers } = useCustomers();
  const { data: pageViews } = usePageViews(dateRange);
  const liveVisitors = useLiveVisitors();

  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
  const pendingOrders = orders?.filter(o => o.status === "pending").length ?? 0;

  // Analytics from page views
  const totalViews = pageViews?.length ?? 0;
  const uniqueVisitors = new Set(pageViews?.map(pv => pv.visitor_id) ?? []).size;
  const uniqueSessions = new Set(pageViews?.map(pv => pv.session_id).filter(Boolean) ?? []).size;

  // Top pages
  const pageCounts: Record<string, number> = {};
  pageViews?.forEach(pv => {
    pageCounts[pv.page_path] = (pageCounts[pv.page_path] || 0) + 1;
  });
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Hourly views chart (for today/yesterday) or daily chart
  const isHourly = dateRange === "today" || dateRange === "yesterday";
  const { from: rangeFrom } = getDateRange(dateRange);

  let chartData: { label: string; views: number; visitors: number }[] = [];

  if (isHourly) {
    chartData = Array.from({ length: 24 }, (_, h) => {
      const hourViews = pageViews?.filter(pv => new Date(pv.created_at).getHours() === h) ?? [];
      return {
        label: `${h.toString().padStart(2, "0")}h`,
        views: hourViews.length,
        visitors: new Set(hourViews.map(v => v.visitor_id)).size,
      };
    });
  } else {
    const days = dateRange === "7days" ? 7 : dateRange === "30days" ? 30 : Math.ceil((Date.now() - rangeFrom.getTime()) / 86400000) + 1;
    chartData = Array.from({ length: Math.min(days, 31) }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dayStr = format(date, "yyyy-MM-dd");
      const dayViews = pageViews?.filter(pv => pv.created_at.startsWith(dayStr)) ?? [];
      return {
        label: format(date, "dd/MM"),
        views: dayViews.length,
        visitors: new Set(dayViews.map(v => v.visitor_id)).size,
      };
    });
  }

  // Revenue chart (last 7 days)
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

  const statusData = [
    { status: "Pendente", count: orders?.filter(o => o.status === "pending").length ?? 0, fill: "hsl(40, 96%, 64%)" },
    { status: "Processando", count: orders?.filter(o => o.status === "processing").length ?? 0, fill: "hsl(210, 100%, 52%)" },
    { status: "Enviado", count: orders?.filter(o => o.status === "shipped").length ?? 0, fill: "hsl(152, 56%, 48%)" },
    { status: "Entregue", count: orders?.filter(o => o.status === "delivered").length ?? 0, fill: "hsl(152, 56%, 38%)" },
    { status: "Cancelado", count: orders?.filter(o => o.status === "cancelled").length ?? 0, fill: "hsl(0, 84%, 60%)" },
  ].filter(d => d.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Visão geral da sua loja.</p>
        </div>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-48 h-8 text-[13px]">
            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Live visitors badge */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-[13px] font-medium text-foreground">
          {liveVisitors} {liveVisitors === 1 ? "visitante" : "visitantes"} ao vivo
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Visitantes", value: uniqueVisitors, icon: Users, color: "hsl(210, 100%, 52%)" },
          { label: "Visualizações", value: totalViews, icon: Eye, color: "hsl(262, 83%, 58%)" },
          { label: "Sessões", value: uniqueSessions, icon: Globe, color: "hsl(152, 56%, 48%)" },
          { label: "Receita Total", value: `R$${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "hsl(var(--admin-success))" },
          { label: "Pedidos", value: orders?.length ?? 0, icon: ShoppingCart, sub: pendingOrders > 0 ? `${pendingOrders} pendentes` : undefined, color: "hsl(var(--admin-info))" },
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

      {/* Analytics chart */}
      <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
        <h2 className="text-[14px] font-semibold mb-4">Tráfego — {DATE_RANGE_LABELS[dateRange]}</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 100%, 52%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 100%, 52%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(210, 10%, 70%)" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(210, 10%, 70%)" />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Area type="monotone" dataKey="views" name="Visualizações" stroke="hsl(210, 100%, 52%)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
            <Area type="monotone" dataKey="visitors" name="Visitantes" stroke="hsl(262, 83%, 58%)" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue + Status + Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <h2 className="text-[14px] font-semibold mb-4">Receita (7 dias)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={last7Days}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 56%, 48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 56%, 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(210, 10%, 70%)" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(210, 10%, 70%)" />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Area type="monotone" dataKey="revenue" name="Receita" stroke="hsl(152, 56%, 48%)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <h2 className="text-[14px] font-semibold mb-4">Pedidos por Status</h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 10%, 90%)" />
                <XAxis dataKey="status" tick={{ fontSize: 10 }} stroke="hsl(210, 10%, 70%)" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(210, 10%, 70%)" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" name="Pedidos" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Bar key={index} dataKey="count" fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[13px] text-muted-foreground">
              Sem pedidos ainda
            </div>
          )}
        </div>

        <div className="bg-[hsl(var(--admin-surface))] rounded-xl border border-[hsl(var(--admin-border))] p-5">
          <h2 className="text-[14px] font-semibold mb-4">Páginas Mais Visitadas</h2>
          {topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map(([path, count], i) => (
                <div key={path} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[11px] font-medium text-muted-foreground w-5">{i + 1}.</span>
                    <span className="text-[13px] truncate">{path === "/" ? "Página Inicial" : path}</span>
                  </div>
                  <span className="text-[13px] font-medium text-muted-foreground ml-2">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-[13px] text-muted-foreground">
              Sem dados ainda
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
