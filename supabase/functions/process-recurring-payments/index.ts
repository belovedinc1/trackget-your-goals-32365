import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { addMonths, addWeeks, addYears, addDays, format, isToday, parseISO } from "https://esm.sh/date-fns@3.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessedItem {
  type: "subscription" | "emi" | "recurring_template";
  name: string;
  amount: number;
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const today = format(new Date(), "yyyy-MM-dd");
    const processedItems: ProcessedItem[] = [];

    console.log(`[Process Recurring] Starting processing for date: ${today}`);

    // ==================== PROCESS SUBSCRIPTIONS ====================
    const { data: dueSubscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .lte("next_billing_date", today);

    if (subError) {
      console.error("[Process Recurring] Error fetching subscriptions:", subError);
      throw subError;
    }

    console.log(`[Process Recurring] Found ${dueSubscriptions?.length || 0} due subscriptions`);

    for (const sub of dueSubscriptions || []) {
      try {
        // Create expense record for subscription
        const { error: expenseError } = await supabase.from("expenses").insert({
          user_id: sub.user_id,
          amount: sub.amount,
          category: sub.category || "Subscriptions",
          description: `${sub.service_name} - ${sub.billing_cycle} subscription`,
          expense_date: today,
          type: "expense",
        });

        if (expenseError) {
          console.error(`[Process Recurring] Error creating expense for subscription ${sub.id}:`, expenseError);
          continue;
        }

        // Calculate next billing date
        let nextDate: Date;
        const currentNextDate = parseISO(sub.next_billing_date);
        
        switch (sub.billing_cycle) {
          case "weekly":
            nextDate = addWeeks(currentNextDate, 1);
            break;
          case "monthly":
            nextDate = addMonths(currentNextDate, 1);
            break;
          case "quarterly":
            nextDate = addMonths(currentNextDate, 3);
            break;
          case "yearly":
            nextDate = addYears(currentNextDate, 1);
            break;
          default:
            nextDate = addMonths(currentNextDate, 1);
        }

        // Update subscription with new next_billing_date
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({ next_billing_date: format(nextDate, "yyyy-MM-dd") })
          .eq("id", sub.id);

        if (updateError) {
          console.error(`[Process Recurring] Error updating subscription ${sub.id}:`, updateError);
          continue;
        }

        processedItems.push({
          type: "subscription",
          name: sub.service_name,
          amount: sub.amount,
          userId: sub.user_id,
        });

        console.log(`[Process Recurring] Processed subscription: ${sub.service_name} for user ${sub.user_id}`);
      } catch (err) {
        console.error(`[Process Recurring] Error processing subscription ${sub.id}:`, err);
      }
    }

    // ==================== PROCESS EMI PAYMENTS ====================
    const { data: dueLoans, error: emiError } = await supabase
      .from("emi_loans")
      .select("*")
      .eq("status", "active")
      .lte("next_payment_date", today)
      .gt("outstanding_amount", 0);

    if (emiError) {
      console.error("[Process Recurring] Error fetching EMI loans:", emiError);
      throw emiError;
    }

    console.log(`[Process Recurring] Found ${dueLoans?.length || 0} due EMI payments`);

    for (const loan of dueLoans || []) {
      try {
        // Calculate interest and principal components
        const monthlyInterestRate = loan.interest_rate / 12 / 100;
        const interestComponent = loan.outstanding_amount * monthlyInterestRate;
        const principalComponent = loan.emi_amount - interestComponent;
        const newOutstanding = Math.max(0, loan.outstanding_amount - principalComponent);

        // Create EMI payment record
        const { error: paymentError } = await supabase.from("emi_payments").insert({
          loan_id: loan.id,
          amount_paid: loan.emi_amount,
          principal_component: principalComponent,
          interest_component: interestComponent,
          payment_date: today,
          due_date: loan.next_payment_date,
          status: "paid",
          notes: "Auto-recorded payment",
        });

        if (paymentError) {
          console.error(`[Process Recurring] Error creating EMI payment for loan ${loan.id}:`, paymentError);
          continue;
        }

        // Create expense record for EMI
        const { error: expenseError } = await supabase.from("expenses").insert({
          user_id: loan.user_id,
          amount: loan.emi_amount,
          category: "EMI Payments",
          description: `${loan.lender_name} - EMI Payment`,
          expense_date: today,
          type: "expense",
        });

        if (expenseError) {
          console.error(`[Process Recurring] Error creating expense for EMI ${loan.id}:`, expenseError);
        }

        // Calculate next payment date
        const nextPaymentDate = addMonths(parseISO(loan.next_payment_date), 1);

        // Update loan with new outstanding amount and next payment date
        const updateData: Record<string, unknown> = {
          outstanding_amount: newOutstanding,
          next_payment_date: format(nextPaymentDate, "yyyy-MM-dd"),
        };

        // Mark as completed if fully paid
        if (newOutstanding <= 0) {
          updateData.status = "completed";
        }

        const { error: updateError } = await supabase
          .from("emi_loans")
          .update(updateData)
          .eq("id", loan.id);

        if (updateError) {
          console.error(`[Process Recurring] Error updating loan ${loan.id}:`, updateError);
          continue;
        }

        processedItems.push({
          type: "emi",
          name: loan.lender_name,
          amount: loan.emi_amount,
          userId: loan.user_id,
        });

        console.log(`[Process Recurring] Processed EMI payment: ${loan.lender_name} for user ${loan.user_id}`);
      } catch (err) {
        console.error(`[Process Recurring] Error processing EMI ${loan.id}:`, err);
      }
    }

    // ==================== PROCESS RECURRING EXPENSE TEMPLATES ====================
    const todayDate = new Date();
    const currentDay = todayDate.getDate();
    
    console.log(`[Process Recurring] Checking recurring templates for day: ${currentDay}`);

    const { data: dueTemplates, error: templateError } = await supabase
      .from("recurring_expense_templates")
      .select("*")
      .eq("is_active", true)
      .eq("schedule_day", currentDay);

    if (templateError) {
      console.error("[Process Recurring] Error fetching recurring templates:", templateError);
    } else {
      console.log(`[Process Recurring] Found ${dueTemplates?.length || 0} templates scheduled for today`);

      for (const template of dueTemplates || []) {
        try {
          // Check if already processed today
          const todayStr = format(todayDate, "yyyy-MM-dd");
          if (template.last_processed_at) {
            const lastProcessed = format(parseISO(template.last_processed_at), "yyyy-MM-dd");
            if (lastProcessed === todayStr) {
              console.log(`[Process Recurring] Template ${template.name} already processed today, skipping`);
              continue;
            }
          }

          // Create expense record
          const { error: expenseError } = await supabase.from("expenses").insert({
            user_id: template.user_id,
            amount: template.amount,
            category: template.category,
            description: template.description || template.name,
            expense_date: todayStr,
            type: "expense",
          });

          if (expenseError) {
            console.error(`[Process Recurring] Error creating expense for template ${template.id}:`, expenseError);
            continue;
          }

          // Update last_processed_at
          const { error: updateError } = await supabase
            .from("recurring_expense_templates")
            .update({ last_processed_at: new Date().toISOString() })
            .eq("id", template.id);

          if (updateError) {
            console.error(`[Process Recurring] Error updating template ${template.id}:`, updateError);
            continue;
          }

          processedItems.push({
            type: "recurring_template",
            name: template.name,
            amount: template.amount,
            userId: template.user_id,
          });

          console.log(`[Process Recurring] Processed recurring template: ${template.name} for user ${template.user_id}`);
        } catch (err) {
          console.error(`[Process Recurring] Error processing template ${template.id}:`, err);
        }
      }
    }

    // Group processed items by user for notification summary
    const userSummary = processedItems.reduce((acc, item) => {
      if (!acc[item.userId]) {
        acc[item.userId] = { subscriptions: [], emis: [], templates: [], total: 0 };
      }
      if (item.type === "subscription") {
        acc[item.userId].subscriptions.push(item.name);
      } else if (item.type === "emi") {
        acc[item.userId].emis.push(item.name);
      } else {
        acc[item.userId].templates.push(item.name);
      }
      acc[item.userId].total += item.amount;
      return acc;
    }, {} as Record<string, { subscriptions: string[]; emis: string[]; templates: string[]; total: number }>);

    console.log(`[Process Recurring] Completed. Processed ${processedItems.length} items for ${Object.keys(userSummary).length} users`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedItems.length,
        subscriptions: processedItems.filter(i => i.type === "subscription").length,
        emis: processedItems.filter(i => i.type === "emi").length,
        templates: processedItems.filter(i => i.type === "recurring_template").length,
        userSummary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[Process Recurring] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
