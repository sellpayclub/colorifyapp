import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
  requireAdmin?: boolean;
}

const OWNER_EMAIL = "personaldann@gmail.com";

const ProtectedRoute = ({ children, requireSubscription = false, requireAdmin = false }: ProtectedRouteProps) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Verificação rápida da sessão primeiro
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (!session) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);

        const isOwner = session.user.email === OWNER_EMAIL;
        if (isOwner) {
          setIsAdmin(true);
        }

        // Verificações adicionais apenas se necessário
        if ((requireAdmin && !isOwner) || requireSubscription) {
          const promises = [];
          
          if (requireAdmin && !isOwner) {
            promises.push(
              supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", session.user.id)
                .eq("role", "admin")
                .single()
                .then(({ data: roles }) => {
                  if (mounted) setIsAdmin(!!roles);
                })
            );
          }

          if (requireSubscription) {
            promises.push(
              supabase
                .from("subscriptions")
                .select("is_active")
                .eq("user_id", session.user.id)
                .eq("is_active", true)
                .single()
                .then(({ data: subscription }) => {
                  if (mounted) setHasSubscription(subscription?.is_active === true);
                })
            );
          }

          await Promise.all(promises);
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
        setLoading(false);
        if (!session) {
          setHasSubscription(false);
          setIsAdmin(false);
        } else if (session.user.email === OWNER_EMAIL) {
          setIsAdmin(true);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [requireSubscription, requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/colorify-login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/colorify" replace />;
  }

  if (requireSubscription && !hasSubscription) {
    return <Navigate to="/colorify-login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;