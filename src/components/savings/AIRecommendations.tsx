import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIRecommendationsProps {
  totalExpenses: number;
  totalSavings: number;
  goalsCount: number;
}

export const AIRecommendations = ({ totalExpenses, totalSavings, goalsCount }: AIRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("savings-recommendations", {
        body: {
          expenses: totalExpenses,
          income: totalExpenses * 1.5, // Simplified assumption
          currentSavings: totalSavings,
          goals: goalsCount,
        },
      });

      if (error) throw error;
      setRecommendations(data.recommendations);
    } catch (error: any) {
      console.error("[AI Recommendations Error]", error);
      toast.error("Unable to get recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Savings Recommendations
            </CardTitle>
            <CardDescription>Get personalized advice to reach your goals faster</CardDescription>
          </div>
          <Button onClick={getRecommendations} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Get Advice
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      {recommendations && (
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap text-sm">{recommendations}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};