import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Zap, Shield, CheckCircle2 } from "lucide-react";

interface ProductSpec {
  [key: string]: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: ProductSpec & { features: string[] };
}

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  fan: "bg-blue-100 text-blue-800",
  ess: "bg-green-100 text-green-800",
  solar_pv: "bg-yellow-100 text-yellow-800",
  epc_project: "bg-purple-100 text-purple-800",
  testing: "bg-red-100 text-red-800",
  installation: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

export function ProductDetailModal({ open, onOpenChange, product }: ProductDetailModalProps) {
  if (!product) return null;

  const categoryColor = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.other;
  const specs = product.specs || {};
  const features = specs.features || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{product.name}</DialogTitle>
              <DialogDescription className="mt-2">{product.description}</DialogDescription>
            </div>
            <Badge className={categoryColor}>{product.category.replace(/_/g, " ")}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Key Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(specs || {}).map(([key, value]) => {
                  if (key === "features" || !value) return null;
                  return (
                    <div key={key} className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                      <span className="text-lg font-medium text-gray-900">{value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          {features && features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Warranty & Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {specs.warranty && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warranty Period:</span>
                    <span className="font-semibold text-gray-900">{specs.warranty}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Support:</span>
                  <span className="font-semibold text-gray-900">24/7 Available</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
