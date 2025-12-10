"use client";

import { useState, useEffect, useMemo } from "react";
import { withAdminOnly } from "@/components/auth/withRole";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, Edit, Mail, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/common/useToast";
import { httpClient } from "@/lib/http";

// Types
interface User {
  id: string;
  user_id: string;
  user_profiles: {
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    user_id: string;
  };
  role: "admin" | "member" | "viewer";
  created_at: string;
}

const ORGANIZATION_ID = "5e931a4d-9103-4f5d-863a-724606b06567";

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editRoleModalOpen, setEditRoleModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member" | "viewer">("member");

  // Edit role
  const [newRole, setNewRole] = useState<"admin" | "member" | "viewer">("member");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const { showToast } = useToast();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Request a high limit to get all users
      const response = await httpClient.get<{ members: any[]; total: number }>(
        `/organizations/${ORGANIZATION_ID}/members?limit=100`
      );
      
      const members = response.data.members || [];
      
      // 🎯 ELIMINAR DUPLICADOS basados en user_id
      const uniqueUsers = Array.from(
        new Map(members.map(user => [user.user_id, user])).values()
      );
      
      setUsers(uniqueUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Invite user
  const handleInvite = async () => {
    if (!inviteEmail || !inviteName) {
      showToast({
        title: "Error",
        description: "Email y nombre son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await httpClient.post(`/organizations/${ORGANIZATION_ID}/invite`, {
        email: inviteEmail,
        full_name: inviteName,
        role: inviteRole,
        brand_ids: [],
      });

      showToast({
        title: "Éxito",
        description: `Invitación enviada a ${inviteEmail}`,
      });

      setInviteModalOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("member");
      await fetchUsers();
    } catch (error: any) {
      console.error("Error inviting user:", error);
      showToast({
        title: "Error",
        description: error.response?.data?.error || "No se pudo enviar la invitación",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Update role
  const handleUpdateRole = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);

      await httpClient.put(
        `/organizations/${ORGANIZATION_ID}/members/${selectedUser.user_id}/role`,
        { role: newRole }
      );

      showToast({
        title: "Éxito",
        description: "Usuario actualizado correctamente",
      });

      setEditRoleModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showToast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      setSubmitting(true);
      await httpClient.delete(
        `/organizations/${ORGANIZATION_ID}/members/${selectedUser.user_id}`
      );

      showToast({
        title: "Éxito",
        description: "Usuario eliminado correctamente",
      });

      setDeleteModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open edit role modal
  const openEditRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setEditRoleModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "member":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "member":
        return "Miembro";
      case "viewer":
        return "Visualizador";
      default:
        return role;
    }
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => {
      const fullName = user.user_profiles?.full_name?.toLowerCase() || "";
      const email = user.user_profiles?.email?.toLowerCase() || "";
      const role = getRoleLabel(user.role).toLowerCase();
      
      return fullName.includes(query) || email.includes(query) || role.includes(query);
    });
  }, [users, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage]);

  // Reset to page 1 when users or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length, searchQuery]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p className="text-gray-500 mt-1">
          Administra los miembros de tu organización
        </p>
      </div>

      {/* Search Bar and Invite Button */}
      <div className="flex gap-3 items-start">
        <div className="flex-1 bg-white rounded-lg p-2 border border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o rol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-0 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 h-9"
            />
          </div>
        </div>
        <Button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 h-[49px] px-4"
        >
          <Plus className="h-4 w-4" />
          Invitar Usuario
        </Button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Ingreso
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="text-gray-500 mt-2">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500">
                      {searchQuery ? "No se encontraron usuarios que coincidan con la búsqueda" : "No hay usuarios en esta organización"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_profiles?.avatar_url || ""} />
                          <AvatarFallback>
                            {(user.user_profiles?.full_name || user.user_profiles?.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.user_profiles?.full_name || "Sin nombre"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {user.user_profiles?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditRoleModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && filteredUsers.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Mostrando {((currentPage - 1) * USERS_PER_PAGE) + 1} - {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} de {filteredUsers.length} usuarios
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  const showEllipsis =
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Invite User Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitar Usuario</DialogTitle>
            <DialogDescription>
              Envía una invitación por correo electrónico para agregar un nuevo miembro
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="member">Miembro</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setInviteModalOpen(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Invitación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={editRoleModalOpen} onOpenChange={setEditRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Rol</DialogTitle>
            <DialogDescription>
              Modifica el rol de {selectedUser?.user_profiles?.full_name || "este usuario"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-role">Nuevo Rol</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="member">Miembro</SelectItem>
                  <SelectItem value="viewer">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRoleModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateRole} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              <strong>{selectedUser?.user_profiles?.full_name || "este usuario"}</strong>?
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAdminOnly(UsersPage);
