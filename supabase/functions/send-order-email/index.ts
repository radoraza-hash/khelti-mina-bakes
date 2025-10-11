const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  customerName: string;
  phone: string;
  email?: string;
  items: Array<{
    productName: string;
    options: string;
    quantity: number;
    totalPrice: number;
  }>;
  totalPrice: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, phone, email, items, totalPrice }: OrderEmailRequest = await req.json();

    const itemsList = items
      .map(
        (item) =>
          `<li>${item.productName} ${item.options ? `(${item.options})` : ""} - Quantité: ${item.quantity} - ${item.totalPrice.toFixed(2)}€</li>`
      )
      .join("");

    // Send email notification using Resend API
    const emailHtml = `
      <h1>Nouvelle commande reçue 🥖</h1>
      <h2>Informations client</h2>
      <p><strong>Nom:</strong> ${customerName}</p>
      <p><strong>Téléphone:</strong> ${phone}</p>
      ${email ? `<p><strong>Email:</strong> ${email}</p>` : ""}
      
      <h2>Détail de la commande</h2>
      <ul>
        ${itemsList}
      </ul>
      
      <p><strong>Total:</strong> ${totalPrice.toFixed(2)}€</p>
      
      <p>Cette commande a été créée automatiquement depuis le site web.</p>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Chez Khelti Mina <onboarding@resend.dev>",
        to: ["chezkheltimina6k@yopmail.com"],
        subject: `Nouvelle commande de ${customerName}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Resend API error:", await emailResponse.text());
    }

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

Deno.serve(handler);