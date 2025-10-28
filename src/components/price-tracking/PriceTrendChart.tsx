import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { usePriceHistory } from "@/hooks/useTrackedProducts";
import { Loader2 } from "lucide-react";

interface PriceTrendChartProps {
  productId: string;
  productName: string;
}

export const PriceTrendChart = ({ productId, productName }: PriceTrendChartProps) => {
  const { data: priceHistory, isLoading } = usePriceHistory(productId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const chartData = priceHistory?.map((entry) => ({
    date: new Date(entry.recorded_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: Number(entry.price),
  })) || [];

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const avgPrice = chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Trend</CardTitle>
        <CardDescription>{productName}</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No price history available yet
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Lowest</p>
                <p className="text-2xl font-bold text-green-600">₹{minPrice.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Average</p>
                <p className="text-2xl font-bold">₹{avgPrice.toFixed(0).toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Highest</p>
                <p className="text-2xl font-bold text-orange-600">₹{maxPrice.toLocaleString()}</p>
              </div>
            </div>

            <ChartContainer
              config={{
                price: {
                  label: "Price",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-64"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
};