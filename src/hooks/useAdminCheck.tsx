import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!mounted) return;
        
        if (!user) {
          setLoading(false);
          setTimeout(() => navigate("/auth"), 0);
          return;
        }

        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!mounted) return;

        setIsAdmin(!!roles);
        setLoading(false);
        
        if (!roles) {
          setTimeout(() => navigate("/dashboard"), 0);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (mounted) {
          setLoading(false);
          setTimeout(() => navigate("/dashboard"), 0);
        }
      }
    };

    checkAdminStatus();
    
    return () => {
      mounted = false;
    };
  }, [navigate]);

  return { isAdmin, loading };
};
