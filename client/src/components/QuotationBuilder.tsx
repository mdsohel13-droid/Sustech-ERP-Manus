import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/currencyUtils";
import { useCurrency } from "@/contexts/CurrencyContext";

interface QuotationItem {
  id?: number;
  description: string;
  specifications?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  discount: number;
  discountAmount: number;
  finalAmount: number;
  notes?: string;
}

interface QuotationBuilderProps {
  quotationId: number;
  quotationType: "government_tender" | "private_quotation";
  clientName: string;
  referenceId: string;
}

export function QuotationBuilder({
  quotationId,
  quotationType,
  clientName,
  referenceId,
}: QuotationBuilderProps) {
  const { currency } = useCurrency();
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<QuotationItem>({
    description: "",
    specifications: "",
    quantity: 1,
    unit: "pcs",
    unitPrice: 0,
    amount: 0,
    discount: 0,
    discountAmount: 0,
    finalAmount: 0,
    notes: "",
  });

  const { data: quotationItems } = trpc.tenderQuotation.getQuotationItems.useQuery(
    { quotationId },
    { enabled: !!quotationId }
  );

  const createItemMutation = trpc.tenderQuotation.createQuotationItem.useMutation();
  const updateItemMutation = trpc.tenderQuotation.updateQuotationItem.useMutation();
  const deleteItemMutation = trpc.tenderQuotation.deleteQuotationItem.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (quotationItems) {
      setItems(quotationItems);
    }
  }, [quotationItems]);

  const calculateAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateDiscount = (amount: number, discountPercent: number) => {
    return (amount * discountPercent) / 100;
  };

  const handleAddItem = async () => {
    try {
      const amount = calculateAmount(formData.quantity, formData.unitPrice);
      const discountAmount = calculateDiscount(amount, formData.discount);
      const finalAmount = amount - discountAmount;

      if (editingIndex !== null) {
        const item = items[editingIndex];
        if (item.id) {
          await updateItemMutation.mutateAsync({
            id: item.id,
            ...formData,
            amount,
            discountAmount,
            finalAmount,
          });
          toast.success("Item updated successfully");
        }
        const newItems = [...items];
        newItems[editingIndex] = {
          ...formData,
          amount,
          discountAmount,
          finalAmount,
        };
        setItems(newItems);
      } else {
        const result = await createItemMutation.mutateAsync({
          quotationId,
          ...formData,
          amount,
          discountAmount,
          finalAmount,
        });
        setItems([
          ...items,
          {
            id: result.id,
            ...formData,
            amount,
            discountAmount,
            finalAmount,
          },
        ]);
        toast.success("Item added successfully");
      }

      utils.tenderQuotation.getQuotationItems.invalidate({ quotationId });
      setIsDialogOpen(false);
      setEditingIndex(null);
      setFormData({
        description: "",
        specifications: "",
        quantity: 1,
        unit: "pcs",
        unitPrice: 0,
        amount: 0,
        discount: 0,
        discountAmount: 0,
        finalAmount: 0,
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to save item");
    }
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setFormData(items[index]);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (index: number) => {
    try {
      const item = items[index];
      if (item.id) {
        await deleteItemMutation.mutateAsync({ id: item.id });
      }
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      utils.tenderQuotation.getQuotationItems.invalidate({ quotationId });
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discountAmount, 0);
  const total = items.reduce((sum, item) => sum + item.finalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Quotation Builder</h3>
          <p className="text-sm text-muted-foreground">
            {quotationType === "government_tender" ? "Government Tender" : "Private Quotation"} - {referenceId}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingIndex(null);
              setFormData({
                description: "",
                specifications: "",
                quantity: 1,
                unit: "pcs",
                unitPrice: 0,
                amount: 0,
                discount: 0,
                discountAmount: 0,
                finalAmount: 0,
                notes: "",
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingIndex !== null ? "Edit Item" : "Add New Item"}</DialogTitle>
              <DialogDescription>
                Add or edit line items for the quotation
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Product or service description"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="specifications">Specifications</Label>
                <Textarea
                  id="specifications"
                  value={formData.specifications || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, specifications: e.target.value })
                  }
                  placeholder="Detailed specifications (optional)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    placeholder="pcs, kg, m, etc."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Unit Price ({currency})</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount (%)</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Amount</Label>
                  <div className="p-2 bg-muted rounded text-sm font-medium">
                    {formatCurrency(
                      calculateAmount(formData.quantity, formData.unitPrice),
                      currency
                    )}
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional notes (optional)"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem}>
                {editingIndex !== null ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <CardDescription>
            {items.length} item{items.length !== 1 ? "s" : ""} in quotation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No items added yet. Click "Add Item" to start building your quotation.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Final Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.description}</p>
                          {item.specifications && (
                            <p className="text-xs text-muted-foreground">
                              {item.specifications.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.unitPrice, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.amount, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.discount > 0 && (
                          <Badge variant="secondary">
                            {item.discount}% ({formatCurrency(item.discountAmount, currency)})
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.finalAmount, currency)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditItem(index)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {items.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Quotation Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(subtotal, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Discount</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  -{formatCurrency(totalDiscount, currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grand Total</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(total, currency)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
