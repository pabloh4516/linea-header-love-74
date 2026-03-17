import { useAllProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useHomepageSections } from "@/hooks/useHomepageSections";
import { Package, FolderOpen, Home } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-6">
      <Icon className="h-8 w-8 text-muted-foreground" />
      <div>
        <p className="text-2xl font-light">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: products } = useAllProducts();
  const { data: categories } = useCategories();
  const { data: sections } = useHomepageSections();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-light">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Package} label="Produtos" value={products?.length ?? 0} />
        <StatCard icon={FolderOpen} label="Categorias" value={categories?.length ?? 0} />
        <StatCard icon={Home} label="Seções Homepage" value={sections?.length ?? 0} />
      </div>
    </div>
  );
};

export default Dashboard;
