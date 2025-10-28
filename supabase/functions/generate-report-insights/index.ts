// Deno edge function runtime

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportData {
  expenses: {
    total: number;
    byCategory: Record<string, number>;
    byMonth: Array<{ month: string; amount: number }>;
  };
  savings: {
    totalSaved: number;
    totalTarget: number;
    goalProgress: Array<{ title: string; progress: number; current: number; target: number }>;
  };
  emi: {
    totalOutstanding: number;
    monthlyPayment: number;
    loans: Array<{ lender: string; outstanding: number; emi: number }>;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reportData } = await req.json() as { reportData: ReportData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Prepare context for AI
    const topCategory = Object.entries(reportData.expenses.byCategory).sort((a, b) => b[1] - a[1])[0];
    const savingsProgress = reportData.savings.totalTarget > 0
      ? (reportData.savings.totalSaved / reportData.savings.totalTarget) * 100
      : 0;

    const prompt = `Analyze this financial report and provide 3-4 actionable insights and recommendations:

Expenses:
- Total: ₹${reportData.expenses.total.toLocaleString()}
- Top Category: ${topCategory ? `${topCategory[0]} (₹${topCategory[1].toLocaleString()})` : "N/A"}
- Monthly Trend: ${reportData.expenses.byMonth.length} months of data

Savings:
- Total Saved: ₹${reportData.savings.totalSaved.toLocaleString()}
- Total Target: ₹${reportData.savings.totalTarget.toLocaleString()}
- Progress: ${savingsProgress.toFixed(1)}%
- Active Goals: ${reportData.savings.goalProgress.length}

EMI/Loans:
- Total Outstanding: ₹${reportData.emi.totalOutstanding.toLocaleString()}
- Monthly Payment: ₹${reportData.emi.monthlyPayment.toLocaleString()}
- Active Loans: ${reportData.emi.loans.length}

Provide specific, actionable advice on budgeting, savings optimization, and debt management. Keep it concise and practical.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional financial advisor. Provide clear, actionable insights based on financial data.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const insights = data.choices[0].message.content;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating insights:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
