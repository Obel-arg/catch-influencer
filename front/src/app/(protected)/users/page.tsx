"use client";

import { useState, useEffect, useMemo } from "react";
import { withAdminOnly } from "@/components/auth/withRole";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Trash2, Edit, Mail, ChevronLeft, ChevronRight } from "lucide-react";
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
import { brandService } from "@/lib/services/brands";
import { Brand } from "@/types/brands";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Brand selection
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [brandsError, setBrandsError] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState("");
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  // Edit role
  const [newRole, setNewRole] = useState<"admin" | "member" | "viewer">("member");

  // Edit brand management
  const [editBrands, setEditBrands] = useState<Brand[]>([]);
  const [editSelectedBrandIds, setEditSelectedBrandIds] = useState<string[]>([]);
  const [editLoadingBrands, setEditLoadingBrands] = useState(false);
  const [editBrandSearch, setEditBrandSearch] = useState("");
  const [editBrandsError, setEditBrandsError] = useState<string | null>(null);
  const [editBrandDropdownOpen, setEditBrandDropdownOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  const { showToast } = useToast();

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Request a high limit to get all users
      const response = await httpClient.get<{ members: any[]; total: number }>(
        `/organizations/${ORGANIZATION_ID}/members?limit=100`
      );
      setUsers(response.data.members || []);
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

  // Load brands when invite modal opens
  useEffect(() => {
    if (inviteModalOpen) {
      loadBrands();
    }
  }, [inviteModalOpen]);

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      setBrandsError(null);
      const activeBrands = await brandService.getBrands({ status: 'active' });
      setBrands(activeBrands);
    } catch (error) {
      console.error("Error loading brands:", error);
      setBrandsError("No se pudieron cargar las marcas");
    } finally {
      setLoadingBrands(false);
    }
  };

  // Load brands for edit modal
  const loadEditBrands = async (userId: string) => {
    try {
      setEditLoadingBrands(true);
      setEditBrandsError(null);

      // Load all active brands
      const activeBrands = await brandService.getBrands({ status: 'active' });
      setEditBrands(activeBrands);

      // Load user's current brand assignments
      try {
        const response = await httpClient.get(
          `/user-brands/organizations/${ORGANIZATION_ID}/users/${userId}/brands`
        );
        const userBrandIds = response.data.brands?.map((b: Brand) => b.id) || [];
        setEditSelectedBrandIds(userBrandIds);
      } catch (error) {
        console.error('Error loading user brands:', error);
        setEditSelectedBrandIds([]);
      }
    } catch (error) {
      console.error('Error loading brands for edit:', error);
      setEditBrandsError('No se pudieron cargar las marcas');
    } finally {
      setEditLoadingBrands(false);
    }
  };

  // Filter brands based on search query
  const filteredBrands = brands.filter(brand => {
    const searchLower = brandSearch.toLowerCase();
    return (
      brand.name.toLowerCase().includes(searchLower) ||
      brand.industry?.toLowerCase().includes(searchLower)
    );
  });

  // Handle role change - clear brands if admin selected
  const handleRoleChange = (value: "admin" | "member" | "viewer") => {
    setInviteRole(value);
    if (value === "admin") {
      setSelectedBrandIds([]);
      setBrandSearch("");
      setBrandDropdownOpen(false);
    }
  };

  // Handle brand selection toggle
  const handleBrandToggle = (brandId: string) => {
    setSelectedBrandIds(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Handle brand selection toggle in edit modal
  const handleEditBrandToggle = (brandId: string) => {
    setEditSelectedBrandIds(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  // Handle role change in edit modal
  const handleEditRoleChange = (value: "admin" | "member" | "viewer") => {
    setNewRole(value);
    if (value === "admin") {
      setEditSelectedBrandIds([]);
      setEditBrandSearch("");
    }
  };

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

    // Brand validation for non-admin users
    if (inviteRole !== "admin" && selectedBrandIds.length === 0) {
      showToast({
        title: "Error",
        description: "Debes seleccionar al menos una marca para este rol",
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
        brand_ids: inviteRole === "admin" ? [] : selectedBrandIds,
      });

      showToast({
        title: "Éxito",
        description: `Invitación enviada a ${inviteEmail}`,
      });

      setInviteModalOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInviteRole("member");
      setSelectedBrandIds([]);
      setBrandSearch("");
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

    // Validate brand selection for non-admin users
    if (newRole !== "admin" && editSelectedBrandIds.length === 0) {
      showToast({
        title: "Error",
        description: "Debes seleccionar al menos una marca para este rol",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Update role
      await httpClient.put(
        `/organizations/${ORGANIZATION_ID}/members/${selectedUser.user_id}/role`,
        { role: newRole }
      );

      // Update brands (only for non-admin users)
      if (newRole !== "admin") {
        await httpClient.put(
          `/user-brands/organizations/${ORGANIZATION_ID}/users/${selectedUser.user_id}/brands`,
          { brand_ids: editSelectedBrandIds }
        );
      }

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
    setEditBrandSearch("");
    setEditSelectedBrandIds([]);
    setEditBrandDropdownOpen(false);

    // Load brands
    loadEditBrands(user.user_id);
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

  // Pagination logic
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    return users.slice(startIndex, endIndex);
  }, [users, currentPage]);

  // Reset to page 1 when users change
  useEffect(() => {
    setCurrentPage(1);
  }, [users.length]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 mt-1">
            Administra los miembros de tu organización
          </p>
        </div>
        <Button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2"
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No hay usuarios en esta organización</p>
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
        {!loading && users.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>
                Mostrando {((currentPage - 1) * USERS_PER_PAGE) + 1} - {Math.min(currentPage * USERS_PER_PAGE, users.length)} de {users.length} usuarios
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
              <Select value={inviteRole} onValueChange={handleRoleChange}>
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

            {/* Brand Selection - Only for non-admin roles */}
            {inviteRole !== "admin" && (
              <div className="space-y-3">
                <div>
                  <Label>Marcas *</Label>
                  <p className="text-sm text-gray-500">
                    Selecciona las marcas a las que el usuario tendrá acceso
                  </p>
                </div>

                {loadingBrands ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Cargando marcas...</span>
                  </div>
                ) : brandsError ? (
                  <div className="text-sm text-red-600 py-2">{brandsError}</div>
                ) : brands.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">
                    No hay marcas activas disponibles
                  </div>
                ) : (
                  <div className="relative">
                    {/* Search Input */}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Buscar marcas..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        onFocus={() => setBrandDropdownOpen(true)}
                        className="w-full"
                        autoComplete="off"
                        data-form-type="other"
                        data-lpignore="true"
                      />
                    </div>

                    {/* Dropdown List - Only shows when focused/open */}
                    {brandDropdownOpen && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setBrandDropdownOpen(false)}
                        />

                        {/* Brand List */}
                        <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            {filteredBrands.length === 0 ? (
                              <p className="text-sm text-gray-500 text-center py-2">
                                No se encontraron marcas
                              </p>
                            ) : (
                              filteredBrands.map((brand) => (
                                <div
                                  key={brand.id}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  onClick={() => handleBrandToggle(brand.id)}
                                >
                                  <Checkbox
                                    id={`brand-${brand.id}`}
                                    checked={selectedBrandIds.includes(brand.id)}
                                    onCheckedChange={() => handleBrandToggle(brand.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label
                                    htmlFor={`brand-${brand.id}`}
                                    className="flex items-center space-x-2 text-sm cursor-pointer flex-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {brand.logo_url && (
                                      <img
                                        src={brand.logo_url}
                                        alt={brand.name}
                                        className="h-6 w-6 rounded object-cover"
                                      />
                                    )}
                                    <span className="font-medium">{brand.name}</span>
                                    {brand.industry && (
                                      <span className="text-gray-500 text-xs">({brand.industry})</span>
                                    )}
                                  </label>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Selected count */}
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedBrandIds.length} marca{selectedBrandIds.length !== 1 ? 's' : ''} seleccionada{selectedBrandIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setInviteModalOpen(false);
              setBrandSearch("");
              setSelectedBrandIds([]);
              setBrandDropdownOpen(false);
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cambiar Rol</DialogTitle>
            <DialogDescription>
              Modifica el rol y marcas de {selectedUser?.user_profiles?.full_name || "este usuario"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="new-role">Nuevo Rol</Label>
              <Select value={newRole} onValueChange={handleEditRoleChange}>
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

            {/* Brand Selection - Only for non-admin roles */}
            {newRole !== "admin" && (
              <div className="space-y-3">
                <div>
                  <Label>Marcas *</Label>
                  <p className="text-sm text-gray-500">
                    Selecciona las marcas a las que el usuario tendrá acceso
                  </p>
                </div>

                {editLoadingBrands ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Cargando marcas...</span>
                  </div>
                ) : editBrandsError ? (
                  <div className="text-sm text-red-600 py-2">{editBrandsError}</div>
                ) : editBrands.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">
                    No hay marcas activas disponibles
                  </div>
                ) : (
                  <div className="relative">
                    {/* Search Input */}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Buscar marcas..."
                        value={editBrandSearch}
                        onChange={(e) => setEditBrandSearch(e.target.value)}
                        onFocus={() => setEditBrandDropdownOpen(true)}
                        className="w-full"
                        autoComplete="off"
                        data-form-type="other"
                        data-lpignore="true"
                      />
                    </div>

                    {/* Dropdown List - Only shows when focused/open */}
                    {editBrandDropdownOpen && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setEditBrandDropdownOpen(false)}
                        />

                        {/* Brand List */}
                        <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            {editBrands
                              .filter(brand => {
                                const searchLower = editBrandSearch.toLowerCase();
                                return (
                                  brand.name.toLowerCase().includes(searchLower) ||
                                  brand.industry?.toLowerCase().includes(searchLower)
                                );
                              })
                              .map((brand) => (
                                <div
                                  key={brand.id}
                                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                  onClick={() => handleEditBrandToggle(brand.id)}
                                >
                                  <Checkbox
                                    id={`edit-brand-${brand.id}`}
                                    checked={editSelectedBrandIds.includes(brand.id)}
                                    onCheckedChange={() => handleEditBrandToggle(brand.id)}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <label
                                    htmlFor={`edit-brand-${brand.id}`}
                                    className="flex items-center space-x-2 text-sm cursor-pointer flex-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {brand.logo_url && (
                                      <img
                                        src={brand.logo_url}
                                        alt={brand.name}
                                        className="h-6 w-6 rounded object-cover"
                                      />
                                    )}
                                    <span className="font-medium">{brand.name}</span>
                                    {brand.industry && (
                                      <span className="text-gray-500 text-xs">({brand.industry})</span>
                                    )}
                                  </label>
                                </div>
                              ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Selected count */}
                    <p className="text-xs text-gray-500 mt-2">
                      {editSelectedBrandIds.length} marca{editSelectedBrandIds.length !== 1 ? 's' : ''} seleccionada{editSelectedBrandIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            )}
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
