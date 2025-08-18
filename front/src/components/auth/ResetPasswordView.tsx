"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BarChart2, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from '@/hooks/common/useToast';

export const ResetPasswordView = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, verifyResetToken } = useAuth();
  const [mode, setMode] = useState<"request" | "reset">("request");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isValidToken, setIsValidToken] = useState(false);
  const token = searchParams.get('token');
  const { toast } = useToast();

  useEffect(() => {
    const checkForRecoverySession = async () => {
      try {
        const isRecoveryMode = 
          searchParams.get("type") === "recovery" || 
          !!searchParams.get("token") || 
          window.location.hash.includes('access_token=');

        if (isRecoveryMode) {
          setMode("reset");
          const token = searchParams.get("token") || window.location.hash.match(/access_token=([^&]*)/)?.[1];
          if (token) {
            await verifyResetToken(token);
          }
        }
      } catch (err) {
        console.error("Error al verificar la sesión:", err);
      }
    };

    if (typeof window !== 'undefined') {
      checkForRecoverySession();
    }
  }, [searchParams, verifyResetToken]);

  useEffect(() => {
    const validateToken = async () => {
      if (typeof token === 'string') {
        const isValid = await verifyResetToken(token);
        setIsValidToken(isValid);
        if (!isValid) {
          toast({
            title: 'Error',
            description: 'El enlace de restablecimiento de contraseña no es válido o ha expirado',
            variant: 'destructive'
          });
          router.push('/auth/login');
        }
      }
      setIsLoading(false);
    };

    if (token) {
      validateToken();
    }
  }, [token, verifyResetToken, router, toast]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await resetPassword(email, password);
      setSuccess("Se ha enviado un correo con las instrucciones para restablecer tu contraseña.");
    } catch (error: any) {
      setError(error.message || "Error al solicitar restablecimiento de contraseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && confirmPassword) {
      await resetPassword(token || '', password);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10">
        <p>Verificando enlace...</p>
      </div>
    );
  }

  if (!isValidToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row">
          {/* Lado izquierdo - Imagen/Banner */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 md:p-12 md:w-1/2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <BarChart2 className="h-8 w-8" />
                <span className="text-2xl font-bold">Influencer Tracker</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-6">Recupera el acceso a tu cuenta</h1>
              <p className="text-lg opacity-90 mb-8">
                {mode === "request" 
                  ? "Te enviaremos instrucciones para restablecer tu contraseña." 
                  : "Establece una nueva contraseña para tu cuenta."}
              </p>
            </div>
            <div className="hidden md:block opacity-70 text-sm">
              © {new Date().getFullYear()} Influencer Tracker. Todos los derechos reservados.
            </div>
          </div>

          {/* Lado derecho - Formulario */}
          <div className="flex-1 p-8 md:p-12">
            <div className="w-full max-w-md mx-auto">
              <div className="flex items-center gap-2 mb-6">
                <Link href="/login" className="text-blue-600 hover:text-blue-800 flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver al inicio de sesión
                </Link>
              </div>

              <h2 className="text-2xl font-bold mb-2">
                {mode === "request" ? "Recuperar contraseña" : "Restablecer contraseña"}
              </h2>
              <p className="text-gray-500 mb-8">
                {mode === "request" 
                  ? "Ingresa tu correo electrónico y te enviaremos instrucciones" 
                  : "Ingresa tu nueva contraseña"}
              </p>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">{error}</div>}
              {success && <div className="bg-green-50 text-green-600 p-3 rounded-md mb-6 text-sm">{success}</div>}

              {mode === "request" ? (
                <form onSubmit={handleRequestReset} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar instrucciones"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        className="pl-10"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Restableciendo..." : "Restablecer Contraseña"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 