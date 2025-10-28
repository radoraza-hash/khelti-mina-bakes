const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  customer_name: string;
  customer_email: string;
  items: Array<{
    productName: string;
    options: string;
    quantity: number;
    totalPrice: number;
  }>;
  total_amount: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customer_name, customer_email, items, total_amount }: OrderConfirmationRequest = await req.json();

    const currentDate = new Date().toLocaleString('fr-FR', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const itemsList = items
      .map(
        (item) =>
          `${item.productName} ${item.options ? `(${item.options})` : ""} - Quantité: ${item.quantity} - ${item.totalPrice.toFixed(2)}€`
      )
      .join("\n");

    const itemsListHtml = items
      .map(
        (item) =>
          `<li>${item.productName} ${item.options ? `(${item.options})` : ""} - Quantité: ${item.quantity} - ${item.totalPrice.toFixed(2)}€</li>`
      )
      .join("");

    // Text version
    const textContent = `
Nouvelle commande reçue 🥖

Date et heure: ${currentDate}

Informations client:
Nom: ${customer_name}
Email: ${customer_email}

Détail de la commande:
${itemsList}

Total: ${total_amount.toFixed(2)}€

Cette commande a été créée automatiquement depuis le site web.
    `;

    // HTML version
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #d97706;">Nouvelle commande reçue 🥖</h1>
            
            <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
              <strong>Date et heure:</strong> ${currentDate}
            </p>
            
            <h2 style="color: #d97706;">Informations client</h2>
            <p><strong>Nom:</strong> ${customer_name}</p>
            <p><strong>Email:</strong> ${customer_email}</p>
            
            <h2 style="color: #d97706;">Détail de la commande</h2>
            <ul style="list-style-type: none; padding: 0;">
              ${itemsListHtml}
            </ul>
            
            <p style="font-size: 1.2em; font-weight: bold; color: #d97706;">
              Total: ${total_amount.toFixed(2)}€
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #6b7280; font-size: 0.9em;">
              Cette commande a été créée automatiquement depuis le site web.
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email via SendGrid
    const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: "Replyradzio1000001@yopmail.com" }],
            subject: `Nouvelle commande de ${customer_name}`,
          },
        ],
        from: {
          email: "noreply@chezkheltimina.com",
          name: "Chez Khelti Mina",
        },
        content: [
          {
            type: "text/plain",
            value: textContent,
          },
          {
            type: "text/html",
            value: htmlContent,
          },
        ],
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("SendGrid API error:", errorText);
      throw new Error(`SendGrid API error: ${emailResponse.status}`);
    }

    console.log("✅ Email sent successfully via SendGrid");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

Deno.serve(handler);