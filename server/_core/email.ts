import { ENV } from "./env";

export async function sendNoShowEmail(
  clientEmail: string,
  clientName: string,
  barberName: string,
  noShowCount: number
): Promise<boolean> {
  if (!clientEmail) {
    console.warn("[Email] Client email is missing");
    return false;
  }

  try {
    // Using Manus built-in email service through the Forge API
    const endpoint = `${ENV.forgeApiUrl}/email/send`;
    
    const isBlocked = noShowCount >= 2;
    
    const emailContent = isBlocked
      ? `Olá ${clientName},\n\nNotamos que você não compareceu a seu agendamento com ${barberName} na Barbearia Vila Nova.\n\nEste é o segundo aviso. Infelizmente, após múltiplas ausências sem aviso prévio, você não poderá mais agendar horários em nossa barbearia.\n\nSe você gostaria de explicar o motivo da sua ausência ou gostaria de conversar sobre isso, entre em contato conosco.\n\nAtenciosamente,\nBarbearia Vila Nova`
      : `Olá ${clientName},\n\nNotamos que você não compareceu a seu agendamento com ${barberName} na Barbearia Vila Nova.\n\nGostaria de saber o motivo da sua ausência para que possamos melhorar nosso atendimento. Se houver algum problema ou se você precisar reagendar, entre em contato conosco.\n\nAtenciosamente,\nBarbearia Vila Nova`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: clientEmail,
        subject: isBlocked 
          ? "Aviso: Sua conta foi bloqueada para novos agendamentos" 
          : "Notificação: Você não compareceu ao seu agendamento",
        html: emailContent.replace(/\n/g, "<br>"),
        text: emailContent,
      }),
    });

    if (!response.ok) {
      console.warn(`[Email] Failed to send email (${response.status})`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Email] Error sending email:", error);
    return false;
  }
}
