import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";

const AIAssistant = () => {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Financial Assistant
        </h1>
        <p className="text-muted-foreground">Get personalized financial advice and insights</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
          <CardDescription>AI assistant features will be available soon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Features include: natural language queries, personalized recommendations, spending analysis, and budget optimization.
          </p>
          
          <div className="flex gap-2 pt-4">
            <Input placeholder="Ask me anything about your finances..." disabled />
            <Button disabled>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;
