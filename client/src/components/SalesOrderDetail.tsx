import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, X } from 'lucide-react';

interface SalesOrderDetailProps {
  order: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCustomerClick?: (customerId: number) => void;
  onProductClick?: (productId: number) => void;
}

export function SalesOrderDetail({
  order,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onCustomerClick,
  onProductClick,
}: SalesOrderDetailProps) {
  if (!order) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const totalAmount = (Number(order.quantity) || 0) * (Number(order.unitPrice) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Sales Order #{order.id}</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Order Date</p>
                  <p className="font-medium">{order.orderDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                  <button
                    onClick={() => {
                      onCustomerClick?.(order.customerId);
                      onOpenChange(false);
                    }}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    {order.customerName || `Customer #${order.customerId}`}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-semibold">Product</th>
                      <th className="text-right py-2 px-2 font-semibold">Qty</th>
                      <th className="text-right py-2 px-2 font-semibold">Unit Price</th>
                      <th className="text-right py-2 px-2 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">
                        <button
                          onClick={() => {
                            onProductClick?.(order.productId);
                            onOpenChange(false);
                          }}
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          {order.productName || `Product #${order.productId}`}
                        </button>
                      </td>
                      <td className="text-right py-2 px-2">{order.quantity}</td>
                      <td className="text-right py-2 px-2">৳{Number(order.unitPrice).toFixed(2)}</td>
                      <td className="text-right py-2 px-2 font-semibold">৳{totalAmount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Order Total */}
              <div className="mt-4 flex justify-end">
                <div className="bg-blue-50 p-4 rounded-md min-w-[200px]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">৳{totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="text-lg font-bold text-blue-600">৳{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dialog Footer with Actions */}
        <DialogFooter className="flex gap-2 justify-end mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onDelete?.();
              onOpenChange(false);
            }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={() => {
              onEdit?.();
              onOpenChange(false);
            }}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
