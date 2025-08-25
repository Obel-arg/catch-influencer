import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";


export default function LoginPage() {
  return (
    <Suspense
             fallback={
         <div className="min-h-screen bg-black flex items-center justify-center p-6">
           <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
             <div className="text-center mb-8">
               <div className="flex items-center justify-center mb-6">
                 <img 
                   src="/logo_black.svg" 
                   alt="Catch Logo" 
                   className="h-16 w-auto object-contain"
                 />
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
