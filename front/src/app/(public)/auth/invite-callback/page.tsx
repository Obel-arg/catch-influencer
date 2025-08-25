import dynamic from "next/dynamic";

// Importar el componente dinámicamente para evitar errores de prerendering
const InviteCallbackForm = dynamic(
  () => import("@/components/auth/InviteCallbackForm"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Cargando...</h2>
          <p className="text-gray-600">Procesando tu invitación</p>
        </div>
      </div>
    ),
  }
);

export default function InviteCallbackPage() {
  return <InviteCallbackForm />;
}
