import { useState, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Archive,
  Tag,
  DollarSign,
  Box,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Check
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  status: "active" | "draft" | "archived";
  image?: string;
}

// Sample data
const SAMPLE_PRODUCTS: Product[] = [
  { id: 1, name: "Solar Panel 400W", sku: "SP-400W", category: "Solar", price: 25000, cost: 18000, stock: 45, minStock: 10, status: "active" },
  { id: 2, name: "Inverter 5KW", sku: "INV-5KW", category: "Inverter", price: 85000, cost: 65000, stock: 12, minStock: 5, status: "active" },
  { id: 3, name: "Battery 200Ah", sku: "BAT-200", category: "Battery", price: 45000, cost: 35000, stock: 8, minStock: 10, status: "active" },
  { id: 4, name: "Charge Controller 60A", sku: "CC-60A", category: "Controller", price: 12000, cost: 8000, stock: 25, minStock: 15, status: "active" },
  { id: 5, name: "Solar Cable 4mm", sku: "SC-4MM", category: "Accessories", price: 150, cost: 80, stock: 500, minStock: 100, status: "active" },
  { id: 6, name: "MC4 Connector Pair", sku: "MC4-PR", category: "Accessories", price: 200, cost: 100, stock: 200, minStock: 50, status: "active" },
];

const CATEGORIES = ["All", "Solar", "Inverter", "Battery", "Controller", "Accessories"];

export default function Products() {
  const { currency } = useCurrency();
  const [products] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Form state
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    unit: "piece",
    taxRate: "0",
    barcode: "",
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStock = products.filter(p => p.stock <= p.minStock).length;
    const avgMargin = products.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / products.length;
    return { totalProducts, totalValue, lowStock, avgMargin };
  }, [products]);

  const renderFormStep = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU *</label>
                <Input
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  placeholder="e.g., SP-400W"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.filter(c => c !== "All").map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product description..."
                  className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Pricing & Cost</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Selling Price *</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Cost Price *</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input
                    type="number"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <Input
                  type="number"
                  value={newProduct.taxRate}
                  onChange={(e) => setNewProduct({ ...newProduct, taxRate: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Barcode</label>
                <Input
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                  placeholder="Scan or enter barcode"
                  className="mt-1"
                />
              </div>
            </div>
            {newProduct.price && newProduct.cost && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Profit Margin:</strong> {((Number(newProduct.price) - Number(newProduct.cost)) / Number(newProduct.price) * 100).toFixed(1)}%
                  ({formatCurrency(Number(newProduct.price) - Number(newProduct.cost), currency)} per unit)
                </p>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Inventory</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Initial Stock *</label>
                <Input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Minimum Stock Level</label>
                <Input
                  type="number"
                  value={newProduct.minStock}
                  onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit of Measure</label>
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="piece">Piece</option>
                  <option value="kg">Kilogram</option>
                  <option value="meter">Meter</option>
                  <option value="liter">Liter</option>
                  <option value="box">Box</option>
                </select>
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Set minimum stock level to get alerts when inventory runs low.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog and inventory</p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        formStep >= step
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {formStep > step ? <Check className="w-4 h-4" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-0.5 mx-2 ${formStep > step ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-4">
                <span>Basic Info</span>
                <span>Pricing</span>
                <span>Inventory</span>
              </div>

              {renderFormStep()}

              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setFormStep(Math.max(1, formStep - 1))}
                  disabled={formStep === 1}
                >
                  Previous
                </Button>
                {formStep < 3 ? (
                  <Button onClick={() => setFormStep(formStep + 1)}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={() => { setShowAddDialog(false); setFormStep(1); }}>
                    Create Product
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inventory Value</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue, currency)}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Low Stock Items</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Margin</p>
                  <p className="text-2xl font-bold text-green-600">{stats.avgMargin.toFixed(1)}%</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    selectedCategory === cat
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-background shadow-sm" : ""}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{formatCurrency(product.price, currency)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        product.stock <= product.minStock 
                          ? "bg-orange-100 text-orange-700" 
                          : "bg-green-100 text-green-700"
                      }`}>
                        {product.stock} in stock
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Tag className="w-3 h-3" />
                      <span>{product.category}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">Product</th>
                    <th className="text-left p-4 text-sm font-medium">SKU</th>
                    <th className="text-left p-4 text-sm font-medium">Category</th>
                    <th className="text-right p-4 text-sm font-medium">Price</th>
                    <th className="text-right p-4 text-sm font-medium">Cost</th>
                    <th className="text-right p-4 text-sm font-medium">Stock</th>
                    <th className="text-right p-4 text-sm font-medium">Margin</th>
                    <th className="text-center p-4 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="hover:bg-muted/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-sm">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{product.sku}</td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 bg-muted rounded-full">{product.category}</span>
                      </td>
                      <td className="p-4 text-right font-medium">{formatCurrency(product.price, currency)}</td>
                      <td className="p-4 text-right text-muted-foreground">{formatCurrency(product.cost, currency)}</td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          product.stock <= product.minStock 
                            ? "bg-orange-100 text-orange-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4 text-right text-green-600 font-medium">
                        {((product.price - product.cost) / product.price * 100).toFixed(1)}%
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button className="p-1.5 hover:bg-muted rounded-md transition-colors">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 hover:bg-muted rounded-md transition-colors">
                            <Copy className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-md transition-colors">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
