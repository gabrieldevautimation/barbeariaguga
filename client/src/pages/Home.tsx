import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Calendar, Scissors, Star, MapPin, Phone, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: barbers } = trpc.barbers.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <Scissors className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Barbearia Vila Nova</h1>
                <p className="text-xs text-muted-foreground">Estilo & Tradição</p>
              </div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Serviços
            </a>
            <a href="#equipe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Equipe
            </a>
            <a href="#contato" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contato
            </a>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
                <Link href="/meus-agendamentos">
                  <Button size="sm" variant="outline">
                    Meus Agendamentos
                  </Button>
                </Link>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Login</Button>
              </a>
            )}
          </nav>
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <Link href="/meus-agendamentos">
                <Button size="sm" variant="outline">
                  Meus Agendamentos
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="sm">Login</Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section with Image */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/barber-hero.jpg"
            alt="Barbearia profissional"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative container mx-auto px-4 py-32 md:py-48 flex flex-col items-center justify-center text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Estilo e <span className="text-primary">Tradição</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-200">
              A melhor barbearia da região. Cortes modernos com o toque clássico que você procura.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/agendar">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90">
                  <Calendar className="h-5 w-5" />
                  Agendar Horário
                </Button>
              </Link>
              <a href="#servicos">
                <Button size="lg" variant="outline" className="gap-2 border-primary/50 hover:bg-primary/10">
                  Ver Serviços
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Nossos Serviços</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Oferecemos uma variedade de serviços profissionais para deixar você impecável
            </p>
          </div>

          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="hover:border-primary/50 transition-colors group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-foreground text-xl">{service.name}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {service.description}
                        </CardDescription>
                      </div>
                      <Scissors className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">{service.price}</span>
                      <span className="text-sm text-muted-foreground">{service.duration} min</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando serviços...</p>
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section id="equipe" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Nossa Equipe</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Profissionais experientes e dedicados ao seu estilo
            </p>
          </div>

          {barbers && barbers.length > 0 ? (
            <>
              <div className="mb-16">
                <img
                  src="/barber-team.jpg"
                  alt="Equipe de barbeiros"
                  className="w-full rounded-lg shadow-2xl border border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {barbers.map((barber) => (
                  <Card key={barber.id} className="text-center hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/50 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Scissors className="h-10 w-10 text-background" />
                      </div>
                      <CardTitle className="text-foreground">{barber.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {barber.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Carregando equipe...</p>
            </div>
          )}
        </div>
      </section>

      {/* Barber Login Section */}
      <section className="py-16 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Barbeiro?</h3>
            <p className="text-muted-foreground mb-6">
              Acesse seu painel exclusivo para gerenciar seus agendamentos
            </p>
            <Link href="/barbeiro/login">
              <Button className="w-full gap-2">
                <Scissors className="h-4 w-4" />
                Acesso Barbeiro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contato" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Entre em Contato</h2>
            <p className="text-muted-foreground text-lg">
              Estamos prontos para atender você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="text-foreground">Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Rua Vila Nova, 123<br />
                  São Paulo, SP
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="text-foreground">Telefone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  (11) 98765-4321<br />
                  (11) 3456-7890
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
                <CardTitle className="text-foreground">Horários</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Seg-Sex: 09:00 - 19:00<br />
                  Sab: 09:00 - 17:00
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 Barbearia Vila Nova. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
