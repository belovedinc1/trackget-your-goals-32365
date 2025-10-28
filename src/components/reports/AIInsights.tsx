import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ReportData } from "@/hooks/useReportData";
import { Skeleton } from "@/components/ui/skeleton";

interface AIInsightsProps {
  reportData: ReportData;
}

const AIInsights = ({ reportData }: AIInsightsProps) => {
  const [insights, setInsights] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-report-insights", {
        body: { reportData },
      });

      if (error) throw error;

      setInsights(data.insights);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast.error("Failed to generate AI insights");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Financial Insights
        </CardTitle>
        <CardDescription>Get personalized recommendations based on your data</CardDescription>
      </CardHeader>
      <CardContent>
        {!insights && !isLoading && (
          <Button onClick={generateInsights} className="w-full">
            Generate AI Insights
          </Button>
        )}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {insights && !isLoading && (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{insights}</p>
            </div>
            <Button onClick={generateInsights} variant="outline" size="sm">
              Regenerate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIInsights;
