import { Receipt, PiggyBank, CreditCard, TrendingDown, BarChart3, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Receipt,
    title: "Expense Management",
    description: "Smart categorization, receipt scanning, and real-time spending alerts to keep you on budget.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: PiggyBank,
    title: "Savings Goals",
    description: "Set and track multiple savings goals with visual progress tracking and achievement milestones.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: CreditCard,
    title: "EMI & Loan Tracking",
    description: "Monitor all your EMIs, get payment reminders, and optimize your loan management.",
    color: "text-accent-foreground",
    bgColor: "bg-accent/10",
  },
  {
    icon: TrendingDown,
    title: "Price Monitoring",
    description: "Track product prices across platforms and get instant alerts when prices drop.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: BarChart3,
    title: "Financial Reports",
    description: "Comprehensive analytics, interactive charts, and exportable reports for better insights.",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    icon: MessageSquare,
    title: "AI Assistant",
    description: "Get personalized financial advice, insights, and budget recommendations powered by AI.",
    color: "text-accent-foreground",
    bgColor: "bg-accent/10",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need to Manage Your Finances
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to give you complete control over your financial life
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${feature.bgColor}`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
