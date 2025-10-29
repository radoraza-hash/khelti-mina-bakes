import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  email: string;
  password: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { email, password }: Payload = await req.json();

    // Restrict to the intended admin email only for safety
    const allowedEmail = "rado.raza@gmail.com";
    if (email.toLowerCase() !== allowedEmail) {
      return new Response(JSON.stringify({ error: "Email non autorisé" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Try to create user first
    let userId: string | null = null;
    const createRes = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createRes.error) {
      // If already exists, try to find the user id and update password
      // List users and find by email
      let foundId: string | null = null;
      let page = 1;
      const perPage = 200;
      while (!foundId) {
        const list = await admin.auth.admin.listUsers({ page, perPage });
        if (list.error) throw list.error;
        const match = list.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
        if (match) {
          foundId = match.id;
          break;
        }
        if ((list.data.users?.length || 0) < perPage) break;
        page += 1;
      }

      if (!foundId) {
        throw new Error("Utilisateur introuvable et création impossible");
      }

      userId = foundId;

      const upd = await admin.auth.admin.updateUserById(userId, { password });
      if (upd.error) throw upd.error;
    } else {
      userId = createRes.data.user?.id ?? null;
    }

    if (!userId) throw new Error("Impossible de déterminer l'ID utilisateur");

    // Ensure admin role in public.user_roles
    const upsertRes = await admin
      .from("user_roles")
      .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });
    if (upsertRes.error) throw upsertRes.error;

    return new Response(
      JSON.stringify({ success: true, userId }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (e: any) {
    console.error("create-admin error", e);
    return new Response(
      JSON.stringify({ error: e?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});