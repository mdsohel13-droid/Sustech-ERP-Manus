import { useState, useMemo } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Edit,
  Archive,
  Tag,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Check,
  Undo2,
  Ruler,
  Shield,
  Layers,
  Award
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { formatCurrency } from "@/lib/currencyUtils";
import { trpc } from "@/lib/trpc";

export default function Products() {
  const { currency } = useCurrency();
  const utils = trpc.useUtils();
  
  // View state
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("products");
  
  // Dialog states
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showUnitDialog, setShowUnitDialog] = useState(false);
  const [showBrandDialog, setShowBrandDialog] = useState(false);
  const [showWarrantyDialog, setShowWarrantyDialog] = useState(false);
  
  // Edit states
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [editingWarranty, setEditingWarranty] = useState<any>(null);
  
  // Form step for product creation
  const [formStep, setFormStep] = useState(1);
  
  // Queries
  const { data: products = [], isLoading: loadingProducts } = trpc.products.getActiveProducts.useQuery();
  const { data: archivedProducts = [], isLoading: loadingArchived } = trpc.products.getArchivedProducts.useQuery();
  const { data: categories = [], isLoading: loadingCategories } = trpc.products.getCategories.useQuery();
  const { data: units = [], isLoading: loadingUnits } = trpc.products.getUnits.useQuery();
  const { data: brands = [], isLoading: loadingBrands } = trpc.products.getBrands.useQuery();
  const { data: warranties = [], isLoading: loadingWarranties } = trpc.products.getWarranties.useQuery();
  
  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    categoryId: undefined as number | undefined,
    unitId: undefined as number | undefined,
    brandId: undefined as number | undefined,
    warrantyId: undefined as number | undefined,
    unit: "units",
    description: "",
    purchasePrice: "",
    sellingPrice: "",
    taxRate: "",
    alertQuantity: "",
  });
  
  // Category form state
  const [categoryForm, setCategoryForm] = useState({ name: "", code: "", description: "" });
  
  // Unit form state
  const [unitForm, setUnitForm] = useState({ name: "", shortName: "", allowDecimal: true });
  
  // Brand form state
  const [brandForm, setBrandForm] = useState({ name: "", description: "" });
  
  // Warranty form state
  const [warrantyForm, setWarrantyForm] = useState({ name: "", duration: 12, durationUnit: "months", description: "" });
  
  // Mutations
  const createProduct = trpc.products.createProduct.useMutation({
    onSuccess: () => {
      utils.products.getActiveProducts.invalidate();
      toast.success("Product created successfully");
      setShowProductDialog(false);
      resetProductForm();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateProduct = trpc.products.updateProduct.useMutation({
    onSuccess: () => {
      utils.products.getActiveProducts.invalidate();
      toast.success("Product updated successfully");
      setShowProductDialog(false);
      setEditingProduct(null);
      resetProductForm();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const archiveProduct = trpc.products.archiveProduct.useMutation({
    onSuccess: () => {
      utils.products.getActiveProducts.invalidate();
      utils.products.getArchivedProducts.invalidate();
      toast.success("Product archived successfully");
    },
    onError: (error) => toast.error(error.message),
  });
  
  const restoreProduct = trpc.products.restoreProduct.useMutation({
    onSuccess: () => {
      utils.products.getActiveProducts.invalidate();
      utils.products.getArchivedProducts.invalidate();
      toast.success("Product restored successfully");
    },
    onError: (error) => toast.error(error.message),
  });
  
  // Category mutations
  const createCategory = trpc.products.createCategory.useMutation({
    onSuccess: () => {
      utils.products.getCategories.invalidate();
      toast.success("Category created successfully");
      setShowCategoryDialog(false);
      setCategoryForm({ name: "", code: "", description: "" });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateCategory = trpc.products.updateCategory.useMutation({
    onSuccess: () => {
      utils.products.getCategories.invalidate();
      toast.success("Category updated successfully");
      setShowCategoryDialog(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", code: "", description: "" });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const deleteCategory = trpc.products.deleteCategory.useMutation({
    onSuccess: () => {
      utils.products.getCategories.invalidate();
      toast.success("Category deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
  
  // Unit mutations
  const createUnit = trpc.products.createUnit.useMutation({
    onSuccess: () => {
      utils.products.getUnits.invalidate();
      toast.success("Unit created successfully");
      setShowUnitDialog(false);
      setUnitForm({ name: "", shortName: "", allowDecimal: true });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateUnit = trpc.products.updateUnit.useMutation({
    onSuccess: () => {
      utils.products.getUnits.invalidate();
      toast.success("Unit updated successfully");
      setShowUnitDialog(false);
      setEditingUnit(null);
      setUnitForm({ name: "", shortName: "", allowDecimal: true });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const deleteUnit = trpc.products.deleteUnit.useMutation({
    onSuccess: () => {
      utils.products.getUnits.invalidate();
      toast.success("Unit deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
  
  // Brand mutations
  const createBrand = trpc.products.createBrand.useMutation({
    onSuccess: () => {
      utils.products.getBrands.invalidate();
      toast.success("Brand created successfully");
      setShowBrandDialog(false);
      setBrandForm({ name: "", description: "" });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateBrand = trpc.products.updateBrand.useMutation({
    onSuccess: () => {
      utils.products.getBrands.invalidate();
      toast.success("Brand updated successfully");
      setShowBrandDialog(false);
      setEditingBrand(null);
      setBrandForm({ name: "", description: "" });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const deleteBrand = trpc.products.deleteBrand.useMutation({
    onSuccess: () => {
      utils.products.getBrands.invalidate();
      toast.success("Brand deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
  
  // Warranty mutations
  const createWarranty = trpc.products.createWarranty.useMutation({
    onSuccess: () => {
      utils.products.getWarranties.invalidate();
      toast.success("Warranty created successfully");
      setShowWarrantyDialog(false);
      setWarrantyForm({ name: "", duration: 12, durationUnit: "months", description: "" });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateWarranty = trpc.products.updateWarranty.useMutation({
    onSuccess: () => {
      utils.products.getWarranties.invalidate();
      toast.success("Warranty updated successfully");
      setShowWarrantyDialog(false);
      setEditingWarranty(null);
      setWarrantyForm({ name: "", duration: 12, durationUnit: "months", description: "" });
    },
    onError: (error) => toast.error(error.message),
  });
  
  const deleteWarranty = trpc.products.deleteWarranty.useMutation({
    onSuccess: () => {
      utils.products.getWarranties.invalidate();
      toast.success("Warranty deleted successfully");
    },
    onError: (error) => toast.error(error.message),
  });
  
  // Helper functions
  const resetProductForm = () => {
    setProductForm({
      name: "",
      sku: "",
      barcode: "",
      categoryId: undefined,
      unitId: undefined,
      brandId: undefined,
      warrantyId: undefined,
      unit: "units",
      description: "",
      purchasePrice: "",
      sellingPrice: "",
      taxRate: "",
      alertQuantity: "",
    });
    setFormStep(1);
  };
  
  const openEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      sku: product.sku || "",
      barcode: product.barcode || "",
      categoryId: product.categoryId,
      unitId: product.unitId,
      brandId: product.brandId,
      warrantyId: product.warrantyId,
      unit: product.unit || "units",
      description: product.description || "",
      purchasePrice: product.purchasePrice || "",
      sellingPrice: product.sellingPrice || "",
      taxRate: product.taxRate || "",
      alertQuantity: product.alertQuantity?.toString() || "",
    });
    setShowProductDialog(true);
  };
  
  const handleSaveProduct = () => {
    if (editingProduct) {
      updateProduct.mutate({
        id: editingProduct.id,
        ...productForm,
        alertQuantity: productForm.alertQuantity ? parseInt(productForm.alertQuantity) : undefined,
      });
    } else {
      createProduct.mutate({
        ...productForm,
        alertQuantity: productForm.alertQuantity ? parseInt(productForm.alertQuantity) : undefined,
      });
    }
  };
  
  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product: any) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.categoryId?.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);
  
  // Stats
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum: number, p: any) => sum + (parseFloat(p.sellingPrice || "0") * 1), 0);
    const lowStock = products.filter((p: any) => p.alertQuantity && p.alertQuantity > 0).length;
    return { totalProducts, totalValue, lowStock, archivedCount: archivedProducts.length };
  }, [products, archivedProducts]);
  
  // Helper to get category name from ID
  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return "Uncategorized";
    const cat = categories.find((c: any) => c.id === categoryId);
    return cat?.name || "Uncategorized";
  };
  
  const renderProductForm = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Enter product name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SKU</label>
                <Input
                  value={productForm.sku}
                  onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  placeholder="e.g., SP-400W"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <select
                  value={productForm.categoryId || ""}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">Add categories in the Categories tab first</p>
                )}
              </div>
              {brands.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <select
                    value={productForm.brandId || ""}
                    onChange={(e) => setProductForm({ ...productForm, brandId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select brand</option>
                    {brands.map((brand: any) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
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
            <h3 className="font-medium text-sm text-muted-foreground">Pricing & Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Purchase Price</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input
                    type="number"
                    value={productForm.purchasePrice}
                    onChange={(e) => setProductForm({ ...productForm, purchasePrice: e.target.value })}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Selling Price</label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
                  <Input
                    type="number"
                    value={productForm.sellingPrice}
                    onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <Input
                  type="number"
                  value={productForm.taxRate}
                  onChange={(e) => setProductForm({ ...productForm, taxRate: e.target.value })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Barcode</label>
                <Input
                  value={productForm.barcode}
                  onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                  placeholder="Scan or enter barcode"
                  className="mt-1"
                />
              </div>
              {units.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <select
                    value={productForm.unitId || ""}
                    onChange={(e) => setProductForm({ ...productForm, unitId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select unit</option>
                    {units.map((unit: any) => (
                      <option key={unit.id} value={unit.id}>{unit.name} ({unit.shortName})</option>
                    ))}
                  </select>
                </div>
              )}
              {warranties.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Warranty</label>
                  <select
                    value={productForm.warrantyId || ""}
                    onChange={(e) => setProductForm({ ...productForm, warrantyId: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Select warranty</option>
                    {warranties.map((warranty: any) => (
                      <option key={warranty.id} value={warranty.id}>{warranty.name} ({warranty.duration} {warranty.durationUnit})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Alert Quantity</label>
                <Input
                  type="number"
                  value={productForm.alertQuantity}
                  onChange={(e) => setProductForm({ ...productForm, alertQuantity: e.target.value })}
                  placeholder="Minimum stock level"
                  className="mt-1"
                />
              </div>
            </div>
            {productForm.purchasePrice && productForm.sellingPrice && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Profit Margin:</strong> {((Number(productForm.sellingPrice) - Number(productForm.purchasePrice)) / Number(productForm.sellingPrice) * 100).toFixed(1)}%
                  ({formatCurrency(Number(productForm.sellingPrice) - Number(productForm.purchasePrice), currency)} per unit)
                </p>
              </div>
            )}
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
                  <p className="text-sm text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Brands</p>
                  <p className="text-2xl font-bold">{brands.length}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Archived</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.archivedCount}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Archive className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="units">Units</TabsTrigger>
            <TabsTrigger value="brands">Brands</TabsTrigger>
            <TabsTrigger value="warranties">Warranties</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-background shadow-sm" : ""}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-background shadow-sm" : ""}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
                <Button onClick={() => { resetProductForm(); setEditingProduct(null); setShowProductDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="text-center py-8 text-muted-foreground">Loading products...</div>
            ) : viewMode === "list" ? (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Product</th>
                        <th className="text-left p-4 text-sm font-medium">SKU</th>
                        <th className="text-left p-4 text-sm font-medium">Category</th>
                        <th className="text-right p-4 text-sm font-medium">Purchase Price</th>
                        <th className="text-right p-4 text-sm font-medium">Selling Price</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-muted-foreground">No products found</td>
                        </tr>
                      ) : (
                        filteredProducts.map((product: any) => (
                          <tr key={product.id} className="hover:bg-muted/30">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                  <Package className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <span className="font-medium text-sm">{product.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{product.sku || "-"}</td>
                            <td className="p-4">
                              <span className="text-xs px-2 py-1 bg-muted rounded-full">{getCategoryName(product.categoryId)}</span>
                            </td>
                            <td className="p-4 text-right text-muted-foreground">
                              {product.purchasePrice ? formatCurrency(parseFloat(product.purchasePrice), currency) : "-"}
                            </td>
                            <td className="p-4 text-right font-medium">
                              {product.sellingPrice ? formatCurrency(parseFloat(product.sellingPrice), currency) : "-"}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditProduct(product)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                  onClick={() => archiveProduct.mutate({ id: product.id })}
                                  disabled={archiveProduct.isPending}
                                >
                                  <Archive className="w-4 h-4 mr-1" />
                                  Archive
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product: any) => (
                  <Card key={product.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <Package className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.sku || "No SKU"}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">
                            {product.sellingPrice ? formatCurrency(parseFloat(product.sellingPrice), currency) : "-"}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                            {getCategoryName(product.categoryId)}
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditProduct(product)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 hover:bg-orange-50"
                            onClick={() => archiveProduct.mutate({ id: product.id })}
                          >
                            <Archive className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Product Categories</h3>
                <p className="text-sm text-muted-foreground">Manage dynamic product categories</p>
              </div>
              <Button onClick={() => { setCategoryForm({ name: "", code: "", description: "" }); setEditingCategory(null); setShowCategoryDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Name</th>
                      <th className="text-left p-4 text-sm font-medium">Code</th>
                      <th className="text-left p-4 text-sm font-medium">Description</th>
                      <th className="text-center p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingCategories ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                    ) : categories.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No categories found</td></tr>
                    ) : (
                      categories.map((cat: any) => (
                        <tr key={cat.id} className="hover:bg-muted/30">
                          <td className="p-4 font-medium">{cat.name}</td>
                          <td className="p-4 text-muted-foreground">{cat.code || "-"}</td>
                          <td className="p-4 text-muted-foreground">{cat.description || "-"}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingCategory(cat);
                                setCategoryForm({ name: cat.name, code: cat.code || "", description: cat.description || "" });
                                setShowCategoryDialog(true);
                              }}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteCategory.mutate({ id: cat.id })}>
                                Archive
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Units Tab */}
          <TabsContent value="units" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Units of Measurement</h3>
                <p className="text-sm text-muted-foreground">Manage product units</p>
              </div>
              <Button onClick={() => { setUnitForm({ name: "", shortName: "", allowDecimal: true }); setEditingUnit(null); setShowUnitDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Unit
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Name</th>
                      <th className="text-left p-4 text-sm font-medium">Short Name</th>
                      <th className="text-left p-4 text-sm font-medium">Allow Decimal</th>
                      <th className="text-center p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingUnits ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                    ) : units.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No units found</td></tr>
                    ) : (
                      units.map((unit: any) => (
                        <tr key={unit.id} className="hover:bg-muted/30">
                          <td className="p-4 font-medium">{unit.name}</td>
                          <td className="p-4 text-muted-foreground">{unit.shortName}</td>
                          <td className="p-4">{unit.allowDecimal ? "Yes" : "No"}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingUnit(unit);
                                setUnitForm({ name: unit.name, shortName: unit.shortName, allowDecimal: unit.allowDecimal });
                                setShowUnitDialog(true);
                              }}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteUnit.mutate({ id: unit.id })}>
                                Archive
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brands Tab */}
          <TabsContent value="brands" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Product Brands</h3>
                <p className="text-sm text-muted-foreground">Manage product brands</p>
              </div>
              <Button onClick={() => { setBrandForm({ name: "", description: "" }); setEditingBrand(null); setShowBrandDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Brand
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Name</th>
                      <th className="text-left p-4 text-sm font-medium">Description</th>
                      <th className="text-center p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingBrands ? (
                      <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                    ) : brands.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-8 text-muted-foreground">No brands found</td></tr>
                    ) : (
                      brands.map((brand: any) => (
                        <tr key={brand.id} className="hover:bg-muted/30">
                          <td className="p-4 font-medium">{brand.name}</td>
                          <td className="p-4 text-muted-foreground">{brand.description || "-"}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingBrand(brand);
                                setBrandForm({ name: brand.name, description: brand.description || "" });
                                setShowBrandDialog(true);
                              }}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteBrand.mutate({ id: brand.id })}>
                                Archive
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Warranties Tab */}
          <TabsContent value="warranties" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Product Warranties</h3>
                <p className="text-sm text-muted-foreground">Manage warranty options</p>
              </div>
              <Button onClick={() => { setWarrantyForm({ name: "", duration: 12, durationUnit: "months", description: "" }); setEditingWarranty(null); setShowWarrantyDialog(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Warranty
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium">Name</th>
                      <th className="text-left p-4 text-sm font-medium">Duration</th>
                      <th className="text-left p-4 text-sm font-medium">Description</th>
                      <th className="text-center p-4 text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loadingWarranties ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
                    ) : warranties.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-8 text-muted-foreground">No warranties found</td></tr>
                    ) : (
                      warranties.map((warranty: any) => (
                        <tr key={warranty.id} className="hover:bg-muted/30">
                          <td className="p-4 font-medium">{warranty.name}</td>
                          <td className="p-4 text-muted-foreground">{warranty.duration} {warranty.durationUnit}</td>
                          <td className="p-4 text-muted-foreground">{warranty.description || "-"}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingWarranty(warranty);
                                setWarrantyForm({ name: warranty.name, duration: warranty.duration, durationUnit: warranty.durationUnit, description: warranty.description || "" });
                                setShowWarrantyDialog(true);
                              }}>
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => deleteWarranty.mutate({ id: warranty.id })}>
                                Archive
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archive Tab */}
          <TabsContent value="archive" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Archived Products</CardTitle>
                <CardDescription>Products that have been archived</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingArchived ? (
                  <div className="text-center py-8 text-muted-foreground">Loading archived products...</div>
                ) : archivedProducts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No archived products</div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium">Product</th>
                        <th className="text-left p-4 text-sm font-medium">SKU</th>
                        <th className="text-left p-4 text-sm font-medium">Category</th>
                        <th className="text-left p-4 text-sm font-medium">Archived Date</th>
                        <th className="text-center p-4 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {archivedProducts.map((product: any) => (
                        <tr key={product.id} className="hover:bg-muted/30">
                          <td className="p-4 font-medium">{product.name}</td>
                          <td className="p-4 text-muted-foreground">{product.sku || "-"}</td>
                          <td className="p-4">
                            <span className="text-xs px-2 py-1 bg-muted rounded-full">{getCategoryName(product.categoryId)}</span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {product.archivedAt ? new Date(product.archivedAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => restoreProduct.mutate({ id: product.id })}
                                disabled={restoreProduct.isPending}
                              >
                                <Undo2 className="w-4 h-4 mr-1" />
                                Restore
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Product Dialog */}
        <Dialog open={showProductDialog} onOpenChange={(open) => { if (!open) { setShowProductDialog(false); setEditingProduct(null); resetProductForm(); } else setShowProductDialog(true); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-center justify-between mb-6">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      formStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {formStep > step ? <Check className="w-4 h-4" /> : step}
                  </div>
                  {step < 2 && (
                    <div className={`w-24 h-0.5 mx-2 ${formStep > step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mb-4">
              <span>Basic Info</span>
              <span>Pricing & Details</span>
            </div>

            {renderProductForm()}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setFormStep(Math.max(1, formStep - 1))}
                disabled={formStep === 1}
              >
                Previous
              </Button>
              {formStep < 2 ? (
                <Button onClick={() => setFormStep(formStep + 1)}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSaveProduct} disabled={createProduct.isPending || updateProduct.isPending}>
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input value={categoryForm.code} onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>Cancel</Button>
                <Button onClick={() => editingCategory ? updateCategory.mutate({ id: editingCategory.id, ...categoryForm }) : createCategory.mutate(categoryForm)}>
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Unit Dialog */}
        <Dialog open={showUnitDialog} onOpenChange={setShowUnitDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUnit ? "Edit Unit" : "Add Unit"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} className="mt-1" placeholder="e.g., Kilogram" />
              </div>
              <div>
                <label className="text-sm font-medium">Short Name *</label>
                <Input value={unitForm.shortName} onChange={(e) => setUnitForm({ ...unitForm, shortName: e.target.value })} className="mt-1" placeholder="e.g., kg" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={unitForm.allowDecimal} onChange={(e) => setUnitForm({ ...unitForm, allowDecimal: e.target.checked })} id="allowDecimal" />
                <label htmlFor="allowDecimal" className="text-sm">Allow decimal values</label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUnitDialog(false)}>Cancel</Button>
                <Button onClick={() => editingUnit ? updateUnit.mutate({ id: editingUnit.id, ...unitForm }) : createUnit.mutate(unitForm)}>
                  {editingUnit ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Brand Dialog */}
        <Dialog open={showBrandDialog} onOpenChange={setShowBrandDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBrand ? "Edit Brand" : "Add Brand"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={brandForm.name} onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={brandForm.description} onChange={(e) => setBrandForm({ ...brandForm, description: e.target.value })} className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowBrandDialog(false)}>Cancel</Button>
                <Button onClick={() => editingBrand ? updateBrand.mutate({ id: editingBrand.id, ...brandForm }) : createBrand.mutate(brandForm)}>
                  {editingBrand ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Warranty Dialog */}
        <Dialog open={showWarrantyDialog} onOpenChange={setShowWarrantyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingWarranty ? "Edit Warranty" : "Add Warranty"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input value={warrantyForm.name} onChange={(e) => setWarrantyForm({ ...warrantyForm, name: e.target.value })} className="mt-1" placeholder="e.g., Standard Warranty" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration *</label>
                  <Input type="number" value={warrantyForm.duration} onChange={(e) => setWarrantyForm({ ...warrantyForm, duration: parseInt(e.target.value) || 0 })} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <select value={warrantyForm.durationUnit} onChange={(e) => setWarrantyForm({ ...warrantyForm, durationUnit: e.target.value })} className="mt-1 w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={warrantyForm.description} onChange={(e) => setWarrantyForm({ ...warrantyForm, description: e.target.value })} className="mt-1 w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowWarrantyDialog(false)}>Cancel</Button>
                <Button onClick={() => editingWarranty ? updateWarranty.mutate({ id: editingWarranty.id, ...warrantyForm }) : createWarranty.mutate(warrantyForm)}>
                  {editingWarranty ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
