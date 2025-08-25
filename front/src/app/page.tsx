"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { BarChart2 } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Asegurarnos de que el código solo se ejecute en el cliente
    if (typeof window !== 'undefined') {
      try {
        // Verificar si el usuario está autenticado
        const isAuthenticated = localStorage.getItem("token") !== null

        if (isAuthenticated) {
          // Si está autenticado, redirigir al explorer protegido
          router.push("/explorer")
        } else {
          // Si no está autenticado, redirigir a la landing page en la ruta (public)
          router.push("/landing")
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error)
        // En caso de error, redirigir a landing
        router.push("/landing")
      } finally {
        // Cambiamos el estado loading a falso
        setLoading(false)
      }
    }
  }, [router])

  // Loader con layout visual de login/landing
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panel azul a la izquierda */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-center">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <BarChart2 className="h-8 w-8" />
            <span className="text-2xl font-bold">Catch</span>
          </div>
          <h1 className="text-4xl font-bold mb-6 leading-tight">Cargando...</h1>
          <p className="text-lg opacity-90 mb-8">
            Redirigiendo a la página correspondiente
          </p>
        </div>
      </div>
      {/* Loader a la derecha */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-6"></div>
          <h2 className="text-2xl font-semibold mb-2">Cargando...</h2>
          <p className="text-gray-500">Redirigiendo a la página correspondiente</p>
        </div>
      </div>
    </div>
  )
}

