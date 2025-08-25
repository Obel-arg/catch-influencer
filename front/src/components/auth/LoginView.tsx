"use client";

import { useState } from "react";
import { BarChart2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { TwoFactorVerificationModal } from "@/components/auth/TwoFactorVerificationModal";
import { useAuth } from "@/hooks/auth/useAuth";
import { LoginCredentials } from "@/types/auth";
import { GoogleAuthButton } from "./GoogleAuthButton";

export const LoginView = () => {
  const { login, loading, error } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (err) {
      if (err instanceof Error && err.message.includes("2FA")) {
        setShowTwoFactor(true);
      }
    }
  };

  const handleTwoFactorSuccess = () => {
    setShowTwoFactor(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center p-6">
      {/* Formulario Elevado */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BarChart2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              Influencer Tracker
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido de nuevo
          </h2>
          <p className="text-gray-600">Ingresa tus credenciales para acceder</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={credentials.email}
                onChange={(e) =>
                  setCredentials({ ...credentials, email: e.target.value })
                }
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link
                href="/reset-password"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center">
            <Checkbox
              id="remember"
              checked={false}
              onCheckedChange={(checked) => {}}
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Recordarme por 30 días
            </label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
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

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes una cuenta?{" "}
          <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
            Regístrate
          </a>
        </p>
      </div>

      <TwoFactorVerificationModal
        isOpen={showTwoFactor}
        onClose={() => setShowTwoFactor(false)}
        onSuccess={handleTwoFactorSuccess}
      />
    </div>
  );
};