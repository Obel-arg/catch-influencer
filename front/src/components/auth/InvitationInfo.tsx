import { Info, Lock, Users } from "lucide-react";

export function InvitationInfo() {
  return (
    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            🔒 Sistema de Acceso por Invitación
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>¿Cómo funciona?</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Solo usuarios previamente invitados pueden acceder al sistema</li>
              <li>Las invitaciones se envían por correo electrónico</li>
              <li>Una vez invitado, puedes usar Google OAuth para iniciar sesión</li>
              <li>Si no has recibido una invitación, contacta al administrador</li>
            </ul>
            <div className="mt-3 p-2 bg-blue-100 rounded border-l-4 border-blue-400">
              <p className="text-xs text-blue-700">
                <Info className="inline h-3 w-3 mr-1" />
                <strong>Nota:</strong> El botón de Google OAuth es solo para usuarios ya invitados. 
                No se pueden crear nuevas cuentas sin invitación previa.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
