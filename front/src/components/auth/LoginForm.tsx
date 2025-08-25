"use client";
import { useState, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/common/useToast";
import { GoogleAuthButton } from "./GoogleAuthButton";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessedError = useRef(false);

  // Detectar errores de Google Auth en la URL
  useEffect(() => {
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    
    if (error && !hasProcessedError.current) {
      hasProcessedError.current = true;

      if (error === "access_denied") {
        setLoginError(
          message || "Solo usuarios invitados pueden acceder al sistema."
        );
        toast({
          title: "Acceso denegado",
          description: message || "Solo usuarios invitados pueden acceder al sistema.",
          variant: "destructive",
        });
      } else if (error === "google_auth_failed") {
        setLoginError(
          "Error al autenticar con Google. Por favor, intenta nuevamente."
        );
        toast({
          title: "Error de autenticación",
          description:
            "Hubo un problema con la autenticación de Google. Intenta de nuevo.",
          variant: "destructive",
        });
      }

      // Limpiar el parámetro de error de la URL después de un pequeño delay
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        url.searchParams.delete("message");
        router.replace(url.pathname + url.search, { scroll: false });
      }, 100);
    }
  }, [searchParams, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    try {
      const user = await login({ email, password });
      // Si llegamos aquí, el login fue exitoso - el hook useAuth maneja navegación
      // No validar email_confirmed_at ya que el backend no lo devuelve y no es necesario
    } catch (error: any) {
      console.error("Error de login:", error);

      // Manejar errores específicos según el status code
      if (error.response?.status === 401) {
        setLoginError("Usuario o contraseña incorrectos");
      } else if (error.response?.status === 403) {
        setLoginError(
          "Debes verificar tu correo electrónico antes de iniciar sesión"
        );
      } else if (
        error?.message?.toLowerCase().includes("verifica tu correo") ||
        error?.message?.toLowerCase().includes("no verificado")
      ) {
        setLoginError(
          "Debes verificar tu correo electrónico antes de iniciar sesión"
        );
      } else {
        setLoginError("Usuario o contraseña incorrectos");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
         <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Formulario Elevado */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
                 {/* Logo */}
         <div className="text-center mb-8">
           <div className="flex items-center justify-center mb-6">
             <img 
               src="/logo_black.svg" 
               alt="Catch Logo" 
               className="h-16 w-auto object-contain"
             />
           </div>
         </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                             <Input
                 id="email"
                 type="email"
                 value={email}
                 onChange={(e) => {
                   setEmail(e.target.value);
                   setLoginError(null);
                 }}
                 placeholder="tu@email.com"
                 className="pl-10 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                 required
               />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Contraseña</Label>
                             <Link
                 href="/reset-password"
                 className="text-sm text-black hover:text-gray-700"
               >
                 ¿Olvidaste tu contraseña?
               </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                             <Input
                 id="password"
                 type={showPassword ? "text" : "password"}
                 value={password}
                 onChange={(e) => {
                   setPassword(e.target.value);
                   setLoginError(null);
                 }}
                 placeholder="••••••••"
                 className={`pl-10 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 focus:border-blue-400 focus:ring-blue-400 ${
                   loginError ? "border-red-500 focus:border-red-500" : ""
                 }`}
                 required
               />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {loginError && (
              <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {loginError}
              </div>
            )}
          </div>
                     <Button
             type="submit"
             className={`w-full !bg-black !text-white border-2 border-black font-bold py-3 rounded-lg text-lg shadow-md transition-colors
                 ${
                   isLoading || !email || !password
                     ? "opacity-60 cursor-not-allowed"
                     : "hover:!bg-gray-800 hover:!border-gray-800"
                 }
               `}
             disabled={isLoading || !email || !password}
           >
             {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
           </Button>
        </form>
        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">o</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

                 {/* Google Auth Button */}
         <GoogleAuthButton />
      </div>
    </div>
  );
}
