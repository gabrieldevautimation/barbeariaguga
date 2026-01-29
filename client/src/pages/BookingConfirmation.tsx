import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Scissors } from "lucide-react";
import { Link } from "wouter";

export default function BookingConfirmation() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse"></div>
              <CheckCircle2 className="h-16 w-16 text-primary relative" />
            </div>
          </div>
          <CardTitle className="text-3xl text-foreground">Agendamento Confirmado!</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Seu horário foi agendado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Você receberá uma confirmação no email e poderá visualizar seu agendamento na área "Meus Agendamentos"
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/meus-agendamentos">
              <Button className="w-full gap-2">
                <Scissors className="h-4 w-4" />
                Ir para Meus Agendamentos
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Voltar para Início
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
