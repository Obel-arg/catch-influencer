"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  CheckCircle,
  UserPlus,
  Lock,
  BarChart2,
  Building,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRoleCache } from "@/hooks/auth/useRoleCache";

interface OrganizationInfo {
  name: string;
  description?: string;
}

interface InviterInfo {
  full_name: string;
  email: string;
}

export default function InviteCallbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { saveRoleToCache } = useRoleCache();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState<any>(null);
  const [organizationInfo, setOrganizationInfo] =
    useState<OrganizationInfo | null>(null);
  const [inviterInfo, setInviterInfo] = useState<InviterInfo | null>(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Función para obtener información de la organización
  const fetchOrganizationInfo = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("name, description")
        .eq("id", organizationId)
        .single();

      if (error) {
        console.error("Error obteniendo organización:", error);
        return;
      }

      if (data) {
        setOrganizationInfo({
          name: data.name,
          description: data.description,
        });
      }
    } catch (error) {
      console.error("Error obteniendo información de organización:", error);
    }
  };

  // Función para obtener información del usuario que invitó
  const fetchInviterInfo = async (invitedBy: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("full_name, email")
        .eq("id", invitedBy)
        .single();

      if (error) {
        console.error("Error obteniendo usuario que invitó:", error);
        return;
      }

      if (data) {
        setInviterInfo({
          full_name: data.full_name || "Usuario",
          email: data.email,
        });
      }
    } catch (error) {
      console.error(
        "Error obteniendo información del usuario que invitó:",
        error
      );
    }
  };

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Obtener parámetros de diferentes fuentes posibles
        const urlParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);

        // Intentar obtener tokens de diferentes ubicaciones
        let accessToken =
          urlParams.get("access_token") || hashParams.get("access_token");
        let refreshToken =
          urlParams.get("refresh_token") || hashParams.get("refresh_token");
        let type = urlParams.get("type") || hashParams.get("type");



        // Si no hay type, asumir que es una invitación
        if (!type) {
          type = "invite";
        }



        if (accessToken && refreshToken) {
          
          
          // Establecer la sesión en Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error estableciendo sesión:", error);
            throw error;
          }

          

          if (data.user) {
            const userData = {
              email: data.user.email,
              organization_id: data.user.user_metadata?.organization_id,
              role: data.user.user_metadata?.role,
              invited_by: data.user.user_metadata?.invited_by,
              full_name: data.user.user_metadata?.full_name,
            };

            setUserInfo(userData);

            // Obtener información adicional
            setLoadingDetails(true);

            if (userData.organization_id) {
              await fetchOrganizationInfo(userData.organization_id);
            }

            if (userData.invited_by) {
              await fetchInviterInfo(userData.invited_by);
            }

            setLoadingDetails(false);
          }
        } else {


          // Verificar si hay errores específicos en el hash
          if (window.location.hash.includes("error")) {
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const errorCode = hashParams.get("error_code");
            const errorDescription = hashParams.get("error_description");
            
            if (errorCode === "otp_expired") {
              throw new Error(
                "El enlace de invitación ha expirado. Por favor solicita una nueva invitación."
              );
            } else if (errorCode === "access_denied") {
              throw new Error(
                "Acceso denegado. El enlace puede ser inválido o haber expirado."
              );
            } else {
              throw new Error(
                `Error en la invitación: ${errorDescription || errorCode || "Error desconocido"}`
              );
            }
          }

          // Si no hay tokens ni errores específicos
          throw new Error(
            "No se encontraron los parámetros de invitación. Verifica que el enlace sea correcto."
          );
        }
             } catch (error: any) {
         console.error("Error procesando callback:", error);
         setError(
           error.message || "Error al procesar la invitación. Por favor intenta de nuevo."
         );
       } finally {
        setIsProcessingCallback(false);
      }
    };

    processCallback();
  }, []);

  const validatePassword = (pass: string): string[] => {
    const errors = [];
    if (pass.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(pass)) errors.push("Una mayúscula");
    if (!/[a-z]/.test(pass)) errors.push("Una minúscula");
    if (!/[0-9]/.test(pass)) errors.push("Un número");
    return errors;
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`La contraseña debe tener: ${passwordErrors.join(", ")}`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Actualizar la contraseña del usuario
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      // Guardar datos de sesión
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem("userEmail", user.email || "");
        localStorage.setItem(
          "userName",
          user.user_metadata?.full_name || userInfo?.full_name || ""
        );

        // Crear o actualizar el perfil del usuario con el rol correcto
        try {
          // Primero verificar si el perfil ya existe
          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', user.id)
            .single();

          if (existingProfile) {
            // Actualizar perfil existente
            const { error: profileError } = await supabase
              .from('user_profiles')
              .update({ 
                role: userInfo?.role || 'user',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (profileError) {
              console.warn('Error actualizando perfil:', profileError);
            } else {
               
            }
          } else {
            // Crear nuevo perfil
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: user.id,
                email: user.email,
                full_name: userInfo?.full_name || user.user_metadata?.full_name || '',
                role: userInfo?.role || 'user',
                avatar_url: user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (profileError) {
              console.warn('Error creando perfil:', profileError);
            } else {
            }
          }
          
          // Actualizar el caché de roles
          try {
            saveRoleToCache({
              role: userInfo?.role || 'user',
              organizationId: userInfo?.organization_id || '',
              organizationName: userInfo?.organization_name || '',
              permissions: []
            });
            
          } catch (error) {
            console.warn('Error actualizando caché de roles:', error);
          }
        } catch (error) {
          console.warn('Error creando/actualizando perfil del usuario:', error);
        }
      }

      // Verificar si el usuario ya está en la organización antes de agregarlo
      if (userInfo?.organization_id && user) {
        try {
          const { data: session } = await supabase.auth.getSession();

          // Primero verificar si ya está en la organización
          const checkResponse = await fetch(
            `/api/organizations/${userInfo.organization_id}/members`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.session?.access_token}`,
              },
            }
          );

          if (checkResponse.ok) {
            const members = await checkResponse.json();
            const isAlreadyMember = members.members?.some(
              (member: any) => member.user_id === user.id
            );

            if (!isAlreadyMember) {
              // Agregar el usuario a la organización
              const addResponse = await fetch(
                `/api/organizations/${userInfo.organization_id}/members`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.session?.access_token}`,
                  },
                  body: JSON.stringify({
                    user_id: user.id,
                    role: userInfo.role,
                  }),
                }
              );

              if (addResponse.ok) {
                
              } else {
                const errorText = await addResponse.text();
                console.error(
                  "❌ No se pudo agregar automáticamente a la organización:",
                  addResponse.status,
                  addResponse.statusText,
                  errorText
                );
                
                // Intentar agregar directamente a la base de datos como fallback
                try {
                  const { error: dbError } = await supabase
                    .from('organization_members')
                    .insert({
                      organization_id: userInfo.organization_id,
                      user_id: user.id,
                      role: userInfo.role,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    });
                  
                  if (dbError) {
                    console.error('❌ Error agregando a organización directamente:', dbError);
                  } else {
                    
                  }
                } catch (dbError) {
                  console.error('❌ Error en fallback de organización:', dbError);
                }
              }
            } else {
            }
          } else {
            const errorText = await checkResponse.text();
            console.error(
              "❌ No se pudo verificar si el usuario está en la organización:",
              checkResponse.status,
              checkResponse.statusText,
              errorText
            );
            
            // Si no se puede verificar, intentar agregar directamente
            try {
              const { error: dbError } = await supabase
                .from('organization_members')
                .insert({
                  organization_id: userInfo.organization_id,
                  user_id: user.id,
                  role: userInfo.role,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
              
              if (dbError) {
                console.error('❌ Error agregando a organización directamente:', dbError);
              } else {
                
              }
            } catch (dbError) {
              console.error('❌ Error en fallback de organización:', dbError);
            }
          }
        } catch (error) {
          console.warn(
            "Error verificando/agregando usuario a organización:",
            error
          );
        }
      }

      // Verificar que el usuario tenga acceso completo antes de redirigir
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {

          router.push("/explorer");
        } else {
          console.error('❌ No se pudo verificar la sesión');
          setError("Error al verificar la sesión. Por favor intenta de nuevo.");
        }
      } catch (sessionError) {
        console.error('❌ Error verificando sesión:', sessionError);
        setError("Error al verificar la sesión. Por favor intenta de nuevo.");
      }
    } catch (error: any) {
      console.error("Error estableciendo contraseña:", error);
      setError(
        "Error al establecer la contraseña. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  if (isProcessingCallback) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Lado izquierdo - Banner */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-black via-blue-950 to-black text-white p-12 flex-col justify-center">
          <div className="flex items-center gap-2 mb-12">
            <BarChart2 className="h-8 w-8" />
            <span className="text-2xl font-bold">Catch</span>
          </div>
          <h1 className="text-4xl font-bold mb-6">Procesando invitación...</h1>
          <p className="text-lg opacity-90">
            Estamos configurando tu cuenta. Por favor espera un momento.
          </p>
        </div>
        {/* Lado derecho - Loading */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="h-6 w-6 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Procesando invitación...
            </h2>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !userInfo) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Lado izquierdo - Banner */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-black via-blue-950 to-black text-white p-12 flex-col justify-center">
          <div className="flex items-center gap-2 mb-12">
            <BarChart2 className="h-8 w-8" />
            <span className="text-2xl font-bold">Catch</span>
          </div>
          <h1 className="text-4xl font-bold mb-6">Error en la invitación</h1>
          <p className="text-lg opacity-90">
            Hubo un problema al procesar tu invitación. Por favor contacta al
            administrador.
          </p>
        </div>
        {/* Lado derecho - Error */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-2 text-red-600">
              Error en la invitación
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full !bg-blue-600 !text-white border-2 border-blue-600 font-bold py-3 rounded-lg text-lg shadow-md hover:!bg-blue-700 hover:!border-blue-700 transition-colors"
              >
                Ir al login
              </Button>
              {error.includes("expiró") && (
                <Button
                  onClick={() => router.push("/auth/register")}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 font-medium py-3 rounded-lg"
                >
                  Solicitar nueva invitación
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado izquierdo - Banner */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-black via-blue-950 to-black text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <BarChart2 className="h-8 w-8" />
            <span className="text-2xl font-bold">Catch</span>
          </div>
          <h1 className="text-4xl font-bold mb-6">¡Bienvenido al equipo!</h1>
          <p className="text-lg opacity-90 mb-8">
            Has sido invitado como{" "}
            <span className="font-bold">
              {userInfo?.role === 'admin' ? 'Administrador' : 
               userInfo?.role === 'member' ? 'Miembro' : 
               userInfo?.role === 'viewer' ? 'Visualizador' : 
               userInfo?.role}
            </span> a la plataforma.
            Establece tu contraseña para comenzar a colaborar.
          </p>

          {/* Información del usuario */}
          {userInfo?.full_name && (
            <div className="bg-white/20 p-4 rounded-lg mb-6">
              <p className="font-medium">Hola {userInfo.full_name}!</p>
              <p className="text-sm opacity-80">{userInfo.email}</p>
            </div>
          )}

          {/* Información de la invitación */}
          <div className="space-y-4 mb-8">
            {/* Organización */}
            <div className="bg-white/10 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Building className="h-5 w-5" />
                <h3 className="font-medium">Te está invitando:</h3>
              </div>
              {loadingDetails ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/20 rounded w-1/2"></div>
                </div>
              ) : organizationInfo ? (
                <div>
                  <p className="font-bold text-lg">{organizationInfo.name}</p>
                  {organizationInfo.description && (
                    <p className="text-sm opacity-80">
                      {organizationInfo.description}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm opacity-80">
                  Cargando información de la empresa...
                </p>
              )}
            </div>

            
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Acceso inmediato</h3>
              <p className="opacity-80 text-sm">
                Una vez establecida tu contraseña tendrás acceso completo
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2 rounded-full">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium">Cuenta segura</h3>
              <p className="opacity-80 text-sm">
                Tu información está protegida y cifrada
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Lado derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <BarChart2 className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Influencer Tracker</span>
          </div>

          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Establecer contraseña</h2>
            <p className="text-gray-500">
              Invitado como{" "}
              <span className="font-semibold text-blue-600">
                {userInfo?.role === 'admin' ? 'Administrador' : 
                 userInfo?.role === 'member' ? 'Miembro' : 
                 userInfo?.role === 'viewer' ? 'Visualizador' : 
                 userInfo?.role}
              </span>
              <br />
              <span className="text-sm">{userInfo?.email}</span>
            </p>

            {/* Información móvil */}
            <div className="md:hidden mt-6 space-y-3">
              {organizationInfo && (
                <div className="bg-blue-50 p-3 rounded-lg text-left">
                  <p className="text-sm font-medium text-blue-900">Empresa:</p>
                  <p className="font-bold text-blue-900">
                    {organizationInfo.name}
                  </p>
                </div>
              )}
              
            </div>
          </div>

          <form onSubmit={handleSetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu contraseña"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Requisitos de contraseña */}
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">La contraseña debe tener:</p>
              <ul className="space-y-1">
                <li
                  className={
                    password.length >= 8 ? "text-green-600" : "text-gray-500"
                  }
                >
                  • Mínimo 8 caracteres
                </li>
                <li
                  className={
                    /[A-Z]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  • Una letra mayúscula
                </li>
                <li
                  className={
                    /[a-z]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  • Una letra minúscula
                </li>
                <li
                  className={
                    /[0-9]/.test(password) ? "text-green-600" : "text-gray-500"
                  }
                >
                  • Un número
                </li>
              </ul>
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full !bg-blue-600 !text-white border-2 border-blue-600 font-bold py-3 rounded-lg text-lg shadow-md transition-colors hover:!bg-blue-700 hover:!border-blue-700"
              disabled={loading || !password || !confirmPassword}
            >
              {loading
                ? "Estableciendo..."
                : "Establecer contraseña y continuar"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Al establecer tu contraseña aceptas los términos de uso de la
            plataforma
          </div>
        </div>
      </div>
    </div>
  );
}
