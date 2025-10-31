import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const orderEmailSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  customerEmail: z.string().trim().email().max(255),
  phone: z.string().trim().min(8).max(20).regex(/^[\d\s\+\-\(\)]+$/),
  items: z.array(z.object({
    productName: z.string().trim().min(1).max(200),
    options: z.string().max(500).optional(),
    quantity: z.number().int().positive().max(1000),
    totalPrice: z.number().positive().max(100000),
  })).min(1).max(100),
  totalPrice: z.number().positive().max(100000),
});

interface OrderEmailRequest {
  customerName: string;
  customerEmail: string;
  phone: string;
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
    const requestData = await req.json();
    
    // Validate input
    const validationResult = orderEmailSchema.safeParse(requestData);
    if (!validationResult.success) {
      console.error("Input validation failed:", validationResult.error.issues);
      return new Response(
        JSON.stringify({ error: "Invalid request data" }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { customerName, customerEmail, phone, items, totalPrice } = validationResult.data;

    console.log("Sending order confirmation to:", customerEmail);

    const itemsList = items
      .map(
        (item) =>
          `<li style="margin: 8px 0;">${item.productName} ${item.options ? `(${item.options})` : ""} - Quantité: ${item.quantity} - ${item.totalPrice.toFixed(2)}€</li>`
      )
      .join("");

    // Email de confirmation pour le client
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d97706;">Confirmation de commande 🥖</h1>
          <p>Bonjour ${customerName},</p>
          <p>Nous avons bien reçu votre commande !</p>
          
          <h2 style="color: #d97706; margin-top: 20px;">Détail de votre commande</h2>
          <ul style="list-style-type: none; padding: 0; background: #f9fafb; padding: 15px; border-radius: 8px;">
            ${itemsList}
          </ul>
          
          <p style="font-size: 1.2em; font-weight: bold; color: #d97706; margin-top: 20px;">
            Total: ${totalPrice.toFixed(2)}€
          </p>
          
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <p style="margin: 0;"><strong>📱 Numéro de contact:</strong> ${phone}</p>
            <p style="margin: 8px 0 0 0;">Vous serez informé par SMS de la date pour récupérer votre commande.</p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 0.9em;">
            Merci pour votre confiance !<br>
            <strong>Chez Khelti Mina</strong>
          </p>
        </body>
      </html>
    `;

    // Email de notification pour l'admin
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d97706;">Nouvelle commande reçue 🥖</h1>
          
          <h2 style="color: #d97706;">Informations client</h2>
          <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
            <p style="margin: 5px 0;"><strong>Nom:</strong> ${customerName}</p>
            <p style="margin: 5px 0;"><strong>Téléphone:</strong> ${phone}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${customerEmail}</p>
          </div>
          
          <h2 style="color: #d97706; margin-top: 20px;">Détail de la commande</h2>
          <ul style="list-style-type: none; padding: 0; background: #f9fafb; padding: 15px; border-radius: 8px;">
            ${itemsList}
          </ul>
          
          <p style="font-size: 1.2em; font-weight: bold; color: #d97706; margin-top: 20px;">
            Total: ${totalPrice.toFixed(2)}€
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 0.9em;">
            Cette commande a été créée automatiquement depuis le site web.
          </p>
        </body>
      </html>
    `;

    // Envoi de l'email de confirmation au client
    const customerEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Chez Khelti Mina <onboarding@resend.dev>",
        to: [customerEmail],
        subject: "Confirmation de votre commande - Chez Khelti Mina",
        html: customerEmailHtml,
      }),
    });

    if (!customerEmailResponse.ok) {
      const errorText = await customerEmailResponse.text();
      console.error("Resend API error (customer email):", errorText);
      throw new Error(`Failed to send customer email: ${customerEmailResponse.status}`);
    }

    console.log("✅ Customer confirmation email sent to:", customerEmail);

    // Envoi de la notification à l'admin en parallèle
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Chez Khelti Mina <onboarding@resend.dev>",
          to: ["radzio1000001@yopmail.com"],
          subject: `Nouvelle commande de ${customerName}`,
          html: adminEmailHtml,
      }),
    }).then(async (adminEmailResponse) => {
      if (!adminEmailResponse.ok) {
        console.error("Admin notification failed:", await adminEmailResponse.text());
      } else {
        console.log("✅ Admin notification sent");
      }
    }).catch((error) => {
      console.error("Error sending admin notification:", error);
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process email request" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

Deno.serve(handler);