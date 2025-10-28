import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddProductDialog } from "@/components/price-tracking/AddProductDialog";
import { ProductCard } from "@/components/price-tracking/ProductCard";
import { PriceTrendChart } from "@/components/price-tracking/PriceTrendChart";
import { useTrackedProducts, TrackedProduct } from "@/hooks/useTrackedProducts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Package } from "lucide-react";

const PriceTracking = () => {
  const { products, isLoading } = useTrackedProducts();
  const [selectedProduct, setSelectedProduct] = useState<TrackedProduct | null>(null);

  const activeProducts = products.filter((p) => p.is_active);
  const pausedProducts = products.filter((p) => !p.is_active);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Price Tracking</h1>
          <p className="text-muted-foreground">Monitor product prices and get notified of deals</p>
        </div>
        <AddProductDialog />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products tracked yet</h3>
            <p className="text-muted-foreground text-center mb-6">
              Start tracking products to monitor their prices and get alerts when they drop.
            </p>
            <AddProductDialog />
          </CardContent>
        </Card>
      ) : (
        <>
          {activeProducts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Active Tracking ({activeProducts.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          )}

          {pausedProducts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Paused ({pausedProducts.length})</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {pausedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onViewDetails={setSelectedProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Price History</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <PriceTrendChart
              productId={selectedProduct.id}
              productName={selectedProduct.product_name}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceTracking;
