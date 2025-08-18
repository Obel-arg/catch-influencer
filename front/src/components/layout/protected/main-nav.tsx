"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Users, BarChart, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  {
    name: "Explorador",
    href: "/explorer",
    icon: Grid,
  },
  {
    name: "Influencers",
    href: "/influencers",
    icon: Users,
  },
  {
    name: "Analíticas",
    href: "/analytics",
    icon: BarChart,
  },
  {
    name: "Campañas",
    href: "/campaigns",
    icon: Lightbulb,
  },
];

export function MainNav() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Renderizar versión simplificada hasta que esté hidratado
  if (!isClient || !pathname) {
    return (
      <nav className="flex items-center space-x-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.href}
              className="flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-gray-600"
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </div>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === item.href
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
