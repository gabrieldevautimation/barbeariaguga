import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Scissors } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function BarberLogin() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  const login = trpc.barbers.login.useMutation({
    onSuccess: (data) => {
      // Armazenar dados do barbeiro no localStorage
      localStorage.setItem("barber_session", JSON.stringify(data));
      toast.success("Login realizado com sucesso!");
      setLocation("/barbeiro/painel");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao fazer login");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Scissors className="h-12 w-12 text-primary mx-auto mb-4" />
          <CardTitle className="text-3xl text-foreground">Acesso Barbeiro</CardTitle>
          <CardDescription className="text-muted-foreground">
            Entre com suas credenciais para acessar o painel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-input text-foreground"
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-input text-foreground"
                placeholder="Sua senha"
              />
            </div>

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Entrando..." : "Entrar"}
            </Button>

            <Link href="/">
              <Button variant="outline" className="w-full">Voltar para Início</Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
