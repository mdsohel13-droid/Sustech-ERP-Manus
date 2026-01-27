import { useState, useEffect } from 'react';
import { FormDialog, FormContainer, FormGrid, FormSection } from '@/components/FormDialog';
import { TextInput, NumberInput, DateInput, SelectInput, TextareaInput } from '@/components/FormField';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

interface SalesOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: number;
  onSuccess?: () => void;
}

export function SalesOrderForm({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: SalesOrderFormProps) {
  const [formData, setFormData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    customerId: '',
    productId: '',
    quantity: '',
    unitPrice: '',
    status: 'pending',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const utils = trpc.useUtils();
  const { data: customers } = trpc.customers?.getAll?.useQuery() || { data: [] };
  const { data: products } = trpc.products?.getAll?.useQuery() || { data: [] };

  const createMutation = trpc.sales?.createOrder?.useMutation?.({
    onSuccess: () => {
      utils.sales?.getAllOrders?.invalidate?.();
      toast.success('Sales order created successfully');
      onOpenChange(false);
      setFormData({
        orderDate: new Date().toISOString().split('T')[0],
        customerId: '',
        productId: '',
        quantity: '',
        unitPrice: '',
        status: 'pending',
        notes: '',
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to create order');
    },
  }) || {};

  const updateMutation = trpc.sales?.updateOrder?.useMutation?.({
    onSuccess: () => {
      utils.sales?.getAllOrders?.invalidate?.();
      toast.success('Sales order updated successfully');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update order');
    },
  }) || {};

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.orderDate) newErrors.orderDate = 'Order date is required';
    if (!formData.customerId) newErrors.customerId = 'Customer is required';
    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    if (Number(formData.quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.unitPrice) newErrors.unitPrice = 'Unit price is required';
    if (Number(formData.unitPrice) <= 0) newErrors.unitPrice = 'Unit price must be greater than 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    const submitData = {
      orderDate: formData.orderDate,
      customerId: Number(formData.customerId),
      productId: Number(formData.productId),
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      status: formData.status,
      notes: formData.notes,
    };

    if (orderId) {
      updateMutation.mutate({ id: orderId, ...submitData } as any);
    } else {
      createMutation.mutate(submitData as any);
    }

    setIsLoading(false);
  };

  const customerOptions = (customers || []).map((c: any) => ({
    value: c.id,
    label: c.name,
  }));

  const productOptions = (products || []).map((p: any) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={orderId ? 'Edit Sales Order' : 'Create Sales Order'}
      onSubmit={handleSubmit}
      isSubmitting={isLoading || createMutation.isPending || updateMutation.isPending}
      size="lg"
    >
      <FormContainer>
        <FormSection title="Order Information">
          <FormGrid columns={2}>
            <DateInput
              label="Order Date"
              value={formData.orderDate}
              onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
              error={errors.orderDate}
              required
            />
            <SelectInput
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Customer & Product">
          <FormGrid columns={2}>
            <SelectInput
              label="Customer"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              error={errors.customerId}
              options={customerOptions}
              placeholder="Select a customer"
              required
            />
            <SelectInput
              label="Product"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              error={errors.productId}
              options={productOptions}
              placeholder="Select a product"
              required
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Order Details">
          <FormGrid columns={2}>
            <NumberInput
              label="Quantity"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              error={errors.quantity}
              placeholder="0"
              required
            />
            <NumberInput
              label="Unit Price"
              value={formData.unitPrice}
              onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
              error={errors.unitPrice}
              placeholder="0.00"
              required
            />
          </FormGrid>
          {formData.quantity && formData.unitPrice && (
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-gray-600">Total Amount:</p>
              <p className="text-lg font-semibold text-blue-600">
                ৳{(Number(formData.quantity) * Number(formData.unitPrice)).toFixed(2)}
              </p>
            </div>
          )}
        </FormSection>

        <FormSection title="Additional Notes">
          <TextareaInput
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any special instructions or notes..."
            rows={3}
          />
        </FormSection>
      </FormContainer>
    </FormDialog>
  );
}
