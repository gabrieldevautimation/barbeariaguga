import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { barbers, services } from "./drizzle/schema.ts";
import "dotenv/config";

const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
const db = drizzle(client);

// Simple password hashing (same as in routers.ts)
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

async function seed() {
  console.log("Seeding database...");

  // Insert barbers
  const barbersData = [
    {
      name: "Carlos Silva",
      description: "Especialista em cortes clássicos e modernos",
      imageUrl: null,
      password: hashPassword("barber123"),
      isActive: true,
    },
    {
      name: "João Santos",
      description: "Expert em barbas e degradês",
      imageUrl: null,
      password: hashPassword("barber123"),
      isActive: true,
    },
    {
      name: "Pedro Oliveira",
      description: "Mestre em cortes estilizados",
      imageUrl: null,
      password: hashPassword("barber123"),
      isActive: true,
    },
    {
      name: "Lucas Ferreira",
      description: "Especialista em design de barba",
      imageUrl: null,
      password: hashPassword("barber123"),
      isActive: true,
    },
  ];

  await db.insert(barbers).values(barbersData);
  console.log("✅ Barbeiros inseridos");

  // Insert services
  const servicesData = [
    {
      name: "Corte Tradicional",
      description: "Corte clássico com tesoura e máquina",
      price: "R$ 40,00",
      duration: 30,
      isFeatured: true,
    },
    {
      name: "Corte + Barba",
      description: "Corte completo com design de barba",
      price: "R$ 60,00",
      duration: 45,
      isFeatured: true,
    },
    {
      name: "Barba",
      description: "Aparar e modelar barba",
      price: "R$ 30,00",
      duration: 20,
      isFeatured: false,
    },
    {
      name: "Degradê",
      description: "Corte degradê moderno",
      price: "R$ 45,00",
      duration: 35,
      isFeatured: true,
    },
    {
      name: "Sobrancelha",
      description: "Design de sobrancelha",
      price: "R$ 15,00",
      duration: 10,
      isFeatured: false,
    },
    {
      name: "Pigmentação",
      description: "Pigmentação de barba ou cabelo",
      price: "R$ 80,00",
      duration: 60,
      isFeatured: false,
    },
  ];

  await db.insert(services).values(servicesData);
  console.log("✅ Serviços inseridos");

  console.log("✅ Seed concluído!");
  console.log("\nCredenciais dos barbeiros:");
  console.log("Nome: Carlos Silva | Senha: barber123");
  console.log("Nome: João Santos | Senha: barber123");
  console.log("Nome: Pedro Oliveira | Senha: barber123");
  console.log("Nome: Lucas Ferreira | Senha: barber123");

  process.exit(0);
}

seed().catch((error) => {
  console.error("Erro ao fazer seed:", error);
  process.exit(1);
});
