"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Building2, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useRoleCache } from "@/hooks/auth/useRoleCache";

export function MainSidebar() {
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
            icon: <Users className="h-5 w-5" />,
            label: "Usuarios",
          },
        ]
      : []),
  ];

  // Renderizar un skeleton/loading mientras no está hidratado o cargando el rol
  if (!isClient || roleLoading) {
    return (
      <div className="w-16 bg-zinc-900 text-white flex flex-col items-center py-2 border-r border-zinc-800 h-screen fixed">
        <div className="mb-2">
                  <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
          <img 
            src="/dh-logo-white.png" 
            alt="DH Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
        </div>
        {/* No mostrar navegación mientras se carga el usuario */}
      </div>
    );
  }

  return (
    <div className="w-16 bg-zinc-900 text-white flex flex-col items-center py-2 border-r border-zinc-800 h-screen fixed">
      <div className="mb-2">
        <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
          <img 
            src="/dh-logo-white.png" 
            alt="DH Logo" 
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      <nav className="flex flex-col items-center gap-6 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center w-full py-2 px-1 text-center transition-colors",
              isActive(item.path)
                ? "text-white"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-md mb-1",
                isActive(item.path) ? "bg-blue-600" : "bg-transparent"
              )}
            >
              {item.icon}
            </div>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
