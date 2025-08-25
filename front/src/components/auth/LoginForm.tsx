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
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Formulario Elevado */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
          {/* Logo */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-slate-900 rounded-2xl blur-lg opacity-10"></div>
                <img 
                  src="/logo_black.svg" 
                  alt="Catch Logo" 
                  className="relative h-20 w-auto object-contain"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido de vuelta</h1>
            <p className="text-gray-600 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Correo Electrónico</Label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-slate-900 rounded-xl blur opacity-0 group-focus-within:opacity-8 transition-opacity duration-300"></div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-950 transition-colors duration-300" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="tu@email.com"
                    className="pl-12 pr-4 h-14 bg-gray-50/80 border border-gray-200 rounded-xl focus:border-blue-950 focus:ring-4 focus:ring-blue-950/20 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</Label>
                <Link
                  href="/reset-password"
                  className="text-sm text-blue-950 hover:text-black font-medium transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950 to-slate-900 rounded-xl blur opacity-0 group-focus-within:opacity-8 transition-opacity duration-300"></div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 group-focus-within:text-blue-950 transition-colors duration-300" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="••••••••"
                    className={`pl-12 pr-12 h-14 bg-gray-50/80 border rounded-xl focus:border-blue-950 focus:ring-4 focus:ring-blue-950/20 focus:bg-white transition-all duration-300 text-gray-800 placeholder-gray-500 ${
                      loginError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {loginError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {loginError}
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className={`w-full h-14 bg-gradient-to-r from-blue-950 to-black hover:from-black hover:to-blue-950 text-white font-semibold rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 border-0 focus:outline-none focus:ring-0 ${
                isLoading || !email || !password
                  ? "opacity-60 cursor-not-allowed transform-none"
                  : ""
              }`}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          
          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="px-4 text-sm text-gray-500 font-medium">o continúa con</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Google Auth Button */}
          <GoogleAuthButton />
        </div>
      </div>
    </div>
  );
}
