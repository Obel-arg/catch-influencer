"use client"

import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserStorage } from "@/hooks/auth/useUserStorage"

export function UserNav() {
  const router = useRouter()
  const { getUserEmail, getUserName, getUserAvatar, getInitials, clearUserDataFromStorage, isHydrated } = useUserStorage()
  
  // Solo obtener los datos si estamos hidratados
  const userEmail = isHydrated ? getUserEmail() : ''
  const userName = isHydrated ? getUserName() : ''
  const userAvatar = isHydrated ? getUserAvatar() : ''
  
  // Función para cerrar sesión
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userData")
      localStorage.removeItem("userName")
    }
    clearUserDataFromStorage()
    router.push("/auth/login")
  }

  // Mostrar un estado de carga hasta que esté hidratado
  if (!isHydrated) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-blue-600 text-white">U</AvatarFallback>
        </Avatar>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} alt="Avatar del usuario" />
            <AvatarFallback className="bg-blue-600 text-white">{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName || "Mi cuenta"}</p>
            <p className="text-xs leading-none text-gray-500">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            Configuración
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 