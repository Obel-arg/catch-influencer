"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import { useUserStorage } from "../../hooks/auth/useUserStorage";

export function UserProfileDropdown({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const {
    getUserEmail,
    getUserName,
    getUserAvatar,
    getInitials,
    clearUserDataFromStorage,
    updateUserDataInStorage,
    isHydrated,
  } = useUserStorage();

  // Al abrir el menú, intentar obtener el usuario actualizado del servidor
  useEffect(() => {
    if (!open || !isHydrated) return;
    const fetchUser = async () => {
      try {
        const data = await authService.getCurrentUser();
        const userFromServer = data.user || data;

        // Actualizar localStorage con datos frescos del servidor
        // Esto activará automáticamente la actualización en todos los componentes
        updateUserDataInStorage({
          id: userFromServer.id,
          email: userFromServer.email,
          full_name: userFromServer.full_name,
          avatar_url: userFromServer.avatar_url,
          phone: userFromServer.phone,
          company: userFromServer.company,
          position: userFromServer.position,
          address: userFromServer.address,
          city: userFromServer.city,
        });
      } catch (error) {
        console.warn(
          "Error al actualizar datos del usuario desde el servidor:",
          error
        );
        // Si falla, simplemente usar los datos del localStorage sin actualizar
      }
    };
    fetchUser();
  }, [open, isHydrated, updateUserDataInStorage]);

  // Solo obtener los datos si estamos hidratados
  const userEmail = isHydrated ? getUserEmail() : "";
  const userName = isHydrated ? getUserName() : "";
  const userAvatar = isHydrated ? getUserAvatar() : "";
  const userInitials = isHydrated ? getInitials() : "U";

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userData");
      localStorage.removeItem("userName");
    }
    clearUserDataFromStorage();
    router.push("/auth/login");
  };

  // Mostrar una versión simplificada hasta que esté hidratado
  if (!isHydrated) {
    return (
      <div className="relative z-50 w-full">
        {variant === "sidebar" ? (
          <div className="w-full px-2">
            <div className="flex items-center gap-3 w-full px-3 py-2 rounded-md bg-zinc-800/40 text-white">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-zinc-700 text-white text-sm">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">Usuario</div>
                <div className="text-[11px] text-zinc-400 truncate">Cargando…</div>
              </div>
            </div>
          </div>
        ) : (
          <button className="outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all ml-6">
            <Avatar className="h-10 w-10 border border-gray-200 transition-all hover:border-gray-300 bg-white shadow-lg rounded-xl">
              <AvatarFallback className="bg-white text-gray-700 font-medium text-base">
                U
              </AvatarFallback>
            </Avatar>
          </button>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative z-50 w-full">
        <PopoverTrigger asChild>
          {variant === "sidebar" ? (
            <button className="w-full px-2">
              <div className="flex items-center gap-3 w-full px-3 py-2 rounded-md bg-zinc-800/40 hover:bg-zinc-800 text-white transition-colors">
                <Avatar className="h-8 w-8">
                  {userAvatar ? (
                    <>
                      <AvatarImage src={userAvatar} alt="Avatar" />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </>
                  ) : (
                    <AvatarFallback className="bg-zinc-700 text-white text-sm">{userInitials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium truncate">{userName || "Usuario"}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{userEmail || "No autenticado"}</div>
                </div>
              </div>
            </button>
          ) : (
            <button className="outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all ml-6">
              <Avatar className="h-10 w-10 border border-gray-200 transition-all hover:border-gray-300 bg-white shadow-lg rounded-xl">
                {userAvatar ? (
                  <>
                    <AvatarImage src={userAvatar} alt="Avatar" />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </>
                ) : (
                  <AvatarFallback className="bg-white text-gray-700 font-medium text-base">
                    {userInitials}
                  </AvatarFallback>
                )}
              </Avatar>
            </button>
          )}
        </PopoverTrigger>
      </div>
      <PopoverContent
        className="w-72 p-0 overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white"
        align="end"
        sideOffset={8}
      >
        <div className="flex flex-col items-center justify-center p-6 bg-white border-b border-gray-200 rounded-t-xl">
          <Avatar className="h-16 w-16 mb-2 border border-gray-200 shadow">
            {userAvatar ? (
              <>
                <AvatarImage src={userAvatar} alt="Avatar" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </>
            ) : (
              <AvatarFallback className="bg-white text-gray-700 font-semibold text-2xl">
                {userInitials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="font-semibold text-gray-900 text-lg mb-1">
            {userName || "Usuario"}
          </div>
          <div className="text-xs text-gray-500 mb-1">
            {userEmail || "No autenticado"}
          </div>
        </div>
        <div className="py-2 bg-white">
          <MenuItem
            href="/account"
            icon={<User size={18} />}
            className="rounded-md font-medium"
          >
            Mi perfil
          </MenuItem>
        </div>
        <Separator className="my-1 bg-gray-200" />
        <div className="py-2 bg-white rounded-b-xl">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors font-medium w-full rounded-md"
            )}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface MenuItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}

function MenuItem({
  href,
  icon,
  children,
  external,
  className,
}: MenuItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors",
        className
      )}
      {...(external && { target: "_blank", rel: "noopener noreferrer" })}
    >
      <span className="text-gray-400">{icon}</span>
      <span>{children}</span>
      {external && (
        <svg
          className="ml-auto h-3.5 w-3.5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      )}
    </Link>
  );
}