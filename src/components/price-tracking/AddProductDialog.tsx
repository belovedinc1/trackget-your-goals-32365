import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useTrackedProducts } from "@/hooks/useTrackedProducts";

const PLATFORMS = [
  "Amazon",
  "Flipkart",
  "Myntra",
  "Ajio",
  "Snapdeal",
  "Meesho",
  "Other",
];

export const AddProductDialog = () => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_name: "",
    product_url: "",
    current_price: "",
    target_price: "",
    platform: "",
    image_url: "",
  });

  const { addProduct } = useTrackedProducts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await addProduct.mutateAsync({
      product_name: formData.product_name,
      product_url: formData.product_url,
      current_price: parseFloat(formData.current_price),
      target_price: formData.target_price ? parseFloat(formData.target_price) : undefined,
      platform: formData.platform,
      image_url: formData.image_url || undefined,
    });

    setFormData({
      product_name: "",
      product_url: "",
      current_price: "",
      target_price: "",
      platform: "",
      image_url: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Track Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Track New Product</DialogTitle>
          <DialogDescription>
            Add a product to monitor its price and receive alerts when it drops.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_name">Product Name</Label>
            <Input
              id="product_name"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              placeholder="e.g., Sony WH-1000XM5 Headphones"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_url">Product URL</Label>
            <Input
              id="product_url"
              type="url"
              value={formData.product_url}
              onChange={(e) => setFormData({ ...formData, product_url: e.target.value })}
              placeholder="https://..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current_price">Current Price (₹)</Label>
              <Input
                id="current_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.current_price}
                onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                placeholder="29999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_price">Target Price (₹)</Label>
              <Input
                id="target_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.target_price}
                onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                placeholder="25000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((platform) => (
                  <SelectItem key={platform} value={platform}>
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL (Optional)</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addProduct.isPending}>
              {addProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};