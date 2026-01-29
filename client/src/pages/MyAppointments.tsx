import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Scissors, User, Trash2, LogOut } from "lucide-react";
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
import { useState } from "react";

export default function MyAppointments() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);

  const { data: appointments, isLoading, refetch } = trpc.appointments.myAppointments.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const cancelAppointment = trpc.appointments.cancel.useMutation({
    onSuccess: () => {
      toast.success("Agendamento cancelado com sucesso!");
      setAppointmentToCancel(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao cancelar agendamento");
    },
  });

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso!");
      setLocation("/");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Scissors className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-foreground">Login Necessário</CardTitle>
            <CardDescription className="text-muted-foreground">
              Você precisa estar logado para ver seus agendamentos
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
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">Voltar</Button>
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

      {/* Appointments List */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-2">Meus Agendamentos</h2>
            <p className="text-muted-foreground">Olá, {user?.name}! Aqui estão seus agendamentos.</p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando agendamentos...</p>
            </div>
          ) : appointments && appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const appointmentDateTime = new Date(appointment.appointmentDate);
                const isExpired = appointmentDateTime < new Date();
                const isCancelled = appointment.status === "cancelled";

                return (
                  <Card key={appointment.id} className={isCancelled ? "opacity-50" : ""}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-foreground">{appointment.service?.name || 'Serviço'}</CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Barbeiro: {appointment.barber?.name}
                          </CardDescription>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isCancelled
                            ? "bg-red-500/10 text-red-500"
                            : isExpired
                              ? "bg-gray-500/10 text-gray-500"
                              : appointment.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                              appointment.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                              appointment.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                              'bg-red-500/10 text-red-500'
                        }`}>
                          {isCancelled ? 'Cancelado' :
                           isExpired ? 'Expirado' :
                           appointment.status === 'confirmed' ? 'Confirmado' :
                           appointment.status === 'pending' ? 'Pendente' :
                           appointment.status === 'completed' ? 'Concluído' :
                           'Cancelado'}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{appointmentDateTime.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                        {appointment.service?.price && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="font-medium text-foreground">Valor:</span>
                            <span>{appointment.service.price}</span>
                          </div>
                        )}
                      </div>
                      {appointment.notes && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            <strong>Observações:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}
                      {!isCancelled && !isExpired && (
                        <div className="flex gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setAppointmentToCancel(appointment.id)}
                            disabled={cancelAppointment.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Cancelar Agendamento
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg text-muted-foreground mb-4">Você ainda não tem agendamentos</p>
                <Link href="/agendar">
                  <Button>Fazer Primeiro Agendamento</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={appointmentToCancel !== null} onOpenChange={(open) => !open && setAppointmentToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Não, manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (appointmentToCancel) {
                  cancelAppointment.mutate({ appointmentId: appointmentToCancel });
                }
              }}
              disabled={cancelAppointment.isPending}
            >
              Sim, cancelar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
