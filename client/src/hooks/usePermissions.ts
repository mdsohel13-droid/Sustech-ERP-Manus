import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export interface ModulePermission {
  moduleName: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function usePermissions() {
  const { user, loading: authLoading } = useAuth();
  const { data: permissions, isLoading: permissionsLoading } = trpc.permissions.getUserPermissions.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );

  const isLoading = authLoading || permissionsLoading;

  // Admin and owner have full access to everything
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';

  const hasModuleAccess = (moduleName: string): boolean => {
    // Admin has access to everything
    if (isAdmin) return true;
    
    // Manager has access to most modules except settings
    if (isManager && moduleName !== 'settings') return true;
    
    // Check specific permissions for other users
    if (!permissions) return false;
    
    const permission = permissions.find((p: any) => p.moduleName === moduleName);
    return permission?.canView ?? false;
  };

  const canCreate = (moduleName: string): boolean => {
    if (isAdmin) return true;
    if (isManager && moduleName !== 'settings') return true;
    
    if (!permissions) return false;
    const permission = permissions.find((p: any) => p.moduleName === moduleName);
    return permission?.canCreate ?? false;
  };

  const canEdit = (moduleName: string): boolean => {
    if (isAdmin) return true;
    if (isManager && moduleName !== 'settings') return true;
    
    if (!permissions) return false;
    const permission = permissions.find((p: any) => p.moduleName === moduleName);
    return permission?.canEdit ?? false;
  };

  const canDelete = (moduleName: string): boolean => {
    if (isAdmin) return true;
    if (isManager && moduleName !== 'settings') return true;
    
    if (!permissions) return false;
    const permission = permissions.find((p: any) => p.moduleName === moduleName);
    return permission?.canDelete ?? false;
  };

  return {
    isLoading,
    isAdmin,
    isManager,
    permissions,
    hasModuleAccess,
    canCreate,
    canEdit,
    canDelete,
  };
}
