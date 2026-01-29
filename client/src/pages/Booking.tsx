import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Scissors } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function Booking() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: barbers } = trpc.barbers.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();

  const [formData, setFormData] = useState({
    barberId: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "",
    clientName: user?.name || "",
    clientPhone: "",
    notes: "",
  });

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento realizado com sucesso!");
      setLocation("/agendamento-confirmado");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar agendamento");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para agendar");
      return;
    }

    if (!formData.barberId || !formData.serviceId || !formData.appointmentDate || !formData.appointmentTime || !formData.clientName.trim()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createAppointment.mutate({
      barberId: parseInt(formData.barberId),
      serviceId: parseInt(formData.serviceId),
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      notes: formData.notes,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Scissors className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-foreground">Login Necessário</CardTitle>
            <CardDescription className="text-muted-foreground">
              Você precisa estar logado para fazer um agendamento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a href={getLoginUrl()} className="block">
              <Button className="w-full">Fazer Login</Button>
            </a>
            <Link href="/">
              <Button variant="outline" className="w-full">Voltar para Início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Scissors className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Barbearia Vila Nova</h1>
            </div>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm">Voltar</Button>
          </Link>
        </div>
      </header>

      {/* Booking Form */}
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-foreground">Agendar Horário</CardTitle>
            <CardDescription className="text-muted-foreground">
              Preencha os dados abaixo para agendar seu horário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="clientName" className="text-foreground">Nome Completo</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                  className="bg-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientPhone" className="text-foreground">Telefone</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className="bg-input text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="barberId" className="text-foreground">Barbeiro</Label>
                <Select
                  value={formData.barberId}
                  onValueChange={(value) => setFormData({ ...formData, barberId: value })}
                  required
                >
                  <SelectTrigger id="barberId" className="bg-input text-foreground">
                    <SelectValue placeholder="Selecione um barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers?.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id.toString()}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceId" className="text-foreground">Serviço</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                  required
                >
                  <SelectTrigger id="serviceId" className="bg-input text-foreground">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {services?.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - {service.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate" className="text-foreground">Data</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="bg-input text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appointmentTime" className="text-foreground">Horário</Label>
                  <Select
                    value={formData.appointmentTime}
                    onValueChange={(value) => setFormData({ ...formData, appointmentTime: value })}
                    required
                  >
                    <SelectTrigger id="appointmentTime" className="bg-input text-foreground">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Alguma preferência ou observação?"
                  className="bg-input text-foreground"
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createAppointment.isPending}>
                {createAppointment.isPending ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
