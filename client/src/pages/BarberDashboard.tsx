import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, LogOut, Phone, Scissors, User, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BarberSession {
  id: number;
  name: string;
}

interface AppointmentAction {
  appointmentId: number;
  action: 'complete' | 'no-show';
}

export default function BarberDashboard() {
  const [, setLocation] = useLocation();
  const [barber, setBarber] = useState<BarberSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointmentAction, setAppointmentAction] = useState<AppointmentAction | null>(null);

  const { data: appointments, isLoading: appointmentsLoading, refetch } = trpc.appointments.barberAppointmentsByDate.useQuery(
    barber ? { barberId: barber.id, date: selectedDate } : { barberId: 0, date: selectedDate },
    { enabled: !!barber }
  );

  const completeAppointment = trpc.appointments.complete.useMutation({
    onSuccess: () => {
      toast.success("Corte finalizado com sucesso!");
      setAppointmentAction(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao finalizar corte");
    },
  });

  const markNoShow = trpc.appointments.markNoShow.useMutation({
    onSuccess: () => {
      toast.success("Cliente marcado como nao compareceu. Email enviado!");
      setAppointmentAction(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao registrar nao comparecimento");
    },
  });

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("barber_session");
      toast.success("Logout realizado com sucesso!");
      setLocation("/barbeiro/login");
    },
  });

  useEffect(() => {
    const session = localStorage.getItem("barber_session");
    if (session) {
      try {
        const barberData = JSON.parse(session);
        setBarber(barberData);
      } catch {
        localStorage.removeItem("barber_session");
        setLocation("/barbeiro/login");
      }
    } else {
      setLocation("/barbeiro/login");
    }
    setIsLoading(false);
  }, [setLocation]);

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Redirecionando...</p>
      </div>
    );
  }

  const selectedDateObj = new Date(selectedDate);
  const isToday = selectedDateObj.toDateString() === new Date().toDateString();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Scissors className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel do Barbeiro</h1>
              <p className="text-sm text-muted-foreground">Olá, {barber.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">Início</Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-2">
              {isToday ? "Cortes de Hoje" : "Cortes do Dia"}
            </h2>
            <p className="text-muted-foreground">Gerencie seus horários e atendimentos</p>
          </div>

          {/* Date Selector */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Selecione uma Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousDay}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="max-w-xs"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextDay}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleToday}
                >
                  Hoje
                </Button>

                <span className="text-sm text-muted-foreground">
                  {selectedDateObj.toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          {appointmentsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando agendamentos...</p>
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-foreground">{appointment.service?.name || "Serviço"}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          Cliente: {appointment.clientName}
                        </CardDescription>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          appointment.status === "confirmed"
                            ? "bg-green-500/10 text-green-500"
                            : appointment.status === "pending"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : appointment.status === "completed"
                                ? "bg-blue-500/10 text-blue-500"
                                : appointment.status === "no-show"
                                  ? "bg-red-500/10 text-red-500"
                                  : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {appointment.status === "confirmed"
                          ? "Confirmado"
                          : appointment.status === "pending"
                            ? "Pendente"
                            : appointment.status === "completed"
                              ? "Concluído"
                              : appointment.status === "no-show"
                                ? "Nao Compareceu"
                                : "Cancelado"}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4 text-primary" />
                        <span>{appointment.clientName}</span>
                      </div>
                      {appointment.clientPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4 text-primary" />
                          <span>{appointment.clientPhone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{new Date(appointment.appointmentDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{appointment.appointmentTime}</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mb-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Observações:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                    <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-foreground">Serviço: {appointment.service?.name}</p>
                      {appointment.service?.price && (
                        <p className="text-sm text-muted-foreground">Valor: {appointment.service.price}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {appointment.status !== "completed" && appointment.status !== "no-show" && appointment.status !== "cancelled" && (
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setAppointmentAction({ appointmentId: appointment.id, action: 'complete' })}
                          disabled={completeAppointment.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Corte Finalizado
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setAppointmentAction({ appointmentId: appointment.id, action: 'no-show' })}
                          disabled={markNoShow.isPending}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cliente Não Veio
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground">Nenhum agendamento para este dia</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={appointmentAction !== null} onOpenChange={(open) => !open && setAppointmentAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {appointmentAction?.action === 'complete' ? 'Confirmar Corte Finalizado?' : 'Confirmar Cliente Não Veio?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentAction?.action === 'complete'
                ? 'Marcar este corte como finalizado com sucesso?'
                : 'O cliente será marcado como não comparecido e receberá um email. Se repetir, ele não poderá mais agendar.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (appointmentAction) {
                  if (appointmentAction.action === 'complete') {
                    completeAppointment.mutate({ appointmentId: appointmentAction.appointmentId });
                  } else {
                    markNoShow.mutate({ appointmentId: appointmentAction.appointmentId });
                  }
                }
              }}
              disabled={completeAppointment.isPending || markNoShow.isPending}
            >
              Confirmar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
