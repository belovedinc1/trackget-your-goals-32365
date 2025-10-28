import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TrackedProduct {
  id: string;
  user_id: string;
  product_name: string;
  product_url: string;
  current_price: number;
  target_price?: number;
  platform: string;
  image_url?: string;
  is_active: boolean;
  last_checked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  recorded_at: string;
}

export interface AddProductData {
  product_name: string;
  product_url: string;
  current_price: number;
  target_price?: number;
  platform: string;
  image_url?: string;
}

export const useTrackedProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["tracked-products"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tracked_products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TrackedProduct[];
    },
  });

  const addProduct = useMutation({
    mutationFn: async (productData: AddProductData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tracked_products")
        .insert({
          ...productData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add initial price history entry
      await supabase.from("price_history").insert({
        product_id: data.id,
        price: productData.current_price,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-products"] });
      toast({
        title: "Success",
        description: "Product added to tracking",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("tracked_products")
        .delete()
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-products"] });
      toast({
        title: "Success",
        description: "Product removed from tracking",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleProductStatus = useMutation({
    mutationFn: async ({ productId, isActive }: { productId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("tracked_products")
        .update({ is_active: isActive })
        .eq("id", productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tracked-products"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    products: products || [],
    isLoading,
    addProduct,
    deleteProduct,
    toggleProductStatus,
  };
};

export const usePriceHistory = (productId: string) => {
  return useQuery({
    queryKey: ["price-history", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("price_history")
        .select("*")
        .eq("product_id", productId)
        .order("recorded_at", { ascending: true });

      if (error) throw error;
      return data as PriceHistory[];
    },
    enabled: !!productId,
  });
};