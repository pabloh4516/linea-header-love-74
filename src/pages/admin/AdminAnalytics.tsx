import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, Users, Globe, MousePointerClick, TrendingUp, Clock } from "lucide-react";

type DateRange = "today" | "7days" | "30days" | "90days";

const getDateRange = (range: DateRange) => {
  const now = new Date();
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  const from = new Date(now);
  switch (range) {
    case "today": from.setHours(0, 0, 0, 0); break;
    case "7days": from.setDate(from.getDate() - 7); from.setHours(0, 0, 0, 0); break;
    case "30days": from.setDate(from.getDate() - 30); from.setHours(0, 0, 0, 0); break;
    case "90days": from.setDate(from.getDate() - 90); from.setHours(0, 0, 0, 0); break;
  }
  return { from, to };
};

const RANGE_LABELS: Record<DateRange, string> = {
  today: "Hoje",
  "7days": "Últimos 7 dias",
  "30days": "Últimos 30 dias",
  "90days": "Últimos 90 dias",
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#f59e0b",
  "#10b981",
  "#6366f1",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
];

const AdminAnalytics = () => {
  const [range, setRange] = useState<DateRange>("30days");
  const { from, to } = getDateRange(range);

  const { data: pageViews = [], isLoading } = useQuery({
    queryKey: ["analytics-page-views", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString())
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 60000,
  });

  const stats = useMemo(() => {
    const uniqueVisitors = new Set(pageViews.map((pv) => pv.visitor_id)).size;
    const uniqueSessions = new Set(pageViews.map((pv) => pv.session_id).filter(Boolean)).size;
    const totalPageViews = pageViews.length;

    // Sessions by landing page
    const sessionFirstPage: Record<string, Set<string>> = {};
    const sessionSeen = new Set<string>();
    for (const pv of pageViews) {
      const sid = pv.session_id || pv.visitor_id;
      if (!sessionSeen.has(sid)) {
        sessionSeen.add(sid);
        if (!sessionFirstPage[pv.page_path]) sessionFirstPage[pv.page_path] = new Set();
        sessionFirstPage[pv.page_path].add(sid);
      }
    }
    const landingPages = Object.entries(sessionFirstPage)
      .map(([page, sessions]) => ({ page, sessions: sessions.size }))
      .sort((a, b) => b.sessions - a.sessions);

    // Page views by page
    const pageCount: Record<string, number> = {};
    for (const pv of pageViews) {
      pageCount[pv.page_path] = (pageCount[pv.page_path] || 0) + 1;
    }
    const topPages = Object.entries(pageCount)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views);

    // UTM sources
    const utmSourceCount: Record<string, number> = {};
    const utmMediumCount: Record<string, number> = {};
    const utmCampaignCount: Record<string, number> = {};
    for (const pv of pageViews) {
      const src = pv.utm_source || "(direto)";
      const med = pv.utm_medium || "(nenhum)";
      const camp = pv.utm_campaign || "(nenhuma)";
      utmSourceCount[src] = (utmSourceCount[src] || 0) + 1;
      utmMediumCount[med] = (utmMediumCount[med] || 0) + 1;
      utmCampaignCount[camp] = (utmCampaignCount[camp] || 0) + 1;
    }
    const utmSources = Object.entries(utmSourceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const utmMediums = Object.entries(utmMediumCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const utmCampaigns = Object.entries(utmCampaignCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Referrers
    const refCount: Record<string, number> = {};
    for (const pv of pageViews) {
      let ref = "(direto)";
      if (pv.referrer) {
        try { ref = new URL(pv.referrer).hostname; } catch { ref = pv.referrer; }
      }
      refCount[ref] = (refCount[ref] || 0) + 1;
    }
    const referrers = Object.entries(refCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Country data
    const countryCount: Record<string, number> = {};
    const cityCount: Record<string, number> = {};
    for (const pv of pageViews) {
      const country = (pv as any).country || "(desconhecido)";
      const city = (pv as any).city || "(desconhecido)";
      countryCount[country] = (countryCount[country] || 0) + 1;
      cityCount[city] = (cityCount[city] || 0) + 1;
    }
    const countries = Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const cities = Object.entries(cityCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Daily chart
    const dailyMap: Record<string, { views: number; visitors: Set<string> }> = {};
    for (const pv of pageViews) {
      const day = pv.created_at.split("T")[0];
      if (!dailyMap[day]) dailyMap[day] = { views: 0, visitors: new Set() };
      dailyMap[day].views++;
      dailyMap[day].visitors.add(pv.visitor_id);
    }
    const dailyChart = Object.entries(dailyMap)
      .map(([date, d]) => ({ date: date.slice(5), views: d.views, visitors: d.visitors.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Pages per session
    const sessionPages: Record<string, number> = {};
    for (const pv of pageViews) {
      const sid = pv.session_id || pv.visitor_id;
      sessionPages[sid] = (sessionPages[sid] || 0) + 1;
    }
    const avgPagesPerSession = Object.keys(sessionPages).length > 0
      ? (Object.values(sessionPages).reduce((a, b) => a + b, 0) / Object.keys(sessionPages).length).toFixed(1)
      : "0";

    return {
      uniqueVisitors, uniqueSessions, totalPageViews, avgPagesPerSession,
      landingPages, topPages,
      utmSources, utmMediums, utmCampaigns,
      referrers, countries, cities,
      dailyChart,
    };
  }, [pageViews]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Análise de tráfego e aquisição</p>
        </div>
        <Select value={range} onValueChange={(v) => setRange(v as DateRange)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(RANGE_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Eye className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPageViews}</p>
                <p className="text-xs text-muted-foreground">Visualizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueVisitors}</p>
                <p className="text-xs text-muted-foreground">Visitantes únicos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><MousePointerClick className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.uniqueSessions}</p>
                <p className="text-xs text-muted-foreground">Sessões</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><TrendingUp className="h-4 w-4 text-primary" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.avgPagesPerSession}</p>
                <p className="text-xs text-muted-foreground">Págs/Sessão</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Chart */}
      {stats.dailyChart.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tráfego Diário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dailyChart}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="views" name="Visualizações" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="visitors" name="Visitantes" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="acquisition">Aquisição</TabsTrigger>
          <TabsTrigger value="utm">UTMs</TabsTrigger>
          <TabsTrigger value="geo">Localização</TabsTrigger>
        </TabsList>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Páginas mais visitadas</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Página</TableHead>
                      <TableHead className="text-xs text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topPages.slice(0, 15).map((p) => (
                      <TableRow key={p.page}>
                        <TableCell className="text-xs font-mono truncate max-w-[200px]">{p.page}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{p.views}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Sessões por página de destino</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Página de destino</TableHead>
                      <TableHead className="text-xs text-right">Sessões</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.landingPages.slice(0, 15).map((p) => (
                      <TableRow key={p.page}>
                        <TableCell className="text-xs font-mono truncate max-w-[200px]">{p.page}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{p.sessions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Acquisition Tab */}
        <TabsContent value="acquisition" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Referrers (origem do tráfego)</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.referrers.length > 0 && (
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.referrers.slice(0, 8)}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {stats.referrers.slice(0, 8).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Origem</TableHead>
                      <TableHead className="text-xs text-right">Visitas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.referrers.slice(0, 10).map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="text-xs">{r.name}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{r.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* UTM Tab */}
        <TabsContent value="utm" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "UTM Source", data: stats.utmSources },
              { title: "UTM Medium", data: stats.utmMediums },
              { title: "UTM Campaign", data: stats.utmCampaigns },
            ].map(({ title, data }) => (
              <Card key={title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Valor</TableHead>
                        <TableHead className="text-xs text-right">Visitas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.slice(0, 10).map((r) => (
                        <TableRow key={r.name}>
                          <TableCell className="text-xs truncate max-w-[120px]">{r.name}</TableCell>
                          <TableCell className="text-xs text-right font-medium">{r.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Geo Tab */}
        <TabsContent value="geo" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" /> País
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">País</TableHead>
                      <TableHead className="text-xs text-right">Visitas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.countries.slice(0, 15).map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="text-xs">{r.name}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{r.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Cidade
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Cidade</TableHead>
                      <TableHead className="text-xs text-right">Visitas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.cities.slice(0, 15).map((r) => (
                      <TableRow key={r.name}>
                        <TableCell className="text-xs">{r.name}</TableCell>
                        <TableCell className="text-xs text-right font-medium">{r.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <p className="text-xs text-muted-foreground">
            💡 Dados de localização (país/cidade) serão preenchidos automaticamente conforme novos acessos forem registrados via edge function de geolocalização.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
