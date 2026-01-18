import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Subscription {
  id: string;
  user_id: string;
  plan: string;
  credits_total: number;
  credits_used: number;
  credits_remaining: number;
  is_active: boolean;
  renewal_date?: string;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  creditsPercentage: number;
  isBlocked: boolean;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sempre garantir que o cleanup seja chamado, mesmo quando não há user
    let mounted = true;

    if (!user) {
      if (mounted) {
        setLoading(false);
        setSubscription(null);
      }
      return () => {
        mounted = false;
      };
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No subscription found - create one for existing users
            try {
              const { data: newSubscription, error: createError } = await supabase
                .from("subscriptions")
                .insert({
                  user_id: user.id,
                  plan: 'iniciante',
                  credits_total: 5,
                  credits_used: 0,
                  is_active: true
                })
                .select()
                .single();

              if (createError) {
                console.error("Error creating subscription:", createError);
                // Se falhar por RLS, tentar novamente após um delay (pode ser que a migration ainda não tenha sido aplicada)
                setTimeout(async () => {
                  const { data: retrySubscription, error: retryError } = await supabase
                    .from("subscriptions")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                  if (!retryError && retrySubscription) {
                    setSubscription(retrySubscription);
                  }
                }, 2000);
                setSubscription(null);
              } else {
                setSubscription(newSubscription);
              }
            } catch (insertError) {
              console.error("Exception creating subscription:", insertError);
              setSubscription(null);
            }
          } else {
            console.error("Error fetching subscription:", error);
            setSubscription(null);
          }
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Single realtime subscription for all components
    const channel = supabase
      .channel(`subscription-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Subscription }) => {
          if (mounted) {
            setSubscription(payload.new);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload: { new: Subscription }) => {
          if (mounted) {
            setSubscription(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const creditsPercentage = useMemo(() => {
    if (!subscription || subscription.credits_total === 0) return 100;
    return (subscription.credits_remaining / subscription.credits_total) * 100;
  }, [subscription]);

  const isBlocked = useMemo(() => {
    return subscription !== null && subscription.credits_remaining === 0;
  }, [subscription]);

  return {
    subscription,
    loading,
    creditsPercentage,
    isBlocked,
  };
};
