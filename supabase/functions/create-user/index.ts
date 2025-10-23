import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("=== CREATE USER FUNCTION STARTED ===");
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Initializing Supabase admin client...");
    
    const supabaseAdmin = createClient(
      supabaseUrl ?? "",
      supabaseServiceKey ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the requester is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header");
      throw new Error("Unauthorized - No auth header");
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("Verifying user token...");
    
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error("User verification failed:", userError);
      throw new Error("Unauthorized - Invalid token");
    }

    console.log("User verified:", user.email);

    // Check if user is admin
    console.log("Checking admin status for user:", user.id);
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      console.error("Admin check failed:", roleError);
      throw new Error("Insufficient permissions - User is not admin");
    }

    console.log("Admin verified, proceeding with user creation");

    // Get request body
    const { email, password, name, role } = await req.json();
    console.log("Creating user:", { email, name, role });

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (createError) {
      console.error("User creation failed:", createError);
      throw createError;
    }

    console.log("User created successfully:", newUser.user.id);

    // Create profile
    console.log("Creating profile...");
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUser.user.id,
        email,
        name,
      });

    if (profileError) {
      console.error("Profile creation failed:", profileError);
      throw profileError;
    }

    console.log("Profile created successfully");

    // Assign role
    console.log("Assigning role:", role || "user");
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role: role || "user",
      });

    if (roleInsertError) {
      console.error("Role assignment failed:", roleInsertError);
      throw roleInsertError;
    }

    console.log("Role assigned successfully");
    console.log("=== USER CREATION COMPLETED ===");

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          name: name
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("=== ERROR IN CREATE USER ===");
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
