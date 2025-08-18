"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { organizationService } from "@/lib/services/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart2 } from "lucide-react";

const industryOptions = [
  "Tecnología", "Salud", "Educación", "Finanzas", "Retail", "Manufactura", "Otro"
];
const sizeOptions = [
  { value: "small", label: "Pequeña (1-10)" },
  { value: "medium", label: "Mediana (11-50)" },
  { value: "large", label: "Grande (51-250)" },
  { value: "enterprise", label: "Enterprise (250+)" }
];

export function CreateOrganizationForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await organizationService.createOrganization({
        name,
        website,
        industry,
        size: size as "small" | "medium" | "large" | "enterprise" | undefined
      });
      router.push("/explorer");
    } catch (err: any) {
      setError(err.message || "Error al crear la organización");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado izquierdo - Banner */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <BarChart2 className="h-8 w-8" />
            <span className="text-2xl font-bold">Influencer Tracker</span>
          </div>
          <h1 className="text-4xl font-bold mb-6">¡Bienvenido!</h1>
          <p className="text-lg opacity-90 mb-8">
            Crea tu organización para comenzar a gestionar tu equipo y campañas.
          </p>
        </div>
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Organización centralizada</h3>
              <p className="opacity-80 text-sm">Gestiona equipos, campañas y métricas desde un solo lugar</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Invita a tu equipo</h3>
              <p className="opacity-80 text-sm">Colabora con tu equipo desde el primer día</p>
            </div>
          </div>
        </div>
      </div>
      {/* Lado derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
            <span className="text-xl font-bold">Influencer Tracker</span>
          </div>
          <h2 className="text-2xl font-bold mb-2">Crear Organización</h2>
          <p className="text-gray-500 mb-8">Completa los datos para crear tu organización</p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Nombre de la organización *</label>
              <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Nombre" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Sitio web *</label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} required placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Industria *</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)} required className="w-full border rounded px-3 py-2 text-gray-700">
                <option value="">Selecciona una industria</option>
                {industryOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium mb-1">Tamaño *</label>
              <select value={size} onChange={e => setSize(e.target.value)} required className="w-full border rounded px-3 py-2 text-gray-700">
                <option value="">Selecciona el tamaño</option>
                {sizeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              type="submit"
              className={`w-full !bg-blue-600 !text-white border-2 border-blue-600 font-bold py-3 rounded-lg text-lg shadow-md transition-colors
                ${loading || !name ? 'opacity-60 cursor-not-allowed' : 'hover:!bg-blue-700 hover:!border-blue-700'}
              `}
              disabled={loading || !name}
            >
              {loading ? "Creando..." : "Crear organización"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 