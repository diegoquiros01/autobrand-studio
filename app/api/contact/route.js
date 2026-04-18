export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !message) {
      return Response.json({ error: "Campos requeridos: name, email, message" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }

    // TODO: integrate email service (Resend, SendGrid) to forward messages

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "Error procesando mensaje" }, { status: 500 });
  }
}
