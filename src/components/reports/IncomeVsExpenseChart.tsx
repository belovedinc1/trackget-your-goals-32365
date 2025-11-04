import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";

interface IncomeVsExpenseChartProps {
  data: Array<{ month: string; income: number; expenses: number }>;
}

const IncomeVsExpenseChart = ({ data }: IncomeVsExpenseChartProps) => {
  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(142, 76%, 36%)", // Green for income
    },
    expenses: {
      label: "Expenses", 
      color: "hsl(0, 84%, 60%)", // Red for expenses
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses</CardTitle>
        <CardDescription>Monthly comparison of income and spending</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="income" fill="var(--color-income)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default IncomeVsExpenseChart;
