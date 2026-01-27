import { usePermissions } from "@/hooks/usePermissions";
import { Skeleton } from "@/components/ui/skeleton";
import AccessDenied from "@/pages/AccessDenied";

interface ProtectedRouteProps {
  children: React.ReactNode;
  module: string;
  requireCreate?: boolean;
  requireEdit?: boolean;
  requireDelete?: boolean;
}

export function ProtectedRoute({ 
  children, 
  module,
  requireCreate = false,
  requireEdit = false,
  requireDelete = false,
}: ProtectedRouteProps) {
  const { isLoading, hasModuleAccess, canCreate, canEdit, canDelete } = usePermissions();

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Check basic module access
  if (!hasModuleAccess(module)) {
    return <AccessDenied />;
  }

  // Check specific permission requirements
  if (requireCreate && !canCreate(module)) {
    return <AccessDenied />;
  }

  if (requireEdit && !canEdit(module)) {
    return <AccessDenied />;
  }

  if (requireDelete && !canDelete(module)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
