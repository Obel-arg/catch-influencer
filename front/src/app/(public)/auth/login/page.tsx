import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BarChart2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <BarChart2 className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">
                  Influencer Tracker
                </span>
              </div>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
