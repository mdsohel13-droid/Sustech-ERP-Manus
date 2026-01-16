import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Trash2, UserCog, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.getAll.useQuery();

  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      toast.success("User role updated successfully");
      setEditingUserId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update role");
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      utils.users.getAll.invalidate();
      toast.success("User created successfully");
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createUserMutation.mutate({
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as "admin" | "manager" | "viewer" | "user",
    });
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate({
      userId,
      role: newRole as "admin" | "manager" | "viewer" | "user",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access to all features including user management";
      case "manager":
        return "Can edit data and manage operations, but cannot manage users";
      case "viewer":
        return "Read-only access to dashboard data";
      case "user":
        return "Standard user access (legacy role)";
      default:
        return "Unknown role";
    }
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="editorial-card max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-center">
              You need administrator privileges to access user management.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1>User Management</h1>
          <p className="text-muted-foreground text-lg mt-2">Manage user roles and permissions</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateUser}>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with specified role and permissions
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" defaultValue="viewer" required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full access</SelectItem>
                      <SelectItem value="manager">Manager - Edit operations</SelectItem>
                      <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                      <SelectItem value="user">User - Standard access</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role Descriptions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="editorial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">Admin</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Full system access including user management, financial data, and all operations.
            </p>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Manager</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Can edit data, manage projects, customers, and team operations. Cannot manage users.
            </p>
          </CardContent>
        </Card>
        <Card className="editorial-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-gray-100 text-gray-800">Viewer</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Read-only access to dashboard data. Cannot create, edit, or delete any records.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="editorial-card">
        <CardHeader>
          <CardTitle>All Users ({users?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Login Method</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        {editingUserId === user.id ? (
                          <Select
                            defaultValue={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value)}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.loginMethod || "-"}</TableCell>
                      <TableCell>
                        {user.lastSignedIn ? format(new Date(user.lastSignedIn), "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        {user.createdAt ? format(new Date(user.createdAt), "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.id !== currentUser?.id && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUserId(editingUserId === user.id ? null : user.id)}
                              >
                                <UserCog className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.name || user.email}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUserMutation.mutate({ userId: user.id })}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                          {user.id === currentUser?.id && (
                            <span className="text-sm text-muted-foreground">(You)</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card className="editorial-card">
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Manager</TableHead>
                <TableHead className="text-center">Viewer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>View Dashboard</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manage Financial Data</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manage Projects & Customers</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manage Team & Attendance</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Generate AI Insights</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>User Management</TableCell>
                <TableCell className="text-center">✓</TableCell>
                <TableCell className="text-center">-</TableCell>
                <TableCell className="text-center">-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
