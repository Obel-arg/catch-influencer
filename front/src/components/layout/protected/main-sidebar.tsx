"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Building2, Search, Users, Contact, PanelRightOpen, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRoleCache } from "@/hooks/auth/useRoleCache";
import { UserProfileDropdown } from "@/components/account/user-profile-dropdown";

export function MainSidebar({ collapsed = false, onToggleCollapse }: { collapsed?: boolean; onToggleCollapse?: () => void }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const {
    isMember,
    isViewer,
    isAdmin,
    isOwner,
    loading: roleLoading,
    isRoleCached,
  } = useRoleCache();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isActive = (path: string) => {
    if (!isClient || !pathname) return false;
    return pathname === path || pathname?.startsWith(path + "/");
  };

  const navItems = [
    {
      path: "/explorer",
      icon: <Search className="h-5 w-5" />,
      label: "Explorer",
    },
    {
      path: "/brands",
      icon: <Building2 className="h-5 w-5" />,
      label: "Marcas",
    },
    {
      path: "/campaigns",
      icon: <Calendar className="h-5 w-5" />,
      label: "Campañas",
    },
    {
      path: "/influencers",
      icon: <Users className="h-5 w-5" />,
      label: "Influencers",
    },
    // Solo mostrar "Usuarios" si el usuario es admin u owner
    // Y si hay caché de rol disponible
    ...(!roleLoading && isRoleCached() && (isAdmin() || isOwner())
      ? [
          {
            path: "/users",
            icon: <Contact className="h-5 w-5" />,
            label: "Usuarios",
          },
        ]
      : []),
  ];

  // Renderizar un skeleton/loading mientras no está hidratado o cargando el rol
  if (!isClient || roleLoading) {
    return (
      <div className={cn(
        collapsed ? "w-20" : "w-56",
        "bg-zinc-900 text-white flex flex-col py-4 border-r border-zinc-800 h-screen fixed"
      )}>
        <div className="mb-8 px-4">
          <div className="h-12 flex items-center justify-center overflow-hidden">
            <img 
              src="/logo_white.svg" 
              alt="DH Logo" 
              className="w-32 h-8 object-contain"
            />
          </div>
        </div>
        {/* No mostrar navegación mientras se carga el usuario */}
      </div>
    );
  }

  return (
    <div className={cn(
      collapsed ? "w-20" : "w-56",
      "bg-zinc-900 text-white flex flex-col py-4 border-r border-zinc-800 h-screen fixed z-20 transition-all duration-300 ease-in-out"
    )}>
      <div className="mb-4 px-4">
        <div className="h-12 flex items-center justify-between overflow-hidden">
          {collapsed ? (
            <div className="flex items-center justify-center w-full h-12">
              <button
                aria-label="Expandir sidebar"
                title="Expandir"
                onClick={onToggleCollapse}
                className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-zinc-800/60 text-zinc-300"
              >
                <PanelRightClose className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <img
                src="/logo_white.svg"
                alt="DH Logo"
                className="w-32 h-8 object-contain"
              />
              <button
                aria-label="Colapsar sidebar"
                title="Colapsar"
                onClick={onToggleCollapse}
                className="ml-2 inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-zinc-800/60 text-zinc-300"
              >
                <PanelRightOpen className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-1 px-4">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex items-center gap-3 w-full py-3 px-3 rounded-lg transition-colors",
              isActive(item.path)
                ? "text-white bg-blue-600"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            <span className={cn("text-sm font-medium", collapsed && "hidden")}>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User menu at the bottom */}
      <div className="px-2 mt-2 w-full">
        <div className={cn("border-t border-zinc-800 pt-3", collapsed && "pt-2") }>
          <UserProfileDropdown variant="sidebar" />
        </div>
      </div>
    </div>
  );
}
