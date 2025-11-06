import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

/**
 * ADMIN/CRON FUNCTION - Price Checker
 * 
 * This function uses SERVICE_ROLE_KEY to bypass RLS as it updates prices
 * for all users' tracked products. It's designed to be called by:
 * - Scheduled cron jobs
 * - Admin webhooks with authentication
 * 
 * Security: Protected by custom admin key check
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin access via custom header
    const adminKey = req.headers.get("x-admin-key");
    const expectedKey = Deno.env.get("PRICE_CHECK_ADMIN_KEY");
    
    if (!adminKey || !expectedKey || adminKey !== expectedKey) {
      console.warn("[Price Check] Unauthorized access attempt");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all active tracked products
    const { data: products, error: productsError } = await supabaseClient
      .from("tracked_products")
      .select("*")
      .eq("is_active", true);

    if (productsError) throw productsError;

    console.log(`Checking prices for ${products?.length || 0} products`);

    // Mock price updates (in production, this would scrape actual prices)
    for (const product of products || []) {
      // Simulate price fluctuation (±5%)
      const priceChange = (Math.random() - 0.5) * 0.1; // -5% to +5%
      const newPrice = Number(product.current_price) * (1 + priceChange);
      const roundedPrice = Math.round(newPrice * 100) / 100;

      // Update product price
      const { error: updateError } = await supabaseClient
        .from("tracked_products")
        .update({
          current_price: roundedPrice,
          last_checked_at: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (updateError) {
        console.error(`Error updating product ${product.id}:`, updateError);
        continue;
      }

      // Add price history entry
      const { error: historyError } = await supabaseClient
        .from("price_history")
        .insert({
          product_id: product.id,
          price: roundedPrice,
        });

      if (historyError) {
        console.error(`Error adding price history for ${product.id}:`, historyError);
      }

      // Check if price dropped below target
      if (product.target_price && roundedPrice <= Number(product.target_price)) {
        console.log(`[Price Alert] ${product.product_name} dropped to $${roundedPrice}`);
        // In production, this would trigger a notification
        // For now, we just log it
      }
    }

    console.log(`[Price Check] Successfully checked ${products?.length || 0} products`);

    return new Response(
      JSON.stringify({
        success: true,
        checked: products?.length || 0,
        message: "Price check completed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Price Check Error]", error);
    return new Response(
      JSON.stringify({ error: "Price check operation failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});