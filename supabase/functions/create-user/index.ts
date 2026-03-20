import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify the caller is authenticated and is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const anonKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await supabaseClient.auth.getUser();
    if (!caller) throw new Error("Not authenticated");

    // Check caller is admin
    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role, school_id")
      .eq("id", caller.id)
      .single();
    if (!callerProfile || callerProfile.role !== "admin") {
      throw new Error("Only admins can create users");
    }

    const { email, password, full_name, role } = await req.json();
    if (!email || !password || !full_name || !role) {
      throw new Error("Missing required fields: email, password, full_name, role");
    }

    const validRoles = ["teacher", "student", "parent"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role. Must be teacher, student, or parent");
    }

    // Create user with admin API (doesn't affect caller's session)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;

    // Create profile
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUser.user.id,
      school_id: callerProfile.school_id,
      role,
      full_name,
      email,
    });
    if (profileError) throw profileError;

    // Create user_roles entry
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: newUser.user.id,
      role,
    });
    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ user: { id: newUser.user.id, email, full_name, role } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
