"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader } from "@/components/ui/loader";
import {
  Calendar,
  Download,
  Eye,
  ExternalLink,
  Plus,
  Share2,
  Users,
  Globe,
  Mail,
  Phone,
  Target,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Loader2,
  BarChart3,
  DollarSign,
  Search,
  Edit,
  Trash2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useBrandDetail } from "@/hooks/brands";
import { useBrandCampaigns } from "@/hooks/brands/useBrandCampaigns";
import { useBrandInfluencers } from "@/hooks/brands/useBrandInfluencers";
import { useBrandEvolutionData } from "@/hooks/brands/useBrandEvolutionData";
import { brandService } from "@/lib/services/brands";
import { AssignCampaignModal } from "./AssignCampaignModal";
import { EditBrandCampaignModal } from "./EditBrandCampaignModal";
import { BrandInfluencerCard } from "./BrandInfluencerCard";
import { BrandMetricsEvolutionChart } from "./BrandMetricsEvolutionChart";
import { BrandCampaign } from "@/types/brands";
import { useToast } from '@/hooks/common/useToast';

export const BrandDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 🎯 Detectar tab desde URL o usar overview por defecto
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Estado para búsqueda de campañas
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para el modal de edición
  const [editingCampaign, setEditingCampaign] = useState<BrandCampaign | null>(null);
  const [deletingCampaign, setDeletingCampaign] = useState<BrandCampaign | null>(null);
  const { showToast } = useToast();
  
  // Obtener datos reales de la marca
  const { brand, loading, error, refetch } = useBrandDetail(id || '');
  
  // Obtener campañas de la marca
  const { 
    campaigns: brandCampaigns, 
    loading: campaignsLoading, 
    getBrandCampaigns 
  } = useBrandCampaigns();

  // Obtener influencers de la marca
  const { 
    influencers: brandInfluencers, 
    loading: influencersLoading, 
    getBrandInfluencers,
    stats: influencersStats
  } = useBrandInfluencers();

  // Obtener datos de evolución de la marca
  const { 
    evolutionData, 
    evolutionLoading, 
    hasAttemptedLoad 
  } = useBrandEvolutionData(id || '');

  // Filtrar campañas basado en la búsqueda
  const filteredCampaigns = useMemo(() => {
    if (!searchQuery.trim()) {
      return brandCampaigns;
    }
    
    const query = searchQuery.toLowerCase();
    return brandCampaigns.filter((brandCampaign) => {
      const campaignName = brandCampaign.campaigns?.name?.toLowerCase() || '';
      const campaignStatus = brandCampaign.status?.toLowerCase() || '';
      const campaignRole = brandCampaign.role?.toLowerCase() || '';
      
      return campaignName.includes(query) || 
             campaignStatus.includes(query) || 
             campaignRole.includes(query);
    });
  }, [brandCampaigns, searchQuery]);

  // Cargar campañas e influencers cuando se obtiene la marca
  useEffect(() => {
    if (brand?.id) {
      getBrandCampaigns(brand.id);
      getBrandInfluencers(brand.id);
    }
  }, [brand?.id, getBrandCampaigns, getBrandInfluencers]);

  // 🎯 Actualizar tab cuando cambian los parámetros de URL
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['overview', 'campaigns', 'influencers'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Función para refrescar campañas cuando se asigna una nueva
  const handleCampaignAssigned = () => {
    if (brand?.id) {
      // Forzar recarga de las campañas de la marca
      getBrandCampaigns(brand.id);
      // Pequeño delay para asegurar que los datos se actualicen
      setTimeout(() => {
        getBrandCampaigns(brand.id);
      }, 500);
    }
  };

  // Función para refrescar campañas cuando se edita una
  const handleCampaignUpdated = () => {
    if (brand?.id) {
      getBrandCampaigns(brand.id);
    }
  };

  // Función para eliminar asignación de campaña
  const handleDeleteCampaignAssignment = async (brandCampaign: BrandCampaign) => {
    if (!brand) return;

    try {
      await brandService.deleteBrandCampaign(brand.id, brandCampaign.id);
      
      // Mostrar toast de éxito
      showToast({
        title: "¡Asignación eliminada!",
        description: `La campaña "${brandCampaign.campaigns?.name}" ha sido desasignada de esta marca.`,
        status: "success",
      });
      
      // Refrescar la lista de campañas
      if (brand?.id) {
        getBrandCampaigns(brand.id);
      }
    } catch (error: any) {
      console.error('Error deleting brand campaign:', error);
      showToast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la asignación. Inténtalo de nuevo.",
        status: "error",
      });
    } finally {
      setDeletingCampaign(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-2 py-0.5 font-semibold">Activa</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-0.5 font-semibold">Completada</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-0.5 font-semibold">Borrador</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-0.5 font-semibold">Pendiente</Badge>;
      case "inactive":
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-0.5 font-semibold">Inactiva</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-0.5 font-semibold">{status}</Badge>;
    }
  };

  // Mostrar estado de carga con la misma estética
  if (loading) {
    return (
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex flex-col items-center justify-center pt-24 pb-16 space-y-4">
              <Loader 
                variant="primary"
                size="lg"
              />
              <div className="text-center space-y-2">
                <p className="text-lg font-medium text-gray-900">Cargando detalles de la marca</p>
                <p className="text-sm text-gray-500">Obteniendo la información más reciente...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudo cargar con la misma estética
  if (error || !brand) {
    return (
      <div className="flex gap-3">
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="flex flex-col items-center justify-center pt-24 pb-16 space-y-4">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la marca</h2>
                <p className="text-sm text-gray-600 mb-4">{error || 'No se pudo encontrar la marca'}</p>
                <Button onClick={refetch} variant="outline">
                  Reintentar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="flex-1">
        {/* Breadcrumb navigation - mismo estilo que BrandsList header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-2 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver a Marcas</span>
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">{brand.name}</span>
          </div>
        </div>

        {/* Brand header - misma estética que las cards de BrandsList */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center gap-6">
              {/* Brand logo and basic info */}
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <Avatar className="h-24 w-24 rounded-lg shadow-lg">
                  <AvatarImage 
                    src={brand.logo_url} 
                    alt={brand.name} 
                    className="object-contain w-full h-full rounded-lg p-2" 
                  />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 text-4xl font-bold shadow-lg w-full h-full flex items-center justify-center">
                    {brand.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {brand.name}
                    </h1>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-sm px-3 py-1">
                      {brand.industry || 'Sin categoría'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

                         {/* Tabs navigation - diseño mejorado con azul consistente */}
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-8">
               <TabsList className="w-full justify-start bg-white border border-gray-200 rounded-xl h-12 p-1.5 shadow-sm gap-2">
                 <TabsTrigger 
                   value="overview" 
                   className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 rounded-lg h-9 text-sm font-semibold px-6 transition-all duration-200 hover:scale-105 data-[state=active]:hover:bg-blue-700"
                 >
                   <div className="flex items-center gap-2">
                     <BarChart3 className="h-4 w-4" />
                     Dashboard
                   </div>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="campaigns" 
                   className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 rounded-lg h-9 text-sm font-semibold px-6 transition-all duration-200 hover:scale-105 data-[state=active]:hover:bg-blue-700"
                 >
                   <div className="flex items-center gap-2">
                     <Target className="h-4 w-4" />
                     Campañas
                   </div>
                 </TabsTrigger>
                 <TabsTrigger 
                   value="influencers" 
                   className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 rounded-lg h-9 text-sm font-semibold px-6 transition-all duration-200 hover:scale-105 data-[state=active]:hover:bg-blue-700"
                 >
                   <div className="flex items-center gap-2">
                     <Users className="h-4 w-4" />
                     Influencers
                   </div>
                 </TabsTrigger>
               </TabsList>
             </Tabs>
          </div>
        </div>

        {/* Tab content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="m-0">
            <div className="space-y-6">
              {/* Brand Profile Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Brand Information */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Perfil de Marca</h2>
                  </div>
                  <div className="p-6">
                    <div className="prose prose-sm max-w-none text-gray-600 mb-6">
                      <p>{brand.description || 'Sin descripción disponible'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Información General</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-600">Fecha de Creación</div>
                              <div className="text-sm font-semibold text-gray-900">{new Date(brand.created_at).toLocaleDateString()}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Globe className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <div className="text-sm font-medium text-gray-600">País</div>
                              <div className="text-sm font-semibold text-gray-900">{brand.country || 'No especificado'}</div>
                            </div>
                          </div>
                          {brand.website_url && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <Globe className="h-5 w-5 text-purple-500 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-600">Website</div>
                                <div className="text-sm">
                                  <a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center font-semibold">
                                    {brand.website_url}
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">Información de Contacto</h3>
                        <div className="space-y-3">
                          {brand.contact_person && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <Users className="h-5 w-5 text-indigo-500 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-600">Contacto Principal</div>
                                <div className="text-sm font-semibold text-gray-900">{brand.contact_person}</div>
                              </div>
                            </div>
                          )}
                          {brand.contact_email && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <Mail className="h-5 w-5 text-red-500 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-600">Email</div>
                                <div className="text-sm font-semibold text-gray-900">{brand.contact_email}</div>
                              </div>
                            </div>
                          )}
                          {brand.contact_phone && (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <Phone className="h-5 w-5 text-orange-500 mt-0.5" />
                              <div>
                                <div className="text-sm font-medium text-gray-600">Teléfono</div>
                                <div className="text-sm font-semibold text-gray-900">{brand.contact_phone}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Clasificación</h3>
                      <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 px-3 py-1">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          {brand.size ? `Tamaño: ${brand.size}` : 'Tamaño no especificado'}
                        </Badge>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Estado: {brand.status === 'active' ? 'Activa' : brand.status === 'inactive' ? 'Inactiva' : 'Pendiente'}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Moneda: {brand.currency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Summary */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">Resumen de Campañas</h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-6">
                      {/* Métricas principales */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                          <div className="text-2xl font-bold text-blue-600 mb-1">{brand.total_campaigns}</div>
                          <div className="text-sm font-medium text-gray-600">Campañas Totales</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                          <div className="text-2xl font-bold text-emerald-600 mb-1">{brand.total_influencers}</div>
                          <div className="text-sm font-medium text-gray-600">Influencers</div>
                        </div>
                      </div>
                      
                      <Separator />

                      {/* Presupuesto destacado */}
                      <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                        <div className="text-sm font-medium text-gray-600 mb-2">Presupuesto Total</div>
                        <div className="text-3xl font-bold text-purple-600">
                          {new Intl.NumberFormat('es-ES', {
                            style: 'currency',
                            currency: brand.currency || 'EUR'
                          }).format(brand.total_budget)}
                        </div>
                      </div>

                      <Separator />

                      {/* Información adicional */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-600">Estado</div>
                          <Badge 
                            className={`${
                              brand.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                                : brand.status === 'inactive' 
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            } text-sm px-3 py-1`}
                          >
                            {brand.status === 'active' ? 'Activa' : 
                             brand.status === 'inactive' ? 'Inactiva' : 'Pendiente'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-600">Industria</div>
                          <div className="text-sm font-semibold text-gray-900">{brand.industry || 'No especificada'}</div>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm font-medium text-gray-600">Tamaño</div>
                          <div className="text-sm font-semibold text-gray-900">
                            {brand.size ? brand.size.charAt(0).toUpperCase() + brand.size.slice(1) : 'No especificado'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <BrandMetricsEvolutionChart
                evolutionData={evolutionData}
                evolutionLoading={evolutionLoading}
                hasAttemptedLoad={hasAttemptedLoad}
                brandName={brand?.name}
              />


            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="m-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Campañas de {brand.name}</h2>
                <AssignCampaignModal 
                  brandId={brand.id} 
                  brandName={brand.name}
                  onCampaignAssigned={handleCampaignAssigned}
                />
              </div>
              
              <div className="p-6">
                {campaignsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-base font-medium text-gray-600">Cargando campañas...</span>
                  </div>
                ) : brandCampaigns.length === 0 ? (
                   <div className="text-center py-8 text-gray-500">
                     <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                     <p className="text-lg font-semibold text-gray-900 mb-2">No hay campañas asignadas</p>
                     <p className="text-sm text-gray-500 mb-4">Comienza asignando campañas existentes a esta marca</p>
                   </div>
                ) : (
                  <div className="space-y-4">
                    {/* Barra de búsqueda */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar campañas..."
                          className="pl-10 pr-4 h-10"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <div className="text-sm text-gray-500">
                        {filteredCampaigns.length} de {brandCampaigns.length} campañas
                      </div>
                    </div>

                    {/* Lista de campañas en formato tabla */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Campaña
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Fechas
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Presupuesto
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rol
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                                                     <tbody className="bg-white divide-y divide-gray-200">
                             {filteredCampaigns.map((brandCampaign: BrandCampaign) => (
                              <tr key={brandCampaign.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {brandCampaign.campaigns?.name || 'Campaña sin nombre'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(brandCampaign.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-blue-500" />
                                      <span>
                                        {brandCampaign.campaigns?.start_date ? 
                                          new Date(brandCampaign.campaigns.start_date).toLocaleDateString('es-ES', { 
                                            day: 'numeric', 
                                            month: 'short',
                                            year: 'numeric'
                                          }) : 
                                          'Sin fecha'
                                        }
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Target className="h-4 w-4 text-red-500" />
                                      <span className="text-sm text-gray-500">
                                        {brandCampaign.campaigns?.end_date ? 
                                          new Date(brandCampaign.campaigns.end_date).toLocaleDateString('es-ES', { 
                                            day: 'numeric', 
                                            month: 'short',
                                            year: 'numeric'
                                          }) : 
                                          'Sin fecha'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">
                                    {brandCampaign.campaigns?.budget ? 
                                      `$${Number(brandCampaign.campaigns.budget).toLocaleString()} ${brandCampaign.campaigns.currency}` : 
                                      'No asignado'
                                    }
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900 capitalize">
                                    {brandCampaign.role || 'Sponsor'}
                                  </div>
                                </td>
                                                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                   <div className="flex items-center justify-end gap-2">
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="h-8 w-8 p-0 bg-white border-gray-200 hover:bg-gray-50"
                                       onClick={() => router.push(`/campaigns/${brandCampaign.campaigns?.id}?redirect=brands&brandId=${brand.id}&tab=campaigns`)}
                                     >
                                       <Eye className="h-3 w-3" />
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="h-8 w-8 p-0 bg-white border-gray-200 hover:bg-gray-50"
                                       onClick={() => setEditingCampaign(brandCampaign)}
                                     >
                                       <Edit className="h-3 w-3" />
                                     </Button>
                                     <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="h-8 w-8 p-0 bg-white border-red-200 hover:bg-red-50 hover:border-red-300"
                                       onClick={() => setDeletingCampaign(brandCampaign)}
                                     >
                                       <Trash2 className="h-3 w-3 text-red-500" />
                                     </Button>
                                   </div>
                                 </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="influencers" className="m-0">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Influencers de {brand.name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-sm font-medium">
                      {influencersStats.total} influencers
                    </span>
                    <span className="bg-green-100 text-green-600 px-2 py-1 rounded-lg text-sm font-medium">
                      {influencersStats.confirmed} confirmados
                    </span>
                    <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-lg text-sm font-medium">
                      {influencersStats.pending} pendientes
                    </span>
                    <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-lg text-sm font-medium">
                      {influencersStats.campaigns} campañas
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {influencersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-base font-medium text-gray-600">Cargando influencers...</span>
                  </div>
                ) : brandInfluencers.length === 0 ? (
                   <div className="text-center py-8 text-gray-500">
                     <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                     <p className="text-lg font-semibold text-gray-900 mb-2">No hay influencers asignados</p>
                     <p className="text-sm text-gray-500 mb-4">Los influencers aparecerán aquí cuando sean asignados a las campañas de esta marca</p>
                   </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {brandInfluencers.map((brandInfluencer) => (
                      <BrandInfluencerCard
                        key={`${brandInfluencer.id}-${brandInfluencer.campaign_id}`}
                        brandInfluencer={brandInfluencer}
                        brandId={brand.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
                     </TabsContent>
         </Tabs>
       </div>

       {/* Modal de edición de campaña */}
       {editingCampaign && (
         <EditBrandCampaignModal
           brandCampaign={editingCampaign}
           brandName={brand.name}
           onCampaignUpdated={handleCampaignUpdated}
           onClose={() => setEditingCampaign(null)}
         />
       )}

       {/* Modal de confirmación de eliminación */}
       {deletingCampaign && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
             <div className="flex items-center gap-3 mb-4">
               <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                 <Trash2 className="h-5 w-5 text-red-600" />
               </div>
               <div>
                 <h3 className="text-lg font-semibold text-gray-900">Eliminar asignación</h3>
                 <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
               </div>
             </div>
             
             <div className="mb-6">
               <p className="text-gray-700">
                 ¿Estás seguro de que quieres eliminar la asignación de la campaña{" "}
                 <span className="font-semibold text-gray-900">"{deletingCampaign.campaigns?.name}"</span>{" "}
                 a esta marca?
               </p>
             </div>
             
             <div className="flex gap-3 justify-end">
               <Button
                 variant="outline"
                 onClick={() => setDeletingCampaign(null)}
                 className="border-gray-300 text-gray-700 hover:bg-gray-50"
               >
                 Cancelar
               </Button>
               <Button
                 variant="destructive"
                 onClick={() => handleDeleteCampaignAssignment(deletingCampaign)}
                 className="bg-red-600 hover:bg-red-700"
               >
                 Eliminar asignación
               </Button>
             </div>
           </div>
         </div>
       )}
     </div>
   );
 }; 
