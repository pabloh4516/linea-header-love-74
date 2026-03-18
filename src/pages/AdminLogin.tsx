import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store } from "lucide-react";

const AdminLogin = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[hsl(210,11%,15%)]">
      <div className="w-full max-w-sm space-y-6 p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(152,56%,48%)]">
            <Store className="h-6 w-6 text-white" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-xl font-semibold text-white">Linea Admin</h1>
            <p className="text-[13px] text-[hsl(210,10%,55%)]">Entre para gerenciar sua loja</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[hsl(210,10%,70%)]">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-9 text-[13px] bg-[hsl(210,11%,20%)] border-[hsl(210,11%,25%)] text-white placeholder:text-[hsl(210,10%,40%)] focus-visible:ring-[hsl(152,56%,48%)]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px] text-[hsl(210,10%,70%)]">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-9 text-[13px] bg-[hsl(210,11%,20%)] border-[hsl(210,11%,25%)] text-white placeholder:text-[hsl(210,10%,40%)] focus-visible:ring-[hsl(152,56%,48%)]"
            />
          </div>
          {error && (
            <p className="text-[12px] text-[hsl(0,84%,60%)] bg-[hsl(0,84%,60%,0.1)] px-3 py-2 rounded-lg">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full h-9 text-[13px] rounded-lg bg-[hsl(152,56%,48%)] hover:bg-[hsl(152,56%,42%)] text-white"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
