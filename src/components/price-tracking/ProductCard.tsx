import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, TrendingDown, TrendingUp, Trash2 } from "lucide-react";
import { TrackedProduct, useTrackedProducts } from "@/hooks/useTrackedProducts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: TrackedProduct;
  onViewDetails: (product: TrackedProduct) => void;
}

export const ProductCard = ({ product, onViewDetails }: ProductCardProps) => {
  const { deleteProduct, toggleProductStatus } = useTrackedProducts();

  const priceStatus = product.target_price
    ? product.current_price <= product.target_price
      ? "below"
      : "above"
    : "none";

  const percentageDiff = product.target_price
    ? ((product.current_price - product.target_price) / product.target_price) * 100
    : 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {product.image_url && (
            <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-lg line-clamp-2">{product.product_name}</h3>
              <Badge variant="secondary">{product.platform}</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">₹{product.current_price.toLocaleString()}</span>
                {product.target_price && (
                  <span className="text-sm text-muted-foreground">
                    Target: ₹{product.target_price.toLocaleString()}
                  </span>
                )}
              </div>

              {product.target_price && (
                <div className="flex items-center gap-2">
                  {priceStatus === "below" ? (
                    <>
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">
                        {Math.abs(percentageDiff).toFixed(1)}% below target
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-orange-600 font-medium">
                        {Math.abs(percentageDiff).toFixed(1)}% above target
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Last checked:</span>
                <span>
                  {product.last_checked_at
                    ? new Date(product.last_checked_at).toLocaleDateString()
                    : "Never"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            checked={product.is_active}
            onCheckedChange={(checked) =>
              toggleProductStatus.mutate({ productId: product.id, isActive: checked })
            }
          />
          <span className="text-sm text-muted-foreground">
            {product.is_active ? "Active" : "Paused"}
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(product.product_url, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(product)}
          >
            View Trends
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to stop tracking this product? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteProduct.mutate(product.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  );
};