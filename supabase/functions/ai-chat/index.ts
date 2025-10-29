import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get user's financial data to provide context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth user from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Fetch user's financial summary
    const [expensesResult, savingsResult, emisResult] = await Promise.all([
      supabase.from("expenses").select("*").eq("user_id", user.id),
      supabase.from("savings_goals").select("*").eq("user_id", user.id),
      supabase.from("emi_loans").select("*").eq("user_id", user.id),
    ]);

    // Calculate financial summary
    const totalExpenses = expensesResult.data?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
    const expensesByCategory = expensesResult.data?.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
      return acc;
    }, {} as Record<string, number>) || {};
    
    const totalSavings = savingsResult.data?.reduce((sum, goal) => sum + Number(goal.current_amount), 0) || 0;
    const savingsGoals = savingsResult.data?.length || 0;
    
    const activeLoans = emisResult.data?.length || 0;
    const totalEMI = emisResult.data?.reduce((sum, emi) => sum + Number(emi.emi_amount), 0) || 0;

    const systemPrompt = `You are a helpful AI financial assistant for Trackget, a personal finance management app. 
    
Current user's financial summary:
- Total Expenses: $${totalExpenses.toFixed(2)}
- Expenses by Category: ${JSON.stringify(expensesByCategory)}
- Total Savings: $${totalSavings.toFixed(2)}
- Active Savings Goals: ${savingsGoals}
- Active Loans: ${activeLoans}
- Monthly EMI: $${totalEMI.toFixed(2)}

Provide personalized, actionable financial advice based on this data. Be friendly, concise, and helpful. 
When users ask about their spending, refer to the actual numbers above. 
Suggest ways to optimize their finances and achieve their goals.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
