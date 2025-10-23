import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const createUserSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(100),
  name: z.string().trim().min(1).max(100),
  role: z.enum(["user", "admin"]).default("user"),
});

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

    // Get and validate request body
    const requestBody = await req.json();
    
    let validated;
    try {
      validated = createUserSchema.parse(requestBody);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        throw new Error(`Validation failed: ${validationError.errors[0].message}`);
      }
      throw new Error("Invalid input data");
    }
    
    console.log("Creating user:", { email: validated.email, name: validated.name, role: validated.role });

    // Create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
      user_metadata: { name: validated.name },
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
        email: validated.email,
        name: validated.name,
      });

    if (profileError) {
      console.error("Profile creation failed:", profileError);
      throw profileError;
    }

    console.log("Profile created successfully");

    // Assign role
    console.log("Assigning role:", validated.role);
    const { error: roleInsertError } = await supabaseAdmin
      .from("user_roles")
      .insert({
        user_id: newUser.user.id,
        role: validated.role,
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
          name: validated.name
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
