"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "@/hooks/auth/useAccount";
import { Loader } from "@/components/ui/loader";
import { User, Mail, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PenSquare, Trash2 } from "lucide-react";

export const AccountSettings = () => {
  const { isLoading, userData, formData, handleInputChange } = useAccount();
  const [activeTab, setActiveTab] = useState("personal");
  const [settingsData, setSettingsData] = useState({
    phone: "",
    company: "",
    position: "",
    city: "",
    address: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  // Guardar los datos originales para comparar
  const originalData = useRef(formData);
  const originalSettings = useRef(settingsData);
  useEffect(() => {
    if (userData) {
      originalData.current = { ...formData };
      setSettingsData({
        phone: userData.phone || "",
        company: userData.company || "",
        position: userData.position || "",
        city: userData.city || "",
        address: userData.address || "",
      });
      originalSettings.current = {
        phone: userData.phone || "",
        company: userData.company || "",
        position: userData.position || "",
        city: userData.city || "",
        address: userData.address || "",
      };
      setAvatarPreview(userData.avatar_url || "");
    }
    // eslint-disable-next-line
  }, [userData]);

  // Función para comparar si hay cambios
  const isFormChanged = () => {
    const formChanged = Object.keys(formData).some(
      (key) =>
        formData[key as keyof typeof formData] !==
        originalData.current[key as keyof typeof formData]
    );
    const settingsChanged = Object.keys(settingsData).some(
      (key) =>
        settingsData[key as keyof typeof settingsData] !==
        originalSettings.current[key as keyof typeof settingsData]
    );
    return formChanged || settingsChanged || !!avatarFile;
  };

  // Manejar cambios en settings
  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettingsData((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  // Manejar cambio de avatar (URL)
  const handleAvatarUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    setAvatarPreview(e.target.value);
    setAvatarFile(null);
  };

  // Subir avatar a storage (mock, reemplazar por lógica real si tienes endpoint)
  const uploadAvatar = async (file: File): Promise<string> => {
    // Aquí deberías subir el archivo a tu storage y devolver la URL
    // Por ahora, solo simulo un delay y devuelvo una URL mock
    await new Promise((res) => setTimeout(res, 1000));
    return URL.createObjectURL(file);
  };

  // Refrescar datos después de guardar
  const refreshData = async () => {
    try {
      const [profileRes, settingsRes] = await Promise.all([
        api.get("/users/profile"),
        api.get("/users/settings"),
      ]);
      // Actualizar previews y datos locales si es necesario
      setAvatarPreview(profileRes.data.avatar_url || "");
      setSettingsData({
        phone: settingsRes.data.phone || "",
        company: settingsRes.data.company || "",
        position: settingsRes.data.position || "",
        city: settingsRes.data.city || "",
        address: settingsRes.data.address || "",
      });
    } catch (err) {
      // Manejar error
    }
  };

  // Guardar cambios en ambos endpoints
  const handleSave = async () => {
    setIsSaving(true);
    let avatar_url = formData.avatar_url;
    try {
      // Si hay archivo de avatar, subirlo primero
      if (avatarFile) {
        avatar_url = await uploadAvatar(avatarFile);
      }
      // Normalizar settings: string vacío a null
      const normalizedSettings = Object.fromEntries(
        Object.entries(settingsData).map(([k, v]) => [k, v === "" ? null : v])
      );
      // Actualizar perfil básico
      await api.put("/users/profile", {
        ...formData,
        avatar_url,
      });
      // Actualizar settings
      await api.put("/users/settings", normalizedSettings);
      // Actualizar datos originales para evitar re-guardar
      originalData.current = { ...formData, avatar_url };
      originalSettings.current = { ...settingsData };
      setAvatarFile(null);
      await refreshData();
    } catch (err) {
      // Manejar error
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Tabs Navigation - Outside */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "personal"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <User className="w-4 h-4" />
            Información Personal
          </button>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-0 h-full">
          <div className="grid lg:grid-cols-3 min-h-[600px] h-[600px]">
            {/* Profile Section - Left Side */}
            <div className="lg:col-span-1 border-r border-gray-200 flex flex-col p-6 bg-white h-full">
              <div className="flex flex-1 items-center justify-center h-full w-full">
                <div className="flex flex-col items-center text-center space-y-6 w-full max-w-xs">
                  <div className="relative w-44 h-44 mx-auto">
                    <img
                      src={avatarPreview || "/placeholder.svg"}
                      alt={formData.full_name || "Usuario"}
                      className="w-44 h-44 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition-all"
                      onClick={() => setShowAvatarEdit(true)}
                      title="Editar avatar"
                    >
                      <span role="img" aria-label="Editar">
                        ✏️
                      </span>
                    </button>
                  </div>
                  <div className="space-y-3 w-full">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {formData.full_name || "Usuario"}
                    </h3>
                    <Separator />
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="break-all">{formData.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Último acceso: Hoy</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-gray-500 text-sm">
                        Estado de la cuenta:
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        Activa
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section - Right Side */}
            <div className="lg:col-span-2 h-full p-6 flex flex-col bg-white">
              {activeTab === "personal" && (
                <div className="flex flex-col h-full min-h-[420px]">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Información Personal
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (isFormChanged()) handleSave();
                    }}
                    className="flex-1"
                  >
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label
                            htmlFor="full_name"
                            className="text-sm font-medium text-gray-700"
                          >
                            Nombre completo
                          </label>
                          <Input
                            id="full_name"
                            name="full_name"
                            value={formData.full_name || ""}
                            onChange={handleInputChange}
                            placeholder="Juan Pérez"
                            className="border-gray-300 focus:ring-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                          >
                            Correo electrónico
                          </label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="tu@email.com"
                            type="email"
                            disabled
                            className="border-gray-300 focus:ring-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="phone"
                            className="text-sm font-medium text-gray-700"
                          >
                            Teléfono
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            value={settingsData.phone}
                            onChange={handleSettingsChange}
                            placeholder="Ej: +54 9 11 1234-5678"
                            className="border-gray-300 focus:ring-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="company"
                            className="text-sm font-medium text-gray-700"
                          >
                            Empresa
                          </label>
                          <Input
                            id="company"
                            name="company"
                            value={settingsData.company}
                            onChange={handleSettingsChange}
                            placeholder="Empresa"
                            className="border-gray-300 focus:ring-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="position"
                            className="text-sm font-medium text-gray-700"
                          >
                            Puesto
                          </label>
                          <Input
                            id="position"
                            name="position"
                            value={settingsData.position}
                            onChange={handleSettingsChange}
                            placeholder="Ej: Marketing Manager"
                            className="border-gray-300 focus:ring-gray-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <label
                            htmlFor="city"
                            className="text-sm font-medium text-gray-700"
                          >
                            Ciudad
                          </label>
                          <Input
                            id="city"
                            name="city"
                            value={settingsData.city}
                            onChange={handleSettingsChange}
                            placeholder="Ciudad"
                            className="border-gray-300 focus:ring-gray-400"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label
                            htmlFor="address"
                            className="text-sm font-medium text-gray-700"
                          >
                            Dirección
                          </label>
                          <Input
                            id="address"
                            name="address"
                            value={settingsData.address || ""}
                            onChange={handleSettingsChange}
                            placeholder="Dirección"
                            className="border-gray-300 focus:ring-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full border-t border-gray-200 bg-white py-4 flex justify-end">
                      <Button
                        type="submit"
                        variant="default"
                        size="sm"
                        className="font-medium"
                        disabled={isSaving || !isFormChanged()}
                      >
                        {isSaving ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Guardando...
                          </div>
                        ) : (
                          "Guardar Cambios"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
      {/* Modal grande para editar avatar */}
      <Dialog open={showAvatarEdit} onOpenChange={setShowAvatarEdit}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Editar avatar</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <img
              src={avatarPreview || "/placeholder.svg"}
              alt="Preview avatar"
              className="w-40 h-40 rounded-full object-cover border-4 border-gray-200 shadow-lg"
            />
            <div className="flex w-full gap-2 items-center">
              <input
                type="text"
                id="avatar_url"
                name="avatar_url"
                value={formData.avatar_url}
                onChange={handleAvatarUrlChange}
                placeholder="https://ejemplo.com/avatar.jpg"
                className="border-gray-300 focus:ring-gray-400 w-full text-sm px-2 py-1 rounded"
                disabled={!isEditingAvatar && !!formData.avatar_url}
              />
              <button
                type="button"
                className="text-gray-500 hover:text-blue-600 p-1"
                onClick={() => setIsEditingAvatar(true)}
                disabled={isEditingAvatar && !formData.avatar_url}
                title="Editar"
              >
                <PenSquare size={18} />
              </button>
              <button
                type="button"
                className="text-gray-500 hover:text-red-600 p-1"
                onClick={() => {
                  setIsEditingAvatar(true);
                  handleInputChange({
                    target: { name: "avatar_url", value: "" },
                  } as any);
                  setAvatarPreview("");
                }}
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
